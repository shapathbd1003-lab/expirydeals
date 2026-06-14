import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, validationError, err, serverError } from '@/lib/response'

const verifyAttempts = new Map<string, { count: number; resetAt: number }>()
function checkRate(ip: string): boolean {
  const now = Date.now()
  const entry = verifyAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    verifyAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRate(ip)) return err('RATE_LIMITED', 'Too many attempts. Try again later.', 429)

    const { token } = await req.json()
    if (!token) return validationError('token is required')

    const record = await prisma.emailVerification.findUnique({ where: { token } })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return validationError('Invalid or expired verification link')
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true, status: 'active' },
      }),
      prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ])

    return ok({ message: 'Email verified successfully.' })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
