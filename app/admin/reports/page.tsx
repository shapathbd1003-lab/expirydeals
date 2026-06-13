'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminReportsPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('open')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, authLoading, router])

  const fetchReports = async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/admin/reports?status=${statusFilter}&per_page=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    const data = await res.json()
    setReports(data.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [user, statusFilter])

  const resolve = async (id: string, action: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ action }),
    })
    fetchReports()
  }

  if (authLoading) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
        <h1 className="text-xl font-bold text-gray-900">Reports Queue</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {['open', 'resolved'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              statusFilter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
            }`}>{s}</button>
        ))}
      </div>

      {loading ? <p className="text-gray-400 text-center py-12">Loading...</p> :
        reports.length === 0 ? <p className="text-gray-500 text-center py-12">No {statusFilter} reports.</p> : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/listings/${r.listing?.slug}`} className="font-medium text-gray-900 hover:text-green-600">
                    {r.listing?.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Reported by {r.reporter?.fullName} · Reason: <strong>{r.reason}</strong>
                    {r.note && ` · "${r.note}"`}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                {r.status === 'open' && (
                  <div className="flex gap-2">
                    <button onClick={() => resolve(r.id, 'dismiss')} className="text-xs btn-secondary py-1 px-2">Dismiss</button>
                    <button onClick={() => { if(confirm('Remove this listing?')) resolve(r.id, 'remove_listing') }}
                      className="text-xs btn-danger py-1 px-2">Remove Listing</button>
                  </div>
                )}
                {r.status !== 'open' && (
                  <span className="text-xs text-gray-400">{r.status.replace('resolved_', '')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
