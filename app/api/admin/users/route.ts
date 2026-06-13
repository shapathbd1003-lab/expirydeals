import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { paginated, forbidden, unauthorized, serverError } from '@/lib/response'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { searchParams } = req.nextUrl
    const q = searchParams.get('q') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(100, parseInt(searchParams.get('per_page') || '25'))

    const where: Prisma.UserWhereInput = {}
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (role && ['user', 'admin'].includes(role)) where.role = role as any
    if (status) where.status = status as any

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true, email: true, fullName: true, role: true, status: true,
          businessName: true, createdAt: true,
          _count: { select: { listings: true } },
        },
      }),
    ])

    return paginated(users, { page, perPage, total })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
