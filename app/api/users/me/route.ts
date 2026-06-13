import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, verifyPassword, hashPassword } from '@/lib/auth'
import { ok, unauthorized, serverError, err } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      select: {
        id: true, email: true, fullName: true, phone: true, role: true,
        avatarUrl: true, businessName: true, businessDesc: true,
        businessCity: true, businessRegion: true, status: true,
        emailVerified: true, createdAt: true,
      },
    })
    if (!user) return unauthorized()

    return ok({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatarUrl,
      business_name: user.businessName,
      business_desc: user.businessDesc,
      business_city: user.businessCity,
      business_region: user.businessRegion,
      status: user.status,
      email_verified: user.emailVerified,
      created_at: user.createdAt,
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.full_name !== undefined) data.fullName = body.full_name.trim()
    if (body.fullName !== undefined) data.fullName = body.fullName.trim()
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null
    if (body.business_name !== undefined) data.businessName = body.business_name?.trim() || null
    if (body.business_desc !== undefined) data.businessDesc = body.business_desc?.trim() || null
    if (body.business_city !== undefined) data.businessCity = body.business_city?.trim() || null
    if (body.business_region !== undefined) data.businessRegion = body.business_region?.trim() || null

    // Password change
    if (body.new_password) {
      if (!body.current_password) return err('VALIDATION_ERROR', 'Current password is required', 400)
      if (body.new_password.length < 8) return err('VALIDATION_ERROR', 'New password must be at least 8 characters', 400)
      const dbUser = await prisma.user.findUnique({ where: { id: auth.user.userId } })
      if (!dbUser || !(await verifyPassword(body.current_password, dbUser.passwordHash))) {
        return err('UNAUTHORIZED', 'Current password is incorrect', 401)
      }
      data.passwordHash = await hashPassword(body.new_password)
    }

    const user = await prisma.user.update({ where: { id: auth.user.userId }, data })
    return ok({ id: user.id, full_name: user.fullName, email: user.email, role: user.role })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
