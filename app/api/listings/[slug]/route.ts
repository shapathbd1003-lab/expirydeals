import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, notFound, serverError } from '@/lib/response'
import { daysRemaining } from '@/lib/slugify'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        seller: {
          select: {
            id: true,
            fullName: true,
            businessName: true,
            businessCity: true,
            avatarUrl: true,
            isVerifiedSeller: true,
            createdAt: true,
            // phone is intentionally excluded — returned only via /contact
          },
        },
      },
    })

    if (!listing || listing.status === 'deleted') return notFound('Listing not found')

    // Auto-expire only applies to near-expiry listings (others have no expiry date)
    if (listing.listingType === 'near_expiry' && listing.expiryDate) {
      // Compare at end of the expiry day, not the exact moment
      const expiryEndOfDay = new Date(listing.expiryDate)
      expiryEndOfDay.setHours(23, 59, 59, 999)
      if ((listing.status === 'active' || listing.status === 'paused') && expiryEndOfDay < new Date()) {
        await prisma.listing.update({ where: { id: listing.id }, data: { status: 'expired' } })
        listing.status = 'expired'
      }
    }

    if (listing.status === 'expired') {
      return ok({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        status: 'expired',
        days_remaining: -1,
      })
    }

    return ok({
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      listing_type: listing.listingType,
      condition: listing.condition,
      originalPrice: listing.originalPrice?.toString() ?? null,
      discountedPrice: listing.discountedPrice.toString(),
      discountPct: listing.discountPct.toString(),
      quantity: listing.quantity,
      expiryDate: listing.expiryDate,
      days_remaining: listing.expiryDate ? daysRemaining(listing.expiryDate) : null,
      city: listing.city,
      region: listing.region,
      address: listing.address,
      photos: listing.photos.map((p) => ({
        id: p.id,
        urlThumb: p.urlThumb,
        urlMedium: p.urlMedium,
        isPrimary: p.isPrimary,
        sortOrder: p.sortOrder,
      })),
      seller: {
        id: listing.seller.id,
        full_name: listing.seller.fullName,
        business_name: listing.seller.businessName,
        business_city: listing.seller.businessCity,
        avatar_url: listing.seller.avatarUrl,
        is_verified_seller: listing.seller.isVerifiedSeller,
        member_since: listing.seller.createdAt,
      },
      viewCount: listing.viewCount,
      contactCount: listing.contactCount,
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
