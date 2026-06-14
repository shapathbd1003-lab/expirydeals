import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { ok, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return validationError('email is required')

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    // Return ok even if user not found (don't leak existence)
    if (!user || user.emailVerified) return ok({ message: 'If this account exists and needs verification, an email has been sent.' })

    if (!process.env.RESEND_API_KEY) return ok({ message: 'Email service not configured.' })

    // Invalidate old tokens
    await prisma.emailVerification.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    const token = generateVerificationToken()
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    await sendVerificationEmail(user.email, token, user.fullName)
    return ok({ message: 'Verification email sent.' })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
