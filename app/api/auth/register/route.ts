import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { ok, conflict, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, full_name, phone, role, business_name, business_city, business_region } = body

    if (!email || !password || !full_name || !role) {
      return validationError('email, password, full_name, and role are required')
    }
    if (!['buyer', 'seller'].includes(role)) {
      return validationError('role must be buyer or seller')
    }
    if (password.length < 8) {
      return validationError('password must be at least 8 characters')
    }
    if (role === 'seller' && !business_name) {
      return validationError('business_name is required for sellers')
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return conflict('An account with this email already exists')

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role,
        fullName: full_name,
        phone: phone || null,
        businessName: business_name || null,
        businessCity: business_city || null,
        businessRegion: business_region || null,
        status: 'pending_verification',
      },
    })

    // If no email service configured, auto-verify so users can log in immediately
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
