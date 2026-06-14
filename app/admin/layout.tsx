'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/listings', label: 'Listings', icon: '📦' },
  { href: '/admin/reports', label: 'Reports', icon: '🚩' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 text-white flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <p className="font-black text-lg">
            <span className="text-orange-400">Expiry</span>Deals
          </p>
          <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-2 truncate">{user.full_name}</p>
          <Link href="/" className="text-xs text-gray-400 hover:text-white block mb-1">← Back to site</Link>
          <button onClick={logout} className="text-xs text-red-400 hover:text-red-300">Log out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-40 px-4 h-14 flex items-center justify-between">
        <p className="font-black"><span className="text-orange-400">Expiry</span>Deals Admin</p>
        <div className="flex gap-3 text-xs overflow-x-auto">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`whitespace-nowrap ${pathname.startsWith(item.href) ? 'text-orange-400' : 'text-gray-300'}`}>
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14 overflow-auto">
        {children}
      </main>
    </div>
  )
}
