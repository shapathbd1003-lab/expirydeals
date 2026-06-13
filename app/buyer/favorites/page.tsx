'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ListingCard } from '@/components/ListingCard'
import Link from 'next/link'

export default function FavoritesPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/buyer/favorites', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => setListings(d.data || []))
      .finally(() => setLoading(false))
  }, [user, token])

  if (authLoading || loading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/buyer/dashboard" className="text-gray-400 hover:text-gray-600">← Dashboard</Link>
        <h1 className="text-xl font-bold text-gray-900">❤️ My Favorites</h1>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🤍</p>
          <p className="text-gray-600 mb-4">No saved listings yet.</p>
          <Link href="/listings" className="btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {listings.map((l: any) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
