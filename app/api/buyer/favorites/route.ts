import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, paginated, unauthorized, serverError } from '@/lib/response'
import { daysRemaining } from '@/lib/slugify'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(48, parseInt(searchParams.get('per_page') || '24'))

    const [total, favorites] = await Promise.all([
      prisma.favorite.count({ where: { userId: auth.user.userId } }),
      prisma.favorite.findMany({
        where: { userId: auth.user.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          createdAt: true,
          listing: {
            select: {
              id: true,
              slug: true,
              title: true,
              originalPrice: true,
              discountedPrice: true,
              discountPct: true,
              quantity: true,
              expiryDate: true,
              city: true,
              region: true,
              status: true,
              viewCount: true,
              createdAt: true,
              category: { select: { id: true, name: true, slug: true } },
              photos: {
                orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
                take: 1,
                select: { urlThumb: true },
              },
            },
          },
        },
      }),
    ])

    return paginated(
      favorites.map((f) => ({
        ...f.listing,
        originalPrice: f.listing.originalPrice.toString(),
        discountedPrice: f.listing.discountedPrice.toString(),
        discountPct: f.listing.discountPct.toString(),
        days_remaining: daysRemaining(f.listing.expiryDate),
        primary_photo: f.listing.photos[0] || null,
        photos: undefined,
        savedAt: f.createdAt,
      })),
      { page, perPage, total }
    )
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
