import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, generateRefreshToken, hashToken, setRefreshTokenCookie } from '@/lib/auth'
import { ok, err, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return err('UNAUTHORIZED', 'No refresh token', 401)

    const tokenHash = hashToken(refreshToken)
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash } })

    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      return err('UNAUTHORIZED', 'Invalid or expired refresh token', 401)
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } })
    if (!user || user.status !== 'active') {
      return err('FORBIDDEN', 'Account is not active', 403)
    }

    // Rotate: revoke old token, issue new one
    const newRefreshToken = generateRefreshToken()
    const newTokenHash = hashToken(newRefreshToken)

    await prisma.$transaction([
      prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ])

    const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email })

    const res = NextResponse.json({ success: true, data: { access_token: accessToken, expires_in: 900 } })
    res.cookies.set(setRefreshTokenCookie(newRefreshToken))
    return res
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
