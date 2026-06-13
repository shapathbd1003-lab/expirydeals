import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, hashToken } from '@/lib/auth'
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

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    return ok({ access_token: accessToken, expires_in: 900 })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
