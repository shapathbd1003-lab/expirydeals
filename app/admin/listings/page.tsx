'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-500',
  sold: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-500',
}

export default function AdminListingsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, authLoading, router])

  const fetchListings = async () => {
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), per_page: '20' })
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/listings?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    const data = await res.json()
    setListings(data.data || [])
    setTotal(data.pagination?.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [user, q, status, page])

  const doAction = async (id: string, action: string) => {
    await fetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchListings()
  }

  if (authLoading) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
        <h1 className="text-xl font-bold text-gray-900">All Listings ({total})</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input max-w-xs" placeholder="Search title or seller..."
          value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['active', 'paused', 'expired', 'sold', 'deleted'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Listing</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Seller</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : listings.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No listings found.</td></tr>
            ) : listings.map((l: any) => {
              const photo = l.photos?.[0]
              return (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.urlThumb} alt={l.title} className="rounded-lg object-cover w-10 h-10" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-sm">📦</div>
                      )}
                      <div>
                        <Link href={`/listings/${l.slug}`} className="font-medium text-gray-900 hover:text-orange-600 line-clamp-1">
                          {l.title}
                        </Link>
                        <p className="text-xs text-gray-400">{l.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.seller?.fullName}</td>
                  <td className="px-4 py-3 text-gray-900">৳{l.discountedPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-500'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {l.status === 'active' && (
                        <button onClick={() => doAction(l.id, 'pause')} className="text-xs text-yellow-600 hover:underline">Pause</button>
                      )}
                      {l.status !== 'deleted' && (
                        <button onClick={() => { if (confirm('Delete this listing?')) doAction(l.id, 'delete') }}
                          className="text-xs text-red-500 hover:underline">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-secondary disabled:opacity-40">← Prev</button>
          <span className="self-center text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="btn-secondary disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
