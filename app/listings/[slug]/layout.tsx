import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.expirydealsbd.com'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      discountedPrice: true,
      originalPrice: true,
      discountPct: true,
      listingType: true,
      condition: true,
      city: true,
      region: true,
      expiryDate: true,
      status: true,
      photos: {
        where: { isPrimary: true },
        select: { urlMedium: true },
        take: 1,
      },
      category: { select: { name: true } },
    },
  })

  if (!listing || listing.status === 'deleted') {
    return { title: 'Listing Not Found', robots: { index: false } }
  }

  const isExpired = listing.status === 'expired' ||
    (listing.listingType === 'near_expiry' && listing.expiryDate && new Date(listing.expiryDate) < new Date())
  if (isExpired) {
    return { title: listing.title, robots: { index: false } }
  }

  const price = Number(listing.discountedPrice).toLocaleString('en-BD')
  const location = [listing.city, listing.region].filter(Boolean).join(', ')
  const discount = Math.round(Number(listing.discountPct))

  const title = listing.listingType === 'near_expiry'
    ? `${listing.title} — ৳${price} (${discount}% off) in ${location}`
    : `${listing.title} — ৳${price} in ${location}`

  const description = listing.listingType === 'near_expiry'
    ? `${listing.category?.name ?? 'Product'} near expiry at ${discount}% discount. ৳${price} in ${location}. ${listing.description.slice(0, 120)}...`
    : `${listing.condition ?? (listing.listingType === 'new_item' ? 'New' : 'Used')} ${listing.category?.name ?? 'item'} for ৳${price} in ${location}. ${listing.description.slice(0, 120)}...`

  const image = listing.photos[0]?.urlMedium

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/listings/${params.slug}`,
      siteName: 'ExpiryDealsBD',
      type: 'website',
      images: image ? [{ url: image, width: 800, height: 600, alt: listing.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ListingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      discountedPrice: true,
      originalPrice: true,
      expiryDate: true,
      listingType: true,
      status: true,
      city: true,
      region: true,
      photos: { where: { isPrimary: true }, select: { urlMedium: true }, take: 1 },
      category: { select: { name: true } },
    },
  })

  const isActive = !!listing && listing.status === 'active' &&
    (listing.listingType !== 'near_expiry' || (listing.expiryDate && new Date(listing.expiryDate) >= new Date()))

  const jsonLd = isActive ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description.slice(0, 200),
    image: listing.photos[0]?.urlMedium,
    category: listing.category?.name,
    offers: {
      '@type': 'Offer',
      price: Number(listing.discountedPrice).toFixed(2),
      priceCurrency: 'BDT',
      availability: 'https://schema.org/InStock',
      ...(listing.listingType === 'near_expiry' && listing.expiryDate
        ? { priceValidUntil: listing.expiryDate.toISOString().split('T')[0] }
        : {}),
      itemCondition: listing.listingType === 'used_item'
        ? 'https://schema.org/UsedCondition'
        : 'https://schema.org/NewCondition',
      seller: {
        '@type': 'LocalBusiness',
        name: 'ExpiryDealsBD Seller',
        addressLocality: listing.city,
        addressRegion: listing.region ?? undefined,
        addressCountry: 'BD',
      },
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {children}
    </>
  )
}
