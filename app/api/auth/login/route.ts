import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  setRefreshTokenCookie,
} from '@/lib/auth'
import { ok, err, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return err('VALIDATION_ERROR', 'email and password are required', 400)
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return err('UNAUTHORIZED', 'Invalid email or password', 401)
    }

    if (user.status === 'suspended') {
      return err('FORBIDDEN', 'Your account has been suspended', 403)
    }
    if (user.status === 'deleted') {
      return err('UNAUTHORIZED', 'Account not found', 401)
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })
    const refreshToken = generateRefreshToken()
    const tokenHash = hashToken(refreshToken)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const res = NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        expires_in: 900,
        user: {
          id: user.id,
          role: user.role,
          full_name: user.fullName,
          email: user.email,
          email_verified: user.emailVerified,
        },
      },
    })

    const cookieOpts = setRefreshTokenCookie(refreshToken)
    res.cookies.set(cookieOpts)
    return res
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
