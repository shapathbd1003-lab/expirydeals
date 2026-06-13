import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, paginated, forbidden, unauthorized, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const per_page = Math.min(50, parseInt(searchParams.get('per_page') || '20'))

    const where: any = { NOT: { status: 'deleted' } }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { seller: { fullName: { contains: q, mode: 'insensitive' } } },
      ]
    }
    if (status) where.status = status

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * per_page,
        take: per_page,
        include: {
          seller: { select: { id: true, fullName: true, email: true } },
          category: { select: { name: true } },
          photos: { where: { isPrimary: true }, take: 1 },
        },
      }),
    ])

    return paginated(listings, { page, perPage: per_page, total })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
