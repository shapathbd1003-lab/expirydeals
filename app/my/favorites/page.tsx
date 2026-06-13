'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ListingCard } from '@/components/ListingCard'

export default function MyFavoritesPage() {
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

  const remove = async (listingId: string) => {
    await fetch(`/api/buyer/favorites/${listingId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    setListings(ls => ls.filter(l => l.id !== listingId))
  }

  if (authLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Ads</h1>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-100 rounded aspect-[3/4] animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🤍</p>
          <p className="mb-4">No saved ads yet.</p>
          <Link href="/listings" className="btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="relative">
              <ListingCard listing={l} />
              <button onClick={() => remove(l.id)}
                className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-50 text-red-400">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
