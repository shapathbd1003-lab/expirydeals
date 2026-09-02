import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
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

    if (!email || !password || !full_name || !phone) {
      return validationError('email, password, full_name, and phone are required')
    }
    if (password.length < 8) {
      return validationError('password must be at least 8 characters')
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return conflict('An account with this email already exists')

    const passwordHash = await hashPassword(password)
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'user',
        fullName: full_name,
        phone: phone,
        status: 'active',
        emailVerified: true,
      },
    })

    return ok({ message: 'Account created! You can now log in.' }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
