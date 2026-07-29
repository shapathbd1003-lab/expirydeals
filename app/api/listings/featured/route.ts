import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { okCached, serverError } from '@/lib/response'
import { daysRemaining, startOfToday } from '@/lib/slugify'

// Force per-request execution — without this, Next.js statically freezes the
// response (and "today") at build/deploy time since no dynamic APIs are read.
export const dynamic = 'force-dynamic'

const LISTING_CARD = {
  id: true, slug: true, title: true, sellerId: true, listingType: true, condition: true,
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
    originalPrice: l.originalPrice?.toString() ?? null,
    discountedPrice: l.discountedPrice.toString(),
    discountPct: l.discountPct.toString(),
    days_remaining: l.expiryDate ? daysRemaining(l.expiryDate) : null,
    primary_photo: l.photos[0] || null,
    photos: undefined,
  }
}

// Public + edge-cached: own-listing filtering happens client-side on the homepage
export async function GET(req: NextRequest) {
  try {
    const rawType = req.nextUrl.searchParams.get('type') || 'near_expiry'
    const type = ['near_expiry', 'new_item', 'used_item'].includes(rawType) ? rawType : 'near_expiry'
    const isNearExpiry = type === 'near_expiry'

    const today = startOfToday()
    // "Expiring Soon" = within the next 3 days only (near-expiry only — others have no expiry date)
    const threeDays = new Date(today)
    threeDays.setDate(threeDays.getDate() + 3)

    const [justAdded, expiringSoon] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: 'active',
          listingType: type as any,
          ...(isNearExpiry ? { expiryDate: { gte: today } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: LISTING_CARD,
      }),
      isNearExpiry
        ? prisma.listing.findMany({
            where: { status: 'active', listingType: 'near_expiry', expiryDate: { gte: today, lte: threeDays } },
            orderBy: { expiryDate: 'asc' },
            take: 12,
            select: LISTING_CARD,
          })
        : Promise.resolve([]),
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
