import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, unauthorized, validationError, serverError } from '@/lib/response'
import { discountPct } from '@/lib/slugify'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { photos: true, category: true },
    })
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return forbidden()

    return ok({
      ...listing,
      originalPrice: listing.originalPrice.toString(),
      discountedPrice: listing.discountedPrice.toString(),
      discountPct: listing.discountPct.toString(),
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return forbidden()

    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.description !== undefined) {
      if (body.description.length < 30) return validationError('description must be at least 30 characters')
      updateData.description = body.description.trim()
    }
    if (body.category_id !== undefined) {
      const cat = await prisma.category.findUnique({ where: { id: parseInt(body.category_id) } })
      if (!cat || !cat.isActive) return validationError('Invalid category')
      updateData.categoryId = parseInt(body.category_id)
    }
    if (body.original_price !== undefined) updateData.originalPrice = parseFloat(body.original_price)
    if (body.discounted_price !== undefined) updateData.discountedPrice = parseFloat(body.discounted_price)
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity)
    if (body.expiry_date !== undefined) {
      if (new Date(body.expiry_date) <= new Date()) return validationError('expiry_date must be in the future')
      updateData.expiryDate = new Date(body.expiry_date)
    }
    if (body.city !== undefined) updateData.city = body.city.trim()
    if (body.region !== undefined) updateData.region = body.region?.trim() || null
    if (body.address !== undefined) updateData.address = body.address?.trim() || null
    if (body.status !== undefined) {
      if (!['active', 'paused', 'draft', 'deleted'].includes(body.status)) return validationError('Invalid status')
      updateData.status = body.status
    }
    if (body.sold_via !== undefined) {
      if (!['expirydeals', 'other_platform', 'other'].includes(body.sold_via)) return validationError('Invalid sold_via')
      updateData.soldVia = body.sold_via
    }
    if (body.sold_note !== undefined) updateData.soldNote = body.sold_note?.trim() || null

    // Recalculate discount pct if prices changed
    const newOriginal = (updateData.originalPrice as number) || Number(listing.originalPrice)
    const newDiscounted = (updateData.discountedPrice as number) || Number(listing.discountedPrice)
    if (newOriginal <= 0 || newOriginal > 9_999_999) return validationError('original_price out of valid range')
    if (newDiscounted <= 0) return validationError('discounted_price must be positive')
    if (newDiscounted >= newOriginal) return validationError('discounted_price must be less than original_price')
    updateData.discountPct = discountPct(newOriginal, newDiscounted)

    const updated = await prisma.listing.update({ where: { id: params.id }, data: updateData })

    return ok({
      ...updated,
      originalPrice: updated.originalPrice.toString(),
      discountedPrice: updated.discountedPrice.toString(),
      discountPct: updated.discountPct.toString(),
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return forbidden()

    if (listing.status === 'deleted') {
      // Already soft-deleted — permanently remove from DB
      await prisma.listingPhoto.deleteMany({ where: { listingId: params.id } })
      await prisma.listing.delete({ where: { id: params.id } })
      return ok({ message: 'Listing permanently deleted.' })
    }

    // First delete — soft delete
    await prisma.listing.update({ where: { id: params.id }, data: { status: 'deleted' } })
    return ok({ message: 'Listing deleted.' })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
