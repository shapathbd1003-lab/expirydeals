import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'
import { daysRemaining } from '@/lib/slugify'

const LISTING_CARD = {
  id: true, slug: true, title: true,
  originalPrice: true, discountedPrice: true, discountPct: true,
  quantity: true, expiryDate: true, city: true,
  category: { select: { id: true, name: true, slug: true } },
  photos: {
    select: { urlThumb: true, urlMedium: true, isPrimary: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] as any[],
    take: 1,
  },
}

function mapListing(l: any) {
  return {
    ...l,
    originalPrice: l.originalPrice.toString(),
    discountedPrice: l.discountedPrice.toString(),
    discountPct: l.discountPct.toString(),
    days_remaining: daysRemaining(l.expiryDate),
    primary_photo: l.photos[0] || null,
    photos: undefined,
  }
}

export async function GET() {
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const [justAdded, expiringSoon] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: now }, createdAt: { gte: yesterday } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: LISTING_CARD,
      }),
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: now, lte: threeDays } },
        orderBy: { expiryDate: 'asc' },
        take: 12,
        select: LISTING_CARD,
      }),
    ])

    return ok({
      just_added: justAdded.map(mapListing),
      expiring_soon: expiringSoon.map(mapListing),
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
