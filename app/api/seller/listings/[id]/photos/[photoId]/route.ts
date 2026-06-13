import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, unauthorized, serverError } from '@/lib/response'

export async function DELETE(req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return unauthorized()

    const photo = await prisma.listingPhoto.findUnique({ where: { id: params.photoId } })
    if (!photo || photo.listingId !== params.id) return notFound('Photo not found')

    await prisma.listingPhoto.delete({ where: { id: params.photoId } })

    // If deleted photo was primary, make next one primary
    if (photo.isPrimary) {
      const next = await prisma.listingPhoto.findFirst({
        where: { listingId: params.id },
        orderBy: { sortOrder: 'asc' },
      })
      if (next) await prisma.listingPhoto.update({ where: { id: next.id }, data: { isPrimary: true } })
    }

    return ok({ deleted: params.photoId })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
