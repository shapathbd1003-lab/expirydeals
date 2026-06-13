import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, unauthorized, serverError } from '@/lib/response'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true, sellerId: true, seller: { select: { phone: true } } },
    })
    if (!listing || listing.status !== 'active') return notFound('Listing not found')

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

    return ok({ phone, whatsapp_link: whatsappLink, telegram_username: null })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
