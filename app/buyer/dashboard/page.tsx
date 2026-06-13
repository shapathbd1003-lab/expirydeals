'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function BuyerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.full_name}!</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { href: '/listings', icon: '🔍', title: 'Browse Listings', desc: 'Find the best near-expiry deals' },
          { href: '/buyer/favorites', icon: '❤️', title: 'My Favorites', desc: 'Listings you saved' },
          { href: '/buyer/recently-viewed', icon: '🕐', title: 'Recently Viewed', desc: 'Products you browsed lately' },
          { href: '/buyer/profile', icon: '👤', title: 'My Profile', desc: 'Update your info and phone' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition flex items-start gap-4">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
