import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/response'
import { daysRemaining } from '@/lib/slugify'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const viewed = await prisma.recentlyViewed.findMany({
      where: { userId: auth.user.userId },
      orderBy: { viewedAt: 'desc' },
      take: 50,
      include: {
        listing: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            photos: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
              take: 1,
              select: { urlThumb: true },
            },
          },
        },
      },
    })

    return ok(
      viewed.map((v) => ({
        ...v.listing,
        originalPrice: v.listing.originalPrice.toString(),
        discountedPrice: v.listing.discountedPrice.toString(),
        discountPct: v.listing.discountPct.toString(),
        days_remaining: daysRemaining(v.listing.expiryDate),
        primary_photo: v.listing.photos[0] || null,
        photos: undefined,
        viewedAt: v.viewedAt,
      }))
    )
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
