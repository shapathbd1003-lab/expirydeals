export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ListingCard } from '@/components/ListingCard'
import { prisma } from '@/lib/prisma'
import { daysRemaining } from '@/lib/slugify'

const LISTING_CARD = {
  id: true, slug: true, title: true,
  originalPrice: true, discountedPrice: true, discountPct: true,
  quantity: true, expiryDate: true, city: true,
  category: { select: { id: true, name: true, slug: true } },
  photos: {
    select: { urlThumb: true, urlMedium: true, isPrimary: true },
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }] as any[],
    take: 1,
  },
}

function mapListing(l: any) {
  return {
    ...l,
    originalPrice: l.originalPrice.toString(),
    discountedPrice: l.discountedPrice.toString(),
    discountPct: l.discountPct.toString(),
    days_remaining: daysRemaining(l.expiryDate),
    primary_photo: l.photos[0] || null,
    photos: undefined,
  }
}

async function getFeatured() {
  try {
    const now = new Date()
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const [justAdded, expiringSoon] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: now } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: LISTING_CARD,
      }),
      prisma.listing.findMany({
        where: { status: 'active', expiryDate: { gte: now, lte: threeDays } },
        orderBy: { expiryDate: 'asc' },
        take: 12,
        select: LISTING_CARD,
      }),
    ])
    return { just_added: justAdded.map(mapListing), expiring_soon: expiringSoon.map(mapListing) }
  } catch {
    return { just_added: [], expiring_soon: [] }
  }
}

async function getCategories() {
  try {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true,
        _count: { select: { listings: { where: { status: 'active' } } } },
      },
    })
    return cats
  } catch {
    return []
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'food-groceries': '🥫',
  'beverages': '🥤',
  'dairy-eggs': '🥛',
  'meat-seafood': '🥩',
  'bakery-snacks': '🍞',
  'pharmaceuticals': '💊',
  'health-wellness': '🌿',
  'baby-kids': '👶',
  'cosmetics-beauty': '💄',
  'cleaning-products': '🧹',
  'pet-supplies': '🐾',
  'other': '📦',
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategories()])

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero search — Bikroy style green banner */}
      <section className="bg-green-500 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Buy &amp; Sell Near-Expiry Products in Bangladesh
          </h1>
          <p className="text-green-100 text-sm mb-5">
            Save money, reduce waste. Deals on food, medicine, cosmetics &amp; more.
          </p>
          <form action="/listings" className="flex max-w-2xl mx-auto bg-white rounded overflow-hidden shadow-lg">
            <input
              name="q"
              type="search"
              placeholder="What are you looking for?"
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none"
            />
            <select name="category" className="hidden sm:block border-l border-gray-200 px-3 py-3 text-sm text-gray-600 outline-none bg-white">
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 text-sm transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Categories grid — Bikroy style */}
        {categories.length > 0 && (
          <section className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">Browse Categories</h2>
              <Link href="/listings" className="text-xs text-green-600 hover:underline">View all ads →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/listings?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded hover:bg-green-50 hover:border-green-200 border border-transparent transition text-center group"
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  <span className="text-xs text-gray-700 group-hover:text-green-700 font-medium leading-tight">
                    {cat.name}
                  </span>
                  {cat._count?.listings > 0 && (
                    <span className="text-xs text-gray-400">{cat._count.listings} ads</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Expiring Soon */}
        {featured.expiring_soon?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded inline-block"></span>
                Expiring Soon
              </h2>
              <Link href="/listings?sort=expiry_asc" className="text-xs text-green-600 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {featured.expiring_soon.map((l: any) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Just Added */}
        {featured.just_added?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <span className="w-1 h-5 bg-green-500 rounded inline-block"></span>
                Just Added
              </h2>
              <Link href="/listings?sort=newest" className="text-xs text-green-600 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {featured.just_added.map((l: any) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {featured.expiring_soon?.length === 0 && featured.just_added?.length === 0 && (
          <section className="bg-white rounded shadow-sm border border-gray-200 py-16 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No listings yet</h2>
            <p className="text-gray-500 text-sm mb-6">Be the first to post a deal!</p>
            <Link href="/register" className="btn-primary">Post an Ad</Link>
          </section>
        )}

        {/* How it works */}
        <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-base mb-5 text-center">How ExpiryDeals Works</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🏪', title: 'Sellers Post Ads', desc: 'List near-expiry products with photos, price and expiry date. Free to post.' },
              { icon: '🔍', title: 'Buyers Find Deals', desc: 'Search and filter by category, location, price or expiry. Save favorites.' },
              { icon: '📞', title: 'Contact Directly', desc: 'Call or WhatsApp the seller. No commission, no middleman, no fees.' },
            ].map(s => (
              <div key={s.title}>
                <div className="text-4xl mb-2">{s.icon}</div>
                <h3 className="font-semibold text-sm text-gray-800 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/listings" className="btn-primary text-center">Browse Ads</Link>
            <Link href="/register" className="btn-secondary text-center">Post Free Ad</Link>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-600 mb-6">
            <div>
              <p className="font-bold text-gray-800 mb-2">ExpiryDeals</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bangladesh's marketplace for near-expiry products. Save money, reduce food waste.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Quick Links</p>
              <ul className="space-y-1 text-xs">
                <li><Link href="/listings" className="hover:text-green-600">All Ads</Link></li>
                <li><Link href="/register" className="hover:text-green-600">Post Free Ad</Link></li>
                <li><Link href="/login" className="hover:text-green-600">Login</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Categories</p>
              <ul className="space-y-1 text-xs">
                <li><Link href="/listings?category=food-groceries" className="hover:text-green-600">Food & Groceries</Link></li>
                <li><Link href="/listings?category=pharmaceuticals" className="hover:text-green-600">Pharmaceuticals</Link></li>
                <li><Link href="/listings?category=cosmetics-beauty" className="hover:text-green-600">Cosmetics</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>© 2025 ExpiryDeals. All rights reserved.</p>
            <Link href="/terms" className="hover:text-green-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
