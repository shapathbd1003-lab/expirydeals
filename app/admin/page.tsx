'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetch('/api/admin/stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => setStats(d.data))
  }, [user, token])

  if (authLoading) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: '👥' },
            { label: 'Active Listings', value: stats.total_active_listings, icon: '📦' },
            { label: 'New This Week', value: stats.listings_created_this_week, icon: '📬' },
            { label: 'Open Reports', value: stats.open_reports, icon: '🚩', warn: stats.open_reports > 0 },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border p-5 ${s.warn ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-bold ${s.warn ? 'text-red-700' : 'text-gray-900'}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View, suspend, delete users' },
          { href: '/admin/listings', icon: '📦', title: 'Manage Listings', desc: 'Review and moderate listings' },
          { href: '/admin/reports', icon: '🚩', title: 'Reports Queue', desc: `${stats?.open_reports || 0} open reports` },
          { href: '/admin/categories', icon: '🏷️', title: 'Categories', desc: 'Add, rename, disable categories' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
