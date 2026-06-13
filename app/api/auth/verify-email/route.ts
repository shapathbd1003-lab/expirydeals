import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
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
