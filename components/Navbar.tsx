'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/listings${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-green-500 text-2xl font-black tracking-tight">
              Expiry<span className="text-gray-800">Deals</span>
            </span>
          </Link>

          {/* Search bar — Bikroy style */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full border border-gray-300 rounded overflow-hidden focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-5 text-sm font-semibold flex-shrink-0 transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">
            {!user ? (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium">Log in</Link>
                <Link href="/register" className="btn-primary">Register</Link>
              </>
            ) : user.role === 'seller' ? (
              <>
                <Link href="/seller/dashboard" className="text-sm text-gray-600 hover:text-green-600 font-medium">My Ads</Link>
                <Link href="/seller/listings/new" className="btn-primary">+ Post Ad</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">Log out</button>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-green-600 font-medium">Admin</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">Log out</button>
              </>
            ) : (
              <>
                <Link href="/buyer/favorites" className="text-sm text-gray-600 hover:text-green-600 font-medium">Saved</Link>
                <Link href="/buyer/dashboard" className="text-sm text-gray-600 hover:text-green-600 font-medium">My Account</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">Log out</button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-auto p-2 text-gray-600">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Category nav bar — like Bikroy's horizontal menu */}
      <div className="hidden md:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-10 text-xs font-medium text-gray-600 overflow-x-auto">
            <Link href="/listings" className="hover:text-green-600 whitespace-nowrap">All Ads</Link>
            <Link href="/listings?category=food-groceries" className="hover:text-green-600 whitespace-nowrap">Food & Groceries</Link>
            <Link href="/listings?category=beverages" className="hover:text-green-600 whitespace-nowrap">Beverages</Link>
            <Link href="/listings?category=dairy-eggs" className="hover:text-green-600 whitespace-nowrap">Dairy & Eggs</Link>
            <Link href="/listings?category=pharmaceuticals" className="hover:text-green-600 whitespace-nowrap">Pharmaceuticals</Link>
            <Link href="/listings?category=health-wellness" className="hover:text-green-600 whitespace-nowrap">Health & Wellness</Link>
            <Link href="/listings?category=bakery-snacks" className="hover:text-green-600 whitespace-nowrap">Bakery & Snacks</Link>
            <Link href="/listings?category=cosmetics-beauty" className="hover:text-green-600 whitespace-nowrap">Cosmetics</Link>
            <Link href="/listings?category=baby-kids" className="hover:text-green-600 whitespace-nowrap">Baby & Kids</Link>
            <Link href="/listings?category=pet-supplies" className="hover:text-green-600 whitespace-nowrap">Pet Supplies</Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex border border-gray-300 rounded overflow-hidden">
            <input type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="What are you looking for?" className="flex-1 px-3 py-2.5 text-sm outline-none" />
            <button type="submit" className="bg-green-500 text-white px-4 text-sm font-semibold">Search</button>
          </form>
          <Link href="/listings" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5 border-b border-gray-100">All Ads</Link>
          {!user ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">Log in</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'seller' && <>
                <Link href="/seller/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">My Ads</Link>
                <Link href="/seller/listings/new" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">+ Post Ad</Link>
              </>}
              {user.role === 'buyer' && <>
                <Link href="/buyer/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">My Account</Link>
                <Link href="/buyer/favorites" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">Saved Ads</Link>
              </>}
              {user.role === 'admin' && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">Admin</Link>}
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-sm text-red-500 py-1.5">Log out</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
