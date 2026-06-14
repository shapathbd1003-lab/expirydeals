import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { ok, conflict, validationError, err, serverError } from '@/lib/response'

const registerAttempts = new Map<string, { count: number; resetAt: number }>()
function checkRegisterRate(ip: string): boolean {
  const now = Date.now()
  const entry = registerAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    registerAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRegisterRate(ip)) return err('RATE_LIMITED', 'Too many accounts created. Try again later.', 429)

    const body = await req.json()
    const { email, password, full_name, phone } = body

    if (!email || !password || !full_name) {
      return validationError('email, password, and full_name are required')
    }
    if (password.length < 8) {
      return validationError('password must be at least 8 characters')
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return conflict('An account with this email already exists')

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'user',
        fullName: full_name,
        phone: phone || null,
        status: 'pending_verification',
      },
    })

    if (!process.env.RESEND_API_KEY) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, status: 'active' },
      })
      return ok({ message: 'Account created! You can now log in.', auto_verified: true }, 201)
    }

    const token = generateVerificationToken()
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    await sendVerificationEmail(user.email, token, user.fullName)
    return ok({ message: 'Verification email sent. Please check your inbox.' }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
