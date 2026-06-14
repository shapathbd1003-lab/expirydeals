'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const [lang, setLang] = useState<'en' | 'bn'>('en')
  const router = useRouter()

  const t = {
    en: {
      search: 'What are you looking for?',
      searchBtn: 'Search',
      allAds: 'All Ads',
      login: 'Log in',
      register: 'Register',
      saved: 'Saved',
      myAds: 'My Ads',
      profile: 'Profile',
      postAd: '+ Post Ad',
      logout: 'Log out',
      admin: 'Admin',
      catFood: 'Food & Groceries',
      catBeverages: 'Beverages',
      catDairy: 'Dairy & Eggs',
      catPharma: 'Pharmaceuticals',
      catHealth: 'Health & Wellness',
      catBakery: 'Bakery & Snacks',
      catCosmetics: 'Cosmetics',
      catBaby: 'Baby & Kids',
      catPet: 'Pet Supplies',
    },
    bn: {
      search: 'কী খুঁজছেন?',
      searchBtn: 'খুঁজুন',
      allAds: 'সব বিজ্ঞাপন',
      login: 'লগ ইন',
      register: 'নিবন্ধন',
      saved: 'সেভ করা',
      myAds: 'আমার বিজ্ঞাপন',
      profile: 'প্রোফাইল',
      postAd: '+ বিজ্ঞাপন দিন',
      logout: 'লগ আউট',
      admin: 'অ্যাডমিন',
      catFood: 'খাদ্য ও মুদিপণ্য',
      catBeverages: 'পানীয়',
      catDairy: 'দুগ্ধ ও ডিম',
      catPharma: 'ওষুধপত্র',
      catHealth: 'স্বাস্থ্য ও সুস্থতা',
      catBakery: 'বেকারি ও স্ন্যাকস',
      catCosmetics: 'প্রসাধনী',
      catBaby: 'শিশু ও বাচ্চা',
      catPet: 'পোষা প্রাণীর সামগ্রী',
    },
  }[lang]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/listings${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-orange-500">Expiry</span><span className="text-gray-800">Deals</span>
              <span className="text-xs font-medium text-gray-400 ml-1">BD</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold flex-shrink-0 transition-colors">
                {t.searchBtn}
              </button>
            </div>
          </form>

          {/* Right nav */}
          <div className="hidden md:flex items-center gap-3 ml-auto flex-shrink-0">
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
              aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
              className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors font-medium"
            >
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>

            {!user ? (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-orange-600 font-medium">{t.login}</Link>
                <Link href="/register" className="btn-primary">{t.register}</Link>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link href="/admin" className="text-sm text-gray-600 hover:text-orange-600 font-medium">{t.admin}</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">{t.logout}</button>
              </>
            ) : (
              <>
                <Link href="/my/favorites" className="text-sm text-gray-600 hover:text-orange-600 font-medium">{t.saved}</Link>
                <Link href="/my/listings" className="text-sm text-gray-600 hover:text-orange-600 font-medium">{t.myAds}</Link>
                <Link href="/buyer/profile" className="text-sm text-gray-600 hover:text-orange-600 font-medium">{t.profile}</Link>
                <Link href="/seller/listings/new" className="btn-primary">{t.postAd}</Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">{t.logout}</button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden ml-auto p-2 text-gray-600"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="hidden md:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-10 text-xs font-medium text-gray-600 overflow-x-auto">
            <Link href="/listings" className="hover:text-orange-600 whitespace-nowrap">{t.allAds}</Link>
            <Link href="/listings?category=food-groceries" className="hover:text-orange-600 whitespace-nowrap">{t.catFood}</Link>
            <Link href="/listings?category=beverages" className="hover:text-orange-600 whitespace-nowrap">{t.catBeverages}</Link>
            <Link href="/listings?category=dairy-eggs" className="hover:text-orange-600 whitespace-nowrap">{t.catDairy}</Link>
            <Link href="/listings?category=pharmaceuticals" className="hover:text-orange-600 whitespace-nowrap">{t.catPharma}</Link>
            <Link href="/listings?category=health-wellness" className="hover:text-orange-600 whitespace-nowrap">{t.catHealth}</Link>
            <Link href="/listings?category=bakery-snacks" className="hover:text-orange-600 whitespace-nowrap">{t.catBakery}</Link>
            <Link href="/listings?category=cosmetics-beauty" className="hover:text-orange-600 whitespace-nowrap">{t.catCosmetics}</Link>
            <Link href="/listings?category=baby-kids" className="hover:text-orange-600 whitespace-nowrap">{t.catBaby}</Link>
            <Link href="/listings?category=pet-supplies" className="hover:text-orange-600 whitespace-nowrap">{t.catPet}</Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex border border-gray-300 rounded-lg overflow-hidden">
            <input type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder={t.search} aria-label={t.search} className="flex-1 px-3 py-2.5 text-sm outline-none" />
            <button type="submit" className="bg-orange-500 text-white px-4 text-sm font-semibold">{t.searchBtn}</button>
          </form>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === 'en' ? 'bn' : 'en')}
              className="text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
            >
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
          </div>
          <Link href="/listings" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5 border-b border-gray-100">{t.allAds}</Link>
          {!user ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">{t.login}</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">{t.register}</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">{t.admin}</Link>
              ) : (
                <>
                  <Link href="/my/listings" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">{t.myAds}</Link>
                  <Link href="/my/favorites" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">{t.saved}</Link>
                  <Link href="/buyer/profile" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-700 py-1.5">{t.profile}</Link>
                  <Link href="/seller/listings/new" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">{t.postAd}</Link>
                </>
              )}
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-sm text-red-500 py-1.5">{t.logout}</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
