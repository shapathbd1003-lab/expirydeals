import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, err, unauthorized, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const { slug } = await params
    const { rating, comment } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return validationError('Rating must be between 1 and 5')
    }

    const listing = await prisma.listing.findUnique({ where: { slug } })
    if (!listing) return err('NOT_FOUND', 'Listing not found', 404)

    // Buyer cannot review their own listing
    if (listing.sellerId === auth.user.userId) {
      return err('FORBIDDEN', 'You cannot review your own listing', 403)
    }

    // Check buyer contacted the seller (proof of interest/purchase)
    const contacted = await prisma.listingContact.findFirst({
      where: { listingId: listing.id, buyerId: auth.user.userId },
    })
    if (!contacted) {
      return err('FORBIDDEN', 'You can only review a listing after contacting the seller', 403)
    }

    // Upsert — one review per buyer per listing
    const review = await prisma.review.upsert({
      where: { listingId_buyerId: { listingId: listing.id, buyerId: auth.user.userId } },
      update: { rating, comment: comment?.trim() || null },
      create: {
        listingId: listing.id,
        buyerId: auth.user.userId,
        sellerId: listing.sellerId,
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        buyer: { select: { fullName: true, avatarUrl: true } },
      },
    })

    return ok({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      buyer_name: review.buyer.fullName,
      created_at: review.createdAt,
    }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const listing = await prisma.listing.findUnique({ where: { slug } })
    if (!listing) return err('NOT_FOUND', 'Listing not found', 404)

    const reviews = await prisma.review.findMany({
      where: { listingId: listing.id },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { fullName: true, avatarUrl: true } },
      },
    })

    const data = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      buyer_name: r.buyer.fullName,
      created_at: r.createdAt,
    }))

    const avg = data.length > 0
      ? Math.round((data.reduce((s, r) => s + r.rating, 0) / data.length) * 10) / 10
      : null

    return ok({ reviews: data, average: avg, total: data.length })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
