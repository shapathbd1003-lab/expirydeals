import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paginated, serverError } from '@/lib/response'
import { daysRemaining } from '@/lib/slugify'
import { getAuthUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const PHOTO_SELECT = {
  select: {
    urlThumb: true,
    urlMedium: true,
    isPrimary: true,
    sortOrder: true,
  },
  orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
  take: 1,
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city') || ''
    const region = searchParams.get('region') || ''
    const upazila = searchParams.get('upazila') || ''
    const minPrice = parseFloat(searchParams.get('min_price') || '0') || 0
    const maxPrice = parseFloat(searchParams.get('max_price') || '0') || 0
    const minDiscount = parseFloat(searchParams.get('min_discount') || '0') || 0
    const expiryBefore = searchParams.get('expiry_before') || ''
    const expiryAfter = searchParams.get('expiry_after') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(48, Math.max(1, parseInt(searchParams.get('per_page') || '24')))

    // Exclude the logged-in user's own listings (sellers shouldn't see their own items in browse)
    const authUser = await getAuthUser(req)

    const where: Prisma.ListingWhereInput = {
      status: 'active',
      expiryDate: { gte: new Date() },
      ...(authUser ? { sellerId: { not: authUser.userId } } : {}),
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = { slug: category }
    }
    if (city) {
      where.city = { equals: city, mode: 'insensitive' }
    }
    if (region) {
      where.region = { contains: region, mode: 'insensitive' }
    }
    if (upazila) {
      where.address = { contains: upazila, mode: 'insensitive' }
    }
    if (minPrice > 0) {
      where.discountedPrice = { ...(where.discountedPrice as object), gte: minPrice }
    }
    if (maxPrice > 0) {
      where.discountedPrice = { ...(where.discountedPrice as object), lte: maxPrice }
    }
    if (minDiscount > 0) {
      where.discountPct = { gte: minDiscount }
    }
    if (expiryBefore) {
      where.expiryDate = { ...(where.expiryDate as object), lte: new Date(expiryBefore) }
    }
    if (expiryAfter) {
      where.expiryDate = { ...(where.expiryDate as object), gte: new Date(expiryAfter) }
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sort === 'price_asc'
        ? { discountedPrice: 'asc' }
        : sort === 'price_desc'
        ? { discountedPrice: 'desc' }
        : sort === 'expiry_asc'
        ? { expiryDate: 'asc' }
        : sort === 'discount_desc'
        ? { discountPct: 'desc' }
        : { createdAt: 'desc' }

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy,
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
          viewCount: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          photos: PHOTO_SELECT,
        },
      }),
    ])

    const data = listings.map((l) => ({
      ...l,
      originalPrice: l.originalPrice.toString(),
      discountedPrice: l.discountedPrice.toString(),
      discountPct: l.discountPct.toString(),
      days_remaining: daysRemaining(l.expiryDate),
      primary_photo: l.photos[0] || null,
      photos: undefined,
    }))

    return paginated(data, { page, perPage, total })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
