import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { paginated, forbidden, unauthorized, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') || 'open'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(50, parseInt(searchParams.get('per_page') || '25'))

    const where = status === 'all' ? {} : { status: status as any }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          listing: { select: { id: true, title: true, slug: true, status: true } },
          reporter: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ])

    return paginated(reports, { page, perPage, total })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
