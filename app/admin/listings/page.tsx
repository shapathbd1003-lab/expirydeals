'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-700',
  paused: 'bg-orange-100 text-orange-700',
  expired: 'bg-gray-100 text-gray-500',
  deleted: 'bg-red-100 text-red-500',
}

const T = {
  en: {
    admin: '← Admin', allListings: (n: number) => `All Listings (${n})`,
    searchPlaceholder: 'Search title or seller...',
    allStatuses: 'All statuses',
    statuses: { pending: 'Pending Approval', draft: 'Draft', active: 'Active', paused: 'Paused', expired: 'Expired', deleted: 'Deleted' },
    listing: 'Listing', seller: 'Seller', price: 'Price', status: 'Status', actions: 'Actions',
    loading: 'Loading...', noListings: 'No listings found.',
    newBadge: 'New', usedBadge: 'Used',
    approve: '✅ Approve', activate: 'Activate', pause: 'Pause', delete: 'Delete',
    confirmDelete: 'Delete this listing?',
    prev: '← Prev', next: 'Next →', pageOf: (p: number, total: number) => `Page ${p} of ${total}`,
  },
  bn: {
    admin: '← অ্যাডমিন', allListings: (n: number) => `সব বিজ্ঞাপন (${n})`,
    searchPlaceholder: 'শিরোনাম বা বিক্রেতা খুঁজুন...',
    allStatuses: 'সব স্ট্যাটাস',
    statuses: { pending: 'অনুমোদনের অপেক্ষায়', draft: 'খসড়া', active: 'সক্রিয়', paused: 'বিরতি দেওয়া', expired: 'মেয়াদোত্তীর্ণ', deleted: 'মুছে ফেলা হয়েছে' },
    listing: 'বিজ্ঞাপন', seller: 'বিক্রেতা', price: 'মূল্য', status: 'স্ট্যাটাস', actions: 'পদক্ষেপ',
    loading: 'লোড হচ্ছে...', noListings: 'কোনো বিজ্ঞাপন পাওয়া যায়নি।',
    newBadge: 'নতুন', usedBadge: 'ব্যবহৃত',
    approve: '✅ অনুমোদন করুন', activate: 'সক্রিয় করুন', pause: 'বিরতি দিন', delete: 'মুছুন',
    confirmDelete: 'এই বিজ্ঞাপনটি মুছে ফেলবেন?',
    prev: '← পেছনে', next: 'পরবর্তী →', pageOf: (p: number, total: number) => `পৃষ্ঠা ${p} এর ${total}`,
  },
}

function AdminListingsContent() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(searchParams.get('status') || '')
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
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">{t.admin}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.allListings(total)}</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <input className="input max-w-xs" placeholder={t.searchPlaceholder}
          value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">{t.allStatuses}</option>
          {(['pending', 'draft', 'active', 'paused', 'expired', 'deleted'] as const).map(s => (
            <option key={s} value={s}>{t.statuses[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-[35%]">{t.listing}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-[20%]">{t.seller}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-[15%]">{t.price}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-[12%]">{t.status}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-[18%]">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t.loading}</td></tr>
            ) : listings.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t.noListings}</td></tr>
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
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {l.category?.name}
                          {l.listingType && l.listingType !== 'near_expiry' && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${l.listingType === 'new_item' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {l.listingType === 'new_item' ? t.newBadge : t.usedBadge}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.seller?.fullName}</td>
                  <td className="px-4 py-3 text-gray-900">৳{l.discountedPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-500'}`}>
                      {t.statuses[l.status as keyof typeof t.statuses] || l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {l.status === 'pending' && (
                        <button onClick={() => doAction(l.id, 'approve')}
                          className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold px-2.5 py-1 rounded-lg transition">
                          {t.approve}
                        </button>
                      )}
                      {(l.status === 'paused' || l.status === 'expired') && (
                        <button onClick={() => doAction(l.id, 'activate')} className="text-xs text-orange-600 hover:underline">{t.activate}</button>
                      )}
                      {l.status === 'active' && (
                        <button onClick={() => doAction(l.id, 'pause')} className="text-xs text-yellow-600 hover:underline">{t.pause}</button>
                      )}
                      {l.status !== 'deleted' && (
                        <button onClick={() => { if (confirm(t.confirmDelete)) doAction(l.id, 'delete') }}
                          className="text-xs text-red-500 hover:underline">{t.delete}</button>
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
            className="btn-secondary disabled:opacity-40">{t.prev}</button>
          <span className="self-center text-sm text-gray-500">{t.pageOf(page, Math.ceil(total / 20))}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="btn-secondary disabled:opacity-40">{t.next}</button>
        </div>
      )}
    </div>
  )
}

export default function AdminListingsPage() {
  return <Suspense><AdminListingsContent /></Suspense>
}
