import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { ok, err, serverError } from '@/lib/response'

const resetAttempts = new Map<string, { count: number; resetAt: number }>()
function checkResetRate(ip: string): boolean {
  const now = Date.now()
  const entry = resetAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    resetAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkResetRate(ip)) return err('RATE_LIMITED', 'Too many requests. Try again later.', 429)

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
