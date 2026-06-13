import Link from 'next/link'
import { ListingCard } from '@/components/ListingCard'

async function getFeatured() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/listings/featured`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { just_added: [], expiring_soon: [] }
    const data = await res.json()
    return data.data
  } catch {
    return { just_added: [], expiring_soon: [] }
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data
  } catch {
    return []
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'food-grocery': '🥕', 'beverages': '🥤', 'dairy-eggs': '🥚',
  'meat-seafood': '🥩', 'bakery': '🍞', 'health-beauty': '💄',
  'supplements-vitamins': '💊', 'pharmaceuticals': '💉', 'household-cleaning': '🧹',
  'pet-food': '🐾', 'baby-products': '👶', 'other': '📦',
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeatured(), getCategories()])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Save Big on Near-Expiry Products
          </h1>
          <p className="text-green-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Shop discounted food, groceries, health products and more from local sellers.
            Great deals. Less waste.
          </p>
          <form action="/listings" className="flex max-w-xl mx-auto gap-2">
            <input
              name="q"
              type="search"
              placeholder="Search products, e.g. orange juice, vitamins..."
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button type="submit" className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Browse by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/listings?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-green-300 hover:shadow-sm transition text-center"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Expiring Soon */}
        {featured.expiring_soon?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                🔥 Expiring Soon
              </h2>
              <Link href="/listings?sort=expiry_asc" className="text-sm text-green-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featured.expiring_soon.map((l: any) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* Just Added */}
        {featured.just_added?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">🆕 Just Added</h2>
              <Link href="/listings?sort=newest" className="text-sm text-green-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featured.just_added.map((l: any) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">How ExpiryDeals Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏪', title: 'Sellers List Products', desc: 'Shops post near-expiry items with photos, price, and expiry date.' },
              { icon: '🔍', title: 'Buyers Find Deals', desc: 'Search and filter by category, location, price, and expiry.' },
              { icon: '📞', title: 'Connect Directly', desc: 'Contact the seller by phone or WhatsApp. No fees, no middleman.' },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="btn-primary">Browse Listings</Link>
            <Link href="/register" className="btn-secondary">Register as Seller</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
