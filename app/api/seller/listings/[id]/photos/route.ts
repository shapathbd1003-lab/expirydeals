import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, unauthorized, validationError, serverError } from '@/lib/response'
import { uploadListingPhoto } from '@/lib/storage'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { photos: { select: { id: true } } },
    })
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return forbidden()
    if (listing.photos.length >= 8) return validationError('Maximum 8 photos per listing')

    const formData = await req.formData()
    const files = formData.getAll('photos') as File[]
    if (!files.length) return validationError('No photos provided')

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

    const uploaded = []
    let sortOrder = listing.photos.length
    const isFirst = listing.photos.length === 0

    for (let i = 0; i < Math.min(files.length, 8 - listing.photos.length); i++) {
      const file = files[i]
      if (!ALLOWED_TYPES.includes(file.type)) continue
      if (file.size > MAX_SIZE) continue

      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadListingPhoto(buffer, listing.id)

      const photo = await prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          storageKey: result.storageKey,
          urlThumb: result.urlThumb,
          urlMedium: result.urlMedium,
          sortOrder: sortOrder++,
          isPrimary: isFirst && i === 0,
        },
      })
      uploaded.push(photo)
    }

    return ok(uploaded, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
