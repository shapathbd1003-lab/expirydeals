import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://expirydeals.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/listings`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })

    const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${baseUrl}/listings/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    return [...staticPages, ...listingPages]
  } catch {
    return staticPages
  }
}
