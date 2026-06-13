'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const STATUS_TABS = ['active', 'paused', 'expired', 'deleted'] as const

function daysLeft(expiryDate: string) {
  const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (diff < 0) return 'Expired'
  if (diff === 0) return 'Today'
  return `${diff}d`
}

export default function MyListingsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>('active')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch(`/api/seller/listings?status=${tab}&per_page=48`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => setListings(d.data || []))
      .finally(() => setLoading(false))
  }, [tab, user, token])

  const pauseResume = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await fetch(`/api/seller/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
    setListings(ls => ls.filter(l => l.id !== id))
  }

  const deleteListing = async (id: string, alreadyDeleted: boolean) => {
    const msg = alreadyDeleted
      ? 'Permanently remove this listing from the database? This cannot be undone.'
      : 'Move this listing to deleted?'
    if (!confirm(msg)) return
    await fetch(`/api/seller/listings/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    setListings(ls => ls.filter(l => l.id !== id))
  }

  if (authLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-500 text-sm">{user?.full_name}</p>
        </div>
        <Link href="/seller/listings/new" className="btn-primary">+ Post New Ad</Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              tab === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p className="mb-4">No {tab} ads.</p>
          {tab === 'active' && <Link href="/seller/listings/new" className="btn-primary">Post your first ad</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {l.photos?.[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={l.photos[0].urlThumb} alt="" className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/listings/${l.slug}`} className="font-medium text-gray-900 hover:text-green-600 line-clamp-1">{l.title}</Link>
                    <p className="text-sm text-gray-500">৳ {parseFloat(l.discountedPrice).toLocaleString('en-BD')} · {l.category?.name} · {l.city}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                    <span>👁 {l.viewCount}</span>
                    <span className={l.days_remaining <= 3 ? 'text-red-500 font-medium' : ''}>{daysLeft(l.expiryDate)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link href={`/seller/listings/${l.id}/edit`} className="text-xs btn-secondary py-1 px-2">Edit</Link>
                  {(tab === 'active' || tab === 'paused') && (
                    <button onClick={() => pauseResume(l.id, l.status)} className="text-xs btn-secondary py-1 px-2">
                      {l.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                  )}
                  {tab !== 'deleted' && (
                    <button onClick={() => deleteListing(l.id, false)} className="text-xs text-red-500 hover:underline py-1">Delete</button>
                  )}
                  {tab === 'deleted' && (
                    <button onClick={() => deleteListing(l.id, true)} className="text-xs text-red-600 font-medium hover:underline py-1">Remove permanently</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
