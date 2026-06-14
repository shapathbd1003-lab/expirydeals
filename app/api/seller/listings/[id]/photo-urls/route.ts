import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, unauthorized, validationError, serverError } from '@/lib/response'

const MAX_DATA_URL_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_DATA_TYPES = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp', 'data:image/gif']

function isValidUrl(u: string): boolean {
  if (!u || typeof u !== 'string') return false
  const trimmed = u.trim()
  if (trimmed.startsWith('data:')) {
    // Validate MIME type
    const mimeOk = ALLOWED_DATA_TYPES.some(t => trimmed.startsWith(t))
    if (!mimeOk) return false
    // Enforce size limit
    const bytes = Math.ceil((trimmed.length * 3) / 4)
    if (bytes > MAX_DATA_URL_BYTES) return false
    return true
  }
  // Must be https only (no http in prod to avoid mixed-content issues)
  return trimmed.startsWith('https://')
}

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
    const urls: string[] = (body.urls || []).filter(isValidUrl)
    if (!urls.length) return validationError('No valid image URLs provided. Use https:// links or image files under 2MB.')

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
