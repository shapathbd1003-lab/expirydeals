'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ListingCard } from '@/components/ListingCard'
import { useLang } from '@/hooks/useLang'
import { BD_LOCATIONS, getDistricts, getUpazilas } from '@/lib/bd-locations'

const CATEGORY_NAMES_BN: Record<string, string> = {
  'food-groceries': 'খাদ্য ও মুদিপণ্য',
  'beverages': 'পানীয়',
  'dairy-eggs': 'দুগ্ধ ও ডিম',
  'meat-seafood': 'মাংস ও সামুদ্রিক খাবার',
  'bakery-snacks': 'বেকারি ও স্ন্যাকস',
  'pharmaceuticals': 'ওষুধপত্র',
  'health-wellness': 'স্বাস্থ্য ও সুস্থতা',
  'baby-kids': 'শিশু ও বাচ্চা',
  'cosmetics-beauty': 'প্রসাধনী ও সৌন্দর্য',
  'cleaning-products': 'পরিষ্কার পণ্য',
  'pet-supplies': 'পোষা প্রাণীর সামগ্রী',
  'other': 'অন্যান্য',
}

function ListingsContent() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, perPage: 24, total: 0, totalPages: 0 })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    city: searchParams.get('city') || '',
    upazila: searchParams.get('upazila') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  })

  // Sync filters when URL changes (e.g. clicking navbar category links)
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      region: searchParams.get('region') || '',
      city: searchParams.get('city') || '',
      upazila: searchParams.get('upazila') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
    })
  }, [searchParams])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
      const res = await fetch(`/api/listings?${params}`)
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setListings(data.data || [])
      setPagination(data.pagination || { page: 1, perPage: 24, total: 0, totalPages: 0 })
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchListings() }, [fetchListings])

  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters, page: 1 }
    setFilters(updated)
    const params = new URLSearchParams()
    Object.entries(updated).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
    router.push(`/listings?${params}`, { scroll: false })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="lg:w-56 flex-shrink-0 space-y-5">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{lang === 'bn' ? 'সার্চ' : 'Search'}</h3>
            <input
              type="search" className="input" placeholder={lang === 'bn' ? 'পণ্যের নাম...' : 'Product name...'}
              value={filters.q}
              onChange={(e) => applyFilters({ q: e.target.value })}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}</h3>
            <select className="input" value={filters.category} onChange={(e) => applyFilters({ category: e.target.value })}>
              <option value="">{lang === 'bn' ? 'সব ক্যাটাগরি' : 'All categories'}</option>
              {categories.map((c: any) => <option key={c.id} value={c.slug}>{lang === 'bn' ? (CATEGORY_NAMES_BN[c.slug] || c.name) : c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{lang === 'bn' ? 'অবস্থান' : 'Location'}</h3>
            <select className="input" value={filters.region} onChange={(e) => applyFilters({ region: e.target.value, city: '', upazila: '' })}>
              <option value="">{lang === 'bn' ? 'সব বিভাগ' : 'All Divisions'}</option>
              {BD_LOCATIONS.map(div => (
                <option key={div.name} value={div.name}>{div.name}</option>
              ))}
            </select>
            <select className="input" value={filters.city} onChange={(e) => applyFilters({ city: e.target.value, upazila: '' })} disabled={!filters.region}>
              <option value="">{lang === 'bn' ? 'সব জেলা' : 'All Districts'}</option>
              {filters.region && getDistricts(filters.region).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select className="input" value={filters.upazila} onChange={(e) => applyFilters({ upazila: e.target.value })} disabled={!filters.city}>
              <option value="">{lang === 'bn' ? 'সব উপজেলা' : 'All Upazilas'}</option>
              {filters.city && getUpazilas(filters.region, filters.city).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{lang === 'bn' ? 'মূল্য পরিসর (৳)' : 'Price Range (৳)'}</h3>
            <div className="flex gap-2">
              <input type="number" min="0" className="input" placeholder={lang === 'bn' ? 'কম' : 'Min'}
                value={filters.min_price} onChange={(e) => applyFilters({ min_price: e.target.value })} />
              <input type="number" min="0" className="input" placeholder={lang === 'bn' ? 'বেশি' : 'Max'}
                value={filters.max_price} onChange={(e) => applyFilters({ max_price: e.target.value })} />
            </div>
          </div>
          <button onClick={() => applyFilters({ q: '', category: '', region: '', city: '', upazila: '', min_price: '', max_price: '' })}
            className="text-sm text-gray-500 hover:text-red-500">{lang === 'bn' ? 'ফিল্টার মুছুন' : 'Clear filters'}</button>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {loading ? '...' : lang === 'bn' ? `${pagination.total}টি বিজ্ঞাপন পাওয়া গেছে` : `${pagination.total} listings found`}
            </p>
            <select className="input w-auto text-sm" value={filters.sort} onChange={(e) => applyFilters({ sort: e.target.value })}>
              <option value="newest">{lang === 'bn' ? 'সবচেয়ে নতুন' : 'Newest first'}</option>
              <option value="expiry_asc">{lang === 'bn' ? 'শীঘ্রই মেয়াদোত্তীর্ণ' : 'Expiring soonest'}</option>
              <option value="expiry_desc">{lang === 'bn' ? 'সর্বোচ্চ মেয়াদ' : 'Expiring latest'}</option>
              <option value="discount_desc">{lang === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Biggest discount'}</option>
              <option value="price_asc">{lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: low to high'}</option>
              <option value="price_desc">{lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: high to low'}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-600">{lang === 'bn' ? 'কোনো বিজ্ঞাপন পাওয়া যায়নি। ফিল্টার পরিবর্তন করে দেখুন।' : 'No listings found. Try adjusting your filters.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setFilters(f => ({ ...f, page: p })) }}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    p === pagination.page ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  return <Suspense><ListingsContent /></Suspense>
}
