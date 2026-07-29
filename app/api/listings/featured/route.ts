import { prisma } from '@/lib/prisma'
import { okCached, serverError } from '@/lib/response'
import { daysRemaining, startOfToday } from '@/lib/slugify'

// Force per-request execution — without this, Next.js statically freezes the
// response (and "today") at build/deploy time since no dynamic APIs are read.
export const dynamic = 'force-dynamic'

const LISTING_CARD = {
  id: true, slug: true, title: true, sellerId: true,
  originalPrice: true, discountedPrice: true, discountPct: true,
  quantity: true, expiryDate: true, city: true,
  category: { select: { id: true, name: true, slug: true } },
  photos: {
    select: { urlThumb: true, isPrimary: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] as any[],
    take: 1,
  },
}

function mapListing(l: any) {
  return {
    ...l,
    sellerId: undefined,
    seller_id: l.sellerId, // so the client can hide the viewer's own listings
    originalPrice: l.originalPrice.toString(),
    discountedPrice: l.discountedPrice.toString(),
    discountPct: l.discountPct.toString(),
    days_remaining: daysRemaining(l.expiryDate),
    primary_photo: l.photos[0] || null,
    photos: undefined,
  }
}

// Public + edge-cached: own-listing filtering happens client-side on the homepage
export async function GET() {
  try {
    const today = startOfToday()
    // "Expiring Soon" = within the next 3 days only
    const threeDays = new Date(today)
    threeDays.setDate(threeDays.getDate() + 3)

    const [justAdded, expiringSoon] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: today } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: LISTING_CARD,
      }),
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: today, lte: threeDays } },
        orderBy: { expiryDate: 'asc' },
        take: 12,
        select: LISTING_CARD,
      }),
    ])

    return okCached({
      just_added: justAdded.map(mapListing),
      expiring_soon: expiringSoon.map(mapListing),
    }, 60)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
