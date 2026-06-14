import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ok, validationError, err, serverError } from '@/lib/response'

const resetAttempts = new Map<string, { count: number; resetAt: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = resetAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    resetAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRate(ip)) return err('RATE_LIMITED', 'Too many attempts. Try again later.', 429)

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
