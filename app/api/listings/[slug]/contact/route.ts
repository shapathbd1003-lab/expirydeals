import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, unauthorized, err, serverError } from '@/lib/response'

// Simple in-process rate limit: max 20 contact reveals per user per hour
const contactRateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = contactRateMap.get(userId)
  if (!entry || entry.resetAt < now) {
    contactRateMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    if (!checkRateLimit(auth.user.userId)) {
      return err('RATE_LIMITED', 'Too many contact requests. Try again later.', 429)
    }

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true, sellerId: true, seller: { select: { phone: true } } },
    })
    if (!listing || listing.status !== 'active') return notFound('Listing not found')

    // Buyers cannot contact their own listing
    if (listing.sellerId === auth.user.userId) {
      return err('FORBIDDEN', 'You cannot contact your own listing', 403)
    }

    // Deduplicate per user
    const existing = await prisma.listingContact.findFirst({
      where: { listingId: listing.id, buyerId: auth.user.userId },
    })

    if (!existing) {
      await prisma.$transaction([
        prisma.listingContact.create({
          data: { listingId: listing.id, buyerId: auth.user.userId },
        }),
        prisma.listing.update({
          where: { id: listing.id },
          data: { contactCount: { increment: 1 } },
        }),
      ])
    }

    const phone = listing.seller.phone || ''
    const whatsappLink = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : null

    return ok({ phone, whatsapp_link: whatsappLink })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
