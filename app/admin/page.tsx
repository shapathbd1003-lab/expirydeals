'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.full_name}</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: '👥', href: '/admin/users' },
            { label: 'Active Listings', value: stats.total_active_listings, icon: '📦', href: '/admin/listings' },
            { label: 'Pending Approval', value: stats.pending_approval, icon: '🕐', warn: stats.pending_approval > 0, href: '/admin/listings?status=draft' },
            { label: 'Open Reports', value: stats.open_reports, icon: '🚩', warn: stats.open_reports > 0, href: '/admin/reports' },
          ].map((s) => (
            <Link key={s.label} href={s.href}
              className={`bg-white rounded-2xl border p-5 hover:shadow-md transition ${s.warn ? 'border-orange-300 bg-orange-50' : 'border-gray-100'}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-bold ${s.warn ? 'text-orange-700' : 'text-gray-900'}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View, suspend, delete users' },
          { href: '/admin/listings?status=draft', icon: '🕐', title: 'Approve Listings', desc: `${stats?.pending_approval || 0} pending approval` },
          { href: '/admin/listings', icon: '📦', title: 'All Listings', desc: 'Review and moderate listings' },
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
