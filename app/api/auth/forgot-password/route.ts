import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { ok, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    // Always return same message to prevent email enumeration
    const msg = { message: "If that email exists, you'll receive a reset link." }
    if (!email) return ok(msg)

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || user.status === 'deleted') return ok(msg)

    const token = generateVerificationToken()
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    await sendPasswordResetEmail(user.email, token)
    return ok(msg)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
