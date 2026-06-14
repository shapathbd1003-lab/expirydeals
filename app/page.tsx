'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ListingCard } from '@/components/ListingCard'

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

export default function HomePage() {
  const [featured, setFeatured] = useState<any>({ just_added: [], expiring_soon: [] })
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/listings/featured').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/stats/public').then(r => r.json()).catch(() => ({ data: null })),
    ]).then(([feat, cats, st]) => {
      setFeatured(feat.data || { just_added: [], expiring_soon: [] })
      setCategories(cats.data || [])
      setStats(st.data || null)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Bangladesh&apos;s #1 Near-Expiry Marketplace
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            Big Discounts on<br className="hidden sm:block" /> Near-Expiry Products
          </h1>
          <p className="text-orange-100 text-sm md:text-base mb-6 max-w-xl mx-auto">
            Save up to <strong className="text-white">70% off</strong> on food, groceries, cosmetics &amp; more.
            Help reduce waste while saving money.
          </p>

          {/* Search form */}
          <form action="/listings" className="flex max-w-2xl mx-auto bg-white rounded-xl overflow-hidden shadow-xl mb-6">
            <input
              name="q"
              type="search"
              placeholder="Search products, brands..."
              className="flex-1 px-4 py-3.5 text-sm text-gray-800 outline-none"
            />
            <select name="category" className="hidden sm:block border-l border-gray-200 px-3 py-3.5 text-sm text-gray-600 outline-none bg-white">
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 text-sm transition-colors">
              Search
            </button>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition text-sm shadow">
              🔍 Browse Deals
            </Link>
            <Link href="/seller/listings/new" className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow">
              📢 Post a Deal — Free!
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📦', value: stats?.active_listings ?? '—', label: 'Active Deals' },
            { icon: '♻️', value: stats?.total_listings ?? '—', label: 'Products Listed' },
            { icon: '💰', value: 'Free', label: 'To Post' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-black text-orange-600">{s.icon} {s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Categories grid */}
        {categories.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">Browse by Category</h2>
              <Link href="/listings" className="text-xs text-orange-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/listings?category=${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-200 transition text-center group"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  <span className="text-xs text-gray-700 group-hover:text-orange-700 font-medium leading-tight">
                    {cat.name}
                  </span>
                  {cat._count?.listings > 0 && (
                    <span className="text-[10px] text-gray-400">{cat._count.listings}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Expiring Soon */}
            {featured.expiring_soon?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-500 rounded inline-block"></span>
                    ⏰ Expiring Soon — Grab Fast!
                  </h2>
                  <Link href="/listings?sort=expiry_asc" className="text-xs text-orange-600 hover:underline">See all →</Link>
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
                    <span className="w-1 h-5 bg-orange-500 rounded inline-block"></span>
                    🆕 Just Added
                  </h2>
                  <Link href="/listings?sort=newest" className="text-xs text-orange-600 hover:underline">See all →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {featured.just_added.map((l: any) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {/* Empty state */}
            {featured.expiring_soon?.length === 0 && featured.just_added?.length === 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                <p className="text-5xl mb-4">🛒</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No listings yet</h2>
                <p className="text-gray-500 text-sm mb-6">Be the first to post a deal!</p>
                <Link href="/seller/listings/new" className="btn-primary">Post Free Ad</Link>
              </section>
            )}
          </>
        )}

        {/* How it works */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-2 text-center">How It Works</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Simple, fast, free — 3 steps to your next deal</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '📢', title: 'Seller Posts a Deal', desc: 'List products with expiry date, photos, and discounted price. Completely free.' },
              { step: '2', icon: '🔍', title: 'Buyer Finds It', desc: 'Search by category, location, or discount. Filter by expiry to find the best deals.' },
              { step: '3', icon: '📞', title: 'Contact & Buy', desc: 'Call or WhatsApp the seller directly. No commission, no middleman — ever.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Ready to post your first deal?</p>
              <p className="text-xs text-gray-500">Reach thousands of buyers looking for discounts.</p>
            </div>
            <Link href="/seller/listings/new" className="btn-primary whitespace-nowrap">📢 Post Free Ad</Link>
          </div>
        </section>

        {/* Trust badges */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🆓', title: 'Free to Post', desc: 'No fees ever' },
            { icon: '📍', title: 'Bangladesh-wide', desc: 'All 64 districts' },
            { icon: '♻️', title: 'Reduce Waste', desc: 'Food saved from landfill' },
            { icon: '⚡', title: 'Instant Listing', desc: 'Live in minutes' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl mb-1">{b.icon}</p>
              <p className="text-sm font-semibold text-gray-800">{b.title}</p>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-600 mb-6">
            <div>
              <p className="font-black text-lg mb-1">
                <span className="text-orange-500">Expiry</span><span className="text-gray-800">Deals</span>
                <span className="text-gray-400 text-sm font-medium"> BD</span>
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bangladesh&apos;s marketplace for near-expiry products. Save money, reduce food waste.
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Quick Links</p>
              <ul className="space-y-1 text-xs">
                <li><Link href="/listings" className="hover:text-orange-600">All Deals</Link></li>
                <li><Link href="/seller/listings/new" className="hover:text-orange-600">Post Free Ad</Link></li>
                <li><Link href="/login" className="hover:text-orange-600">Log in</Link></li>
                <li><Link href="/register" className="hover:text-orange-600">Register</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">Popular Categories</p>
              <ul className="space-y-1 text-xs">
                <li><Link href="/listings?category=food-groceries" className="hover:text-orange-600">Food & Groceries</Link></li>
                <li><Link href="/listings?category=dairy-eggs" className="hover:text-orange-600">Dairy & Eggs</Link></li>
                <li><Link href="/listings?category=cosmetics-beauty" className="hover:text-orange-600">Cosmetics</Link></li>
                <li><Link href="/listings?category=health-wellness" className="hover:text-orange-600">Health & Wellness</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>© 2025 ExpiryDeals Bangladesh. All rights reserved.</p>
            <Link href="/terms" className="hover:text-orange-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
