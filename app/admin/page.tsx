'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import Link from 'next/link'

const T = {
  en: {
    dashboard: 'Dashboard', welcomeBack: 'Welcome back,',
    totalUsers: 'Total Users', activeListings: 'Active Listings', pendingApproval: 'Pending Approval', openReports: 'Open Reports',
    manageUsers: 'Manage Users', manageUsersDesc: 'View, suspend, delete users',
    approveListings: 'Approve Listings', approveListingsDesc: (n: number) => `${n} pending approval`,
    allListings: 'All Listings', allListingsDesc: 'Review and moderate listings',
    reportsQueue: 'Reports Queue', reportsQueueDesc: (n: number) => `${n} open reports`,
    categories: 'Categories', categoriesDesc: 'Add, rename, disable categories',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', welcomeBack: 'ফিরে আসার জন্য স্বাগতম,',
    totalUsers: 'মোট ব্যবহারকারী', activeListings: 'সক্রিয় বিজ্ঞাপন', pendingApproval: 'অনুমোদনের অপেক্ষায়', openReports: 'খোলা রিপোর্ট',
    manageUsers: 'ব্যবহারকারী পরিচালনা', manageUsersDesc: 'ব্যবহারকারী দেখুন, স্থগিত করুন, মুছুন',
    approveListings: 'বিজ্ঞাপন অনুমোদন করুন', approveListingsDesc: (n: number) => `${n}টি অনুমোদনের অপেক্ষায়`,
    allListings: 'সব বিজ্ঞাপন', allListingsDesc: 'বিজ্ঞাপন পর্যালোচনা ও পরিচালনা করুন',
    reportsQueue: 'রিপোর্ট সারি', reportsQueueDesc: (n: number) => `${n}টি খোলা রিপোর্ট`,
    categories: 'ক্যাটাগরি', categoriesDesc: 'ক্যাটাগরি যোগ, নাম পরিবর্তন, নিষ্ক্রিয় করুন',
  },
}

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.dashboard}</h1>
      <p className="text-gray-500 text-sm mb-6">{t.welcomeBack} {user?.full_name}</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t.totalUsers, value: stats.total_users, icon: '👥', href: '/admin/users' },
            { label: t.activeListings, value: stats.total_active_listings, icon: '📦', href: '/admin/listings' },
            { label: t.pendingApproval, value: stats.pending_approval, icon: '🕐', warn: stats.pending_approval > 0, href: '/admin/listings?status=pending' },
            { label: t.openReports, value: stats.open_reports, icon: '🚩', warn: stats.open_reports > 0, href: '/admin/reports' },
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
          { href: '/admin/users', icon: '👥', title: t.manageUsers, desc: t.manageUsersDesc },
          { href: '/admin/listings?status=pending', icon: '🕐', title: t.approveListings, desc: t.approveListingsDesc(stats?.pending_approval || 0) },
          { href: '/admin/listings', icon: '📦', title: t.allListings, desc: t.allListingsDesc },
          { href: '/admin/reports', icon: '🚩', title: t.reportsQueue, desc: t.reportsQueueDesc(stats?.open_reports || 0) },
          { href: '/admin/categories', icon: '🏷️', title: t.categories, desc: t.categoriesDesc },
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
