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
    if (status && ['draft', 'active', 'paused', 'expired', 'deleted'].includes(status)) {
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
        originalPrice: l.originalPrice.toString(),
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const body = await req.json()
    const {
      title, category_id, description, original_price, discounted_price,
      quantity, expiry_date, city, region, address, status,
    } = body

    if (!title || !category_id || !description || !original_price || !discounted_price || !quantity || !expiry_date || !city) {
      return validationError('title, category_id, description, original_price, discounted_price, quantity, expiry_date, and city are required')
    }
    const origNum = parseFloat(original_price)
    const discNum = parseFloat(discounted_price)
    if (isNaN(origNum) || origNum <= 0) return validationError('original_price must be a positive number')
    if (isNaN(discNum) || discNum <= 0) return validationError('discounted_price must be a positive number')
    if (origNum > 9_999_999) return validationError('original_price is too large')
    if (discNum >= origNum) {
      return validationError('discounted_price must be less than original_price')
    }
    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1 || qty > 100_000) return validationError('quantity must be between 1 and 100,000')
    if (description.length < 30) {
      return validationError('description must be at least 30 characters')
    }
    if (new Date(expiry_date) <= new Date()) {
      return validationError('expiry_date must be in the future')
    }

    const category = await prisma.category.findUnique({ where: { id: parseInt(category_id) } })
    if (!category || !category.isActive) return validationError('Invalid category')

    const slug = generateSlug(title)
    const pct = discountPct(parseFloat(original_price), parseFloat(discounted_price))

    const listing = await prisma.listing.create({
      data: {
        sellerId: auth.user.userId,
        categoryId: parseInt(category_id),
        title: title.trim(),
        slug,
        description: description.trim(),
        originalPrice: parseFloat(original_price),
        discountedPrice: parseFloat(discounted_price),
        discountPct: pct,
        quantity: parseInt(quantity),
        expiryDate: new Date(expiry_date),
        city: city.trim(),
        region: region?.trim() || null,
        address: address?.trim() || null,
        status: status === 'active' ? 'active' : 'draft',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

    return ok({
      ...listing,
      originalPrice: listing.originalPrice.toString(),
      discountedPrice: listing.discountedPrice.toString(),
      discountPct: listing.discountPct.toString(),
    }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
