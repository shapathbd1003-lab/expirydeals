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

// Brute-force protection: max 10 login attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
function checkLoginRate(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkLoginRate(ip)) {
      return err('RATE_LIMITED', 'Too many login attempts. Try again in 15 minutes.', 429)
    }

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
    if (!user.emailVerified) {
      return err('FORBIDDEN', 'Please verify your email address before logging in. Check your inbox for the verification link.', 403)
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })
    const refreshToken = generateRefreshToken()
    const tokenHash = hashToken(refreshToken)

    await Promise.all([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      // Prune expired/revoked tokens for this user to keep table small
      prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
          OR: [
            { expiresAt: { lt: new Date() } },
            { revokedAt: { not: null } },
          ],
        },
      }),
    ])

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
