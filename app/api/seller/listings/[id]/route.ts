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
      originalPrice: listing.originalPrice?.toString() ?? null,
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

    const body = await req.json()

    const [listing, cat] = await Promise.all([
      prisma.listing.findUnique({ where: { id: params.id } }),
      body.category_id != null
        ? prisma.category.findUnique({ where: { id: parseInt(body.category_id) } })
        : Promise.resolve(null),
    ])
    if (!listing || listing.status === 'deleted') return notFound('Listing not found')
    if (listing.sellerId !== auth.user.userId) return forbidden()

    // listing_type is set at creation and never changes on edit
    const isNearExpiry = listing.listingType === 'near_expiry'
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.description !== undefined) {
      if (body.description.length < 15) return validationError('description must be at least 15 characters')
      updateData.description = body.description.trim()
    }
    if (body.condition !== undefined) updateData.condition = body.condition?.trim() || null
    if (body.category_id !== undefined) {
      if (!cat || !cat.isActive) return validationError('Invalid category')
      const expectedGroup = isNearExpiry ? 'near_expiry' : 'general'
      if (cat.group !== expectedGroup) return validationError(`Selected category doesn't match this listing's type`)
      updateData.categoryId = parseInt(body.category_id)
    }
    if (body.original_price !== undefined) {
      updateData.originalPrice = body.original_price ? parseFloat(body.original_price) : null
    }
    if (body.discounted_price !== undefined) updateData.discountedPrice = parseFloat(body.discounted_price)
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity)
    if (isNearExpiry && body.expiry_date !== undefined) {
      if (new Date(body.expiry_date) <= new Date()) return validationError('expiry_date must be in the future')
      updateData.expiryDate = new Date(body.expiry_date)
    }
    if (body.city !== undefined) updateData.city = body.city.trim()
    if (body.region !== undefined) updateData.region = body.region?.trim() || null
    if (body.address !== undefined) updateData.address = body.address?.trim() || null
    if (body.status !== undefined) {
      if (!['active', 'paused', 'draft', 'pending', 'deleted'].includes(body.status)) return validationError('Invalid status')
      // Sellers cannot self-publish: 'active' is only allowed when the listing
      // was already approved by admin (currently active or paused)
      if (body.status === 'active' && !['active', 'paused'].includes(listing.status)) {
        return validationError('Listings must be approved by an admin before going live')
      }
      updateData.status = body.status
    }
    if (body.sold_via !== undefined) {
      if (!['expirydeals', 'other_platform', 'other'].includes(body.sold_via)) return validationError('Invalid sold_via')
      updateData.soldVia = body.sold_via
    }
    if (body.sold_note !== undefined) updateData.soldNote = body.sold_note?.trim() || null

    // Recalculate discount pct if prices changed (original_price is optional for new/used items)
    const newOriginal = updateData.originalPrice !== undefined
      ? (updateData.originalPrice as number | null)
      : (listing.originalPrice ? Number(listing.originalPrice) : null)
    const newDiscounted = (updateData.discountedPrice as number) || Number(listing.discountedPrice)
    if (newDiscounted <= 0) return validationError('discounted_price must be positive')
    if (newDiscounted > 99_999_999) return validationError('discounted_price is too large')
    if (newOriginal) {
      if (newOriginal > 99_999_999) return validationError('original_price out of valid range')
      if (newDiscounted >= newOriginal) return validationError('discounted_price must be less than original_price')
      updateData.discountPct = discountPct(newOriginal, newDiscounted)
    } else {
      updateData.discountPct = 0
    }

    const updated = await prisma.listing.update({ where: { id: params.id }, data: updateData })

    return ok({
      ...updated,
      originalPrice: updated.originalPrice?.toString() ?? null,
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
