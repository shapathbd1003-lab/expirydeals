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
            businessName: true,
            businessCity: true,
            avatarUrl: true,
            createdAt: true,
            // phone is intentionally excluded — returned only via /contact
          },
        },
      },
    })

    if (!listing || listing.status === 'deleted') return notFound('Listing not found')

    // Auto-expire if past expiry date and still active/paused
    if ((listing.status === 'active' || listing.status === 'paused') && new Date(listing.expiryDate) < new Date()) {
      await prisma.listing.update({ where: { id: listing.id }, data: { status: 'expired' } })
      listing.status = 'expired'
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
      originalPrice: listing.originalPrice.toString(),
      discountedPrice: listing.discountedPrice.toString(),
      discountPct: listing.discountPct.toString(),
      quantity: listing.quantity,
      expiryDate: listing.expiryDate,
      days_remaining: daysRemaining(listing.expiryDate),
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
        business_name: listing.seller.businessName,
        business_city: listing.seller.businessCity,
        avatar_url: listing.seller.avatarUrl,
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
