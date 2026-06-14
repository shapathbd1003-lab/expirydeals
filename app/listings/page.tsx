'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ListingCard } from '@/components/ListingCard'

function ListingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, perPage: 24, total: 0, totalPages: 0 })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
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
      city: searchParams.get('city') || '',
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
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Search</h3>
            <input
              type="search" className="input" placeholder="Product name..."
              value={filters.q}
              onChange={(e) => applyFilters({ q: e.target.value })}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Category</h3>
            <select className="input" value={filters.category} onChange={(e) => applyFilters({ category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Location</h3>
            <select className="input" value={filters.city} onChange={(e) => applyFilters({ city: e.target.value })}>
              <option value="">All Locations</option>
              <optgroup label="── Dhaka Division ──">
                <option value="Dhaka">Dhaka</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Manikganj">Manikganj</option>
                <option value="Munshiganj">Munshiganj</option>
                <option value="Narsingdi">Narsingdi</option>
              </optgroup>
              <optgroup label="── Chittagong Division ──">
                <option value="Chittagong">Chittagong</option>
                <option value="Cox's Bazar">Cox's Bazar</option>
                <option value="Comilla">Comilla</option>
                <option value="Feni">Feni</option>
                <option value="Noakhali">Noakhali</option>
              </optgroup>
              <optgroup label="── Sylhet Division ──">
                <option value="Sylhet">Sylhet</option>
                <option value="Moulvibazar">Moulvibazar</option>
                <option value="Habiganj">Habiganj</option>
                <option value="Sunamganj">Sunamganj</option>
              </optgroup>
              <optgroup label="── Rajshahi Division ──">
                <option value="Rajshahi">Rajshahi</option>
                <option value="Bogura">Bogura</option>
                <option value="Pabna">Pabna</option>
                <option value="Natore">Natore</option>
              </optgroup>
              <optgroup label="── Khulna Division ──">
                <option value="Khulna">Khulna</option>
                <option value="Jessore">Jessore</option>
                <option value="Barisal">Barisal</option>
                <option value="Satkhira">Satkhira</option>
              </optgroup>
              <optgroup label="── Mymensingh Division ──">
                <option value="Mymensingh">Mymensingh</option>
                <option value="Jamalpur">Jamalpur</option>
                <option value="Netrokona">Netrokona</option>
              </optgroup>
              <optgroup label="── Rangpur Division ──">
                <option value="Rangpur">Rangpur</option>
                <option value="Dinajpur">Dinajpur</option>
                <option value="Kurigram">Kurigram</option>
              </optgroup>
              <optgroup label="── Barishal Division ──">
                <option value="Barishal">Barishal</option>
                <option value="Patuakhali">Patuakhali</option>
                <option value="Bhola">Bhola</option>
              </optgroup>
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Price Range (৳)</h3>
            <div className="flex gap-2">
              <input type="number" min="0" className="input" placeholder="Min"
                value={filters.min_price} onChange={(e) => applyFilters({ min_price: e.target.value })} />
              <input type="number" min="0" className="input" placeholder="Max"
                value={filters.max_price} onChange={(e) => applyFilters({ max_price: e.target.value })} />
            </div>
          </div>
          <button onClick={() => applyFilters({ q: '', category: '', city: '', min_price: '', max_price: '' })}
            className="text-sm text-gray-500 hover:text-red-500">Clear filters</button>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {loading ? '...' : `${pagination.total} listings found`}
            </p>
            <select className="input w-auto text-sm" value={filters.sort} onChange={(e) => applyFilters({ sort: e.target.value })}>
              <option value="newest">Newest first</option>
              <option value="expiry_asc">Expiring soonest</option>
              <option value="discount_desc">Biggest discount</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
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
              <p className="text-gray-600">No listings found. Try adjusting your filters.</p>
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
