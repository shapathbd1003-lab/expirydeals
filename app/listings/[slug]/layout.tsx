import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://expirydeals.com'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      discountedPrice: true,
      originalPrice: true,
      discountPct: true,
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

  if (listing.status === 'expired' || new Date(listing.expiryDate) < new Date()) {
    return { title: listing.title, robots: { index: false } }
  }

  const discount = Math.round(Number(listing.discountPct))
  const price = Number(listing.discountedPrice).toLocaleString('en-BD')
  const location = [listing.city, listing.region].filter(Boolean).join(', ')
  const title = `${listing.title} — ৳${price} (${discount}% off) in ${location}`
  const description = `${listing.category?.name ?? 'Product'} near expiry at ${discount}% discount. ৳${price} in ${location}. ${listing.description.slice(0, 120)}...`
  const image = listing.photos[0]?.urlMedium

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/listings/${params.slug}`,
      siteName: 'ExpiryDeals',
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

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
