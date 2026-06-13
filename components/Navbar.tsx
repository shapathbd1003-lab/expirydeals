'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-green-600 text-2xl">🥦</span>
            <span className="font-bold text-xl text-gray-900">
              Expiry<span className="text-green-600">Deals</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form action="/listings" className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                name="q"
                type="search"
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-green-600">
                🔍
              </button>
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/listings" className="text-sm text-gray-600 hover:text-green-600 font-medium">
              Browse
            </Link>
            {!user ? (
              <>
                <Link href="/login" className="btn-secondary text-sm py-1.5">Log in</Link>
                <Link href="/register" className="btn-primary text-sm py-1.5">Sign up</Link>
              </>
            ) : user.role === 'seller' ? (
              <>
                <Link href="/seller/listings/new" className="btn-primary text-sm py-1.5">+ New Listing</Link>
                <Link href="/seller/dashboard" className="text-sm text-gray-600 hover:text-green-600 font-medium">Dashboard</Link>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Log out</button>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-green-600 font-medium">Admin</Link>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Log out</button>
              </>
            ) : (
              <>
                <Link href="/buyer/favorites" className="text-sm text-gray-600 hover:text-green-600 font-medium">❤️ Saved</Link>
                <Link href="/buyer/dashboard" className="text-sm text-gray-600 hover:text-green-600 font-medium">Dashboard</Link>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Log out</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <form action="/listings" className="flex">
              <input name="q" type="search" placeholder="Search products..." className="flex-1 input rounded-r-none" />
              <button type="submit" className="bg-green-600 text-white px-3 rounded-r-lg">🔍</button>
            </form>
            <Link href="/listings" className="block text-gray-700 py-1">Browse All</Link>
            {!user ? (
              <>
                <Link href="/login" className="block text-gray-700 py-1">Log in</Link>
                <Link href="/register" className="block btn-primary text-center">Sign up free</Link>
              </>
            ) : (
              <>
                {user.role === 'seller' && (
                  <>
                    <Link href="/seller/dashboard" className="block text-gray-700 py-1">My Dashboard</Link>
                    <Link href="/seller/listings/new" className="block text-gray-700 py-1">+ New Listing</Link>
                  </>
                )}
                {user.role === 'buyer' && (
                  <>
                    <Link href="/buyer/dashboard" className="block text-gray-700 py-1">My Dashboard</Link>
                    <Link href="/buyer/favorites" className="block text-gray-700 py-1">Saved Listings</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className="block text-gray-700 py-1">Admin Panel</Link>
                )}
                <button onClick={logout} className="block text-red-500 py-1">Log out</button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
