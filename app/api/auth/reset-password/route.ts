import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ok, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return validationError('token and password are required')
    if (password.length < 8) return validationError('password must be at least 8 characters')

    const record = await prisma.passwordReset.findUnique({ where: { token } })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return validationError('Invalid or expired reset link')
    }

    const passwordHash = await hashPassword(password)
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Revoke all refresh tokens on password change
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    return ok({ message: 'Password updated successfully.' })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
