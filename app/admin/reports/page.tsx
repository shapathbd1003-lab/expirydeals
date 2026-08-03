'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import Link from 'next/link'

const T = {
  en: {
    reportsQueue: 'Reports Queue',
    reportCount: (n: number, s: string) => `${n} ${s} report${n !== 1 ? 's' : ''}`,
    open: 'Open', resolved: 'Resolved',
    loading: 'Loading...',
    noReports: (s: string) => `No ${s} reports.`,
    by: 'by',
    dismiss: 'Dismiss', removeListing: 'Remove Listing',
    confirmRemove: 'Remove this listing? This will delete it for the seller.',
    removed: '🗑 Removed', dismissed: '✓ Dismissed',
    reasons: { spam: '🚫 Spam', wrong_info: '❌ Wrong Info', illegal_item: '⚠️ Illegal Item', other: '💬 Other' },
  },
  bn: {
    reportsQueue: 'রিপোর্ট সারি',
    reportCount: (n: number, s: string) => `${n}টি ${s} রিপোর্ট`,
    open: 'খোলা', resolved: 'সমাধান হয়েছে',
    loading: 'লোড হচ্ছে...',
    noReports: (s: string) => `কোনো ${s} রিপোর্ট নেই।`,
    by: 'দ্বারা',
    dismiss: 'বাতিল করুন', removeListing: 'বিজ্ঞাপন সরান',
    confirmRemove: 'এই বিজ্ঞাপনটি সরাবেন? এটি বিক্রেতার জন্য মুছে ফেলা হবে।',
    removed: '🗑 সরানো হয়েছে', dismissed: '✓ বাতিল করা হয়েছে',
    reasons: { spam: '🚫 স্প্যাম', wrong_info: '❌ ভুল তথ্য', illegal_item: '⚠️ অবৈধ পণ্য', other: '💬 অন্যান্য' },
  },
}

export default function AdminReportsPage() {
  const { user, token } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const [reports, setReports] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<'open' | 'resolved'>('open')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchReports = async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/admin/reports?status=${statusFilter}&per_page=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    const data = await res.json()
    setReports(data.data || [])
    setTotal(data.pagination?.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [user, statusFilter])

  const resolve = async (id: string, action: string) => {
    const msg = action === 'remove_listing' ? t.confirmRemove : null
    if (msg && !confirm(msg)) return
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchReports()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t.reportsQueue}</h1>
          <p className="text-gray-500 text-sm">{t.reportCount(total, statusFilter === 'open' ? t.open : t.resolved)}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['open', 'resolved'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>{s === 'open' ? t.open : t.resolved}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>{t.noReports(statusFilter === 'open' ? t.open.toLowerCase() : t.resolved.toLowerCase())}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <div key={r.id} className={`bg-white rounded-xl border p-4 ${r.status === 'open' ? 'border-red-100' : 'border-gray-100'}`}>
              <div className="flex items-start gap-4">
                {/* Listing thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-300">
                  {r.listing?.photos?.[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={r.listing.photos[0].urlThumb} alt="" className="w-full h-full object-cover" />
                    : <span className="text-2xl">📦</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/listings/${r.listing?.slug}`} target="_blank"
                        className="font-semibold text-gray-900 hover:text-orange-600 line-clamp-1">
                        {r.listing?.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          {t.reasons[r.reason as keyof typeof t.reasons] || r.reason}
                        </span>
                        <span className="text-xs text-gray-400">{t.by} {r.reporter?.fullName}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {r.note && (
                        <p className="text-sm text-gray-600 mt-1.5 bg-gray-50 rounded-lg px-3 py-2 italic">
                          &ldquo;{r.note}&rdquo;
                        </p>
                      )}
                    </div>

                    {r.status === 'open' ? (
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => resolve(r.id, 'dismiss')}
                          className="text-xs btn-secondary py-1.5 px-3">
                          {t.dismiss}
                        </button>
                        <button onClick={() => resolve(r.id, 'remove_listing')}
                          className="text-xs btn-danger py-1.5 px-3">
                          {t.removeListing}
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        r.status === 'resolved_removed' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.status === 'resolved_removed' ? t.removed : t.dismissed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
