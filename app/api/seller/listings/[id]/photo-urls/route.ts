import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, unauthorized, validationError, serverError } from '@/lib/response'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { photos: { select: { id: true } } },
    })
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return unauthorized()

    const body = await req.json()
    const urls: string[] = (body.urls || []).filter((u: string) => typeof u === 'string' && (u.trim().startsWith('http') || u.trim().startsWith('data:image/')))
    if (!urls.length) return validationError('No valid URLs provided')

    const existing = listing.photos.length
    const slots = Math.min(urls.length, 8 - existing)
    if (slots <= 0) return validationError('Maximum 8 photos per listing')

    const created = []
    for (let i = 0; i < slots; i++) {
      const url = urls[i].trim()
      const photo = await prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          storageKey: `url/${Date.now()}-${i}`,
          urlThumb: url,
          urlMedium: url,
          sortOrder: existing + i,
          isPrimary: existing === 0 && i === 0,
        },
      })
      created.push(photo)
    }

    return ok(created, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
