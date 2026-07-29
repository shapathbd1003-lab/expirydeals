import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, paginated, validationError, unauthorized, serverError } from '@/lib/response'
import { generateSlug, discountPct } from '@/lib/slugify'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(48, parseInt(searchParams.get('per_page') || '24'))

    const where: Prisma.ListingWhereInput = { sellerId: auth.user.userId }
    if (status && ['draft', 'pending', 'active', 'paused', 'expired', 'deleted'].includes(status)) {
      where.status = status as any
    }

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          slug: true,
          title: true,
          listingType: true,
          condition: true,
          originalPrice: true,
          discountedPrice: true,
          discountPct: true,
          quantity: true,
          expiryDate: true,
          city: true,
          region: true,
          status: true,
          viewCount: true,
          contactCount: true,
          soldVia: true,
          soldNote: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, slug: true } },
          photos: {
            orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
            take: 1,
            select: { urlThumb: true, isPrimary: true },
          },
        },
      }),
    ])

    return paginated(
      listings.map((l) => ({
        ...l,
        originalPrice: l.originalPrice?.toString() ?? null,
        discountedPrice: l.discountedPrice.toString(),
        discountPct: l.discountPct.toString(),
      })),
      { page, perPage, total }
    )
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

const LISTING_TYPES = ['near_expiry', 'new_item', 'used_item']

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const body = await req.json()
    const {
      title, category_id, description, original_price, discounted_price,
      quantity, expiry_date, condition, city, region, address, status: rawStatus,
    } = body
    const status = rawStatus === 'pending' ? 'pending' : 'draft'
    const listingType = LISTING_TYPES.includes(body.listing_type) ? body.listing_type : 'near_expiry'
    const isNearExpiry = listingType === 'near_expiry'

    if (!title || !category_id || !description || !discounted_price || !quantity || !city) {
      return validationError('title, category_id, description, discounted_price, quantity, and city are required')
    }
    if (isNearExpiry && !original_price) {
      return validationError('original_price is required for near-expiry listings')
    }
    if (isNearExpiry && !expiry_date) {
      return validationError('expiry_date is required for near-expiry listings')
    }
    if (!isNearExpiry && !condition) {
      return validationError('condition is required for new and used product listings')
    }

    const discNum = parseFloat(discounted_price)
    if (isNaN(discNum) || discNum <= 0) return validationError('discounted_price must be a positive number')
    if (discNum > 99_999_999) return validationError('discounted_price is too large')

    let origNum: number | null = null
    if (original_price) {
      origNum = parseFloat(original_price)
      if (isNaN(origNum) || origNum <= 0) return validationError('original_price must be a positive number')
      if (origNum > 99_999_999) return validationError('original_price is too large')
      if (discNum >= origNum) return validationError('discounted_price must be less than original_price')
    }

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1 || qty > 100_000) return validationError('quantity must be between 1 and 100,000')
    if (description.length < 30) {
      return validationError('description must be at least 30 characters')
    }
    if (isNearExpiry && new Date(expiry_date) <= new Date()) {
      return validationError('expiry_date must be in the future')
    }

    const category = await prisma.category.findUnique({ where: { id: parseInt(category_id) } })
    if (!category || !category.isActive) return validationError('Invalid category')
    const expectedGroup = isNearExpiry ? 'near_expiry' : 'general'
    if (category.group !== expectedGroup) {
      return validationError(`Selected category doesn't match this listing type`)
    }

    const slug = generateSlug(title)
    const pct = origNum ? discountPct(origNum, discNum) : 0

    const listing = await prisma.listing.create({
      data: {
        sellerId: auth.user.userId,
        categoryId: parseInt(category_id),
        listingType,
        title: title.trim(),
        slug,
        description: description.trim(),
        condition: !isNearExpiry ? condition.trim() : null,
        originalPrice: origNum,
        discountedPrice: discNum,
        discountPct: pct,
        quantity: qty,
        expiryDate: isNearExpiry ? new Date(expiry_date) : null,
        city: city.trim(),
        region: region?.trim() || null,
        address: address?.trim() || null,
        status,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return ok({
      ...listing,
      originalPrice: listing.originalPrice?.toString() ?? null,
      discountedPrice: listing.discountedPrice.toString(),
      discountPct: listing.discountPct.toString(),
    }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
