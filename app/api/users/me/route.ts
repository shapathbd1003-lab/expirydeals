import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/response'

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
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null
    if (body.business_name !== undefined) data.businessName = body.business_name?.trim() || null
    if (body.business_desc !== undefined) data.businessDesc = body.business_desc?.trim() || null
    if (body.business_city !== undefined) data.businessCity = body.business_city?.trim() || null
    if (body.business_region !== undefined) data.businessRegion = body.business_region?.trim() || null

    const user = await prisma.user.update({ where: { id: auth.user.userId }, data })
    return ok({ id: user.id, full_name: user.fullName, email: user.email, role: user.role })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
