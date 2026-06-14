'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ListingCard } from '@/components/ListingCard'
import { useLang } from '@/hooks/useLang'

const CATEGORY_ICONS: Record<string, string> = {
  'food-groceries': '🥫',
  'beverages': '🥤',
  'dairy-eggs': '🥛',
  'meat-seafood': '🥩',
  'bakery-snacks': '🍞',
  'pharmaceuticals': '💊',
  'health-wellness': '🌿',
  'baby-kids': '👶',
  'cosmetics-beauty': '💄',
  'cleaning-products': '🧹',
  'pet-supplies': '🐾',
  'other': '📦',
}

const CATEGORY_NAMES_BN: Record<string, string> = {
  'food-groceries': 'খাদ্য ও মুদিপণ্য',
  'beverages': 'পানীয়',
  'dairy-eggs': 'দুগ্ধ ও ডিম',
  'meat-seafood': 'মাংস ও সামুদ্রিক খাবার',
  'bakery-snacks': 'বেকারি ও স্ন্যাকস',
  'pharmaceuticals': 'ওষুধপত্র',
  'health-wellness': 'স্বাস্থ্য ও সুস্থতা',
  'baby-kids': 'শিশু ও বাচ্চা',
  'cosmetics-beauty': 'প্রসাধনী ও সৌন্দর্য',
  'cleaning-products': 'পরিষ্কার পণ্য',
  'pet-supplies': 'পোষা প্রাণীর সামগ্রী',
  'other': 'অন্যান্য',
}

const T = {
  en: {
    badge: "Bangladesh's #1 Near-Expiry Marketplace",
    hero: 'Big Discounts on Near-Expiry Products',
    heroSub: 'Save up to',
    heroSub2: 'off on food, groceries, cosmetics & more. Help reduce waste while saving money.',
    searchPlaceholder: 'Search products, brands...',
    allCategories: 'All Categories',
    search: 'Search',
    browseDeal: '🔍 Browse Deals',
    postDeal: '📢 Post a Deal — Free!',
    activeDeals: 'Active Deals',
    productsListed: 'Products Listed',
    toPost: 'To Post',
    browseByCategory: 'Browse by Category',
    viewAll: 'View all →',
    expiringSoon: '⏰ Expiring Soon — Grab Fast!',
    seeAll: 'See all →',
    justAdded: '🆕 Just Added',
    noListings: 'No listings yet',
    noListingsSub: 'Be the first to post a deal!',
    postFreeAd: 'Post Free Ad',
    howItWorks: 'How It Works',
    howItWorksSub: 'Simple, fast, free — 3 steps to your next deal',
    steps: [
      { step: '1', icon: '📢', title: 'Seller Posts a Deal', desc: 'List products with expiry date, photos, and discounted price. Completely free.' },
      { step: '2', icon: '🔍', title: 'Buyer Finds It', desc: 'Search by category, location, or discount. Filter by expiry to find the best deals.' },
      { step: '3', icon: '📞', title: 'Contact & Buy', desc: 'Call or WhatsApp the seller directly. No commission, no middleman — ever.' },
    ],
    ctaTitle: 'Ready to post your first deal?',
    ctaSub: 'Reach thousands of buyers looking for discounts.',
    ctaBtn: '📢 Post Free Ad',
    badges: [
      { icon: '🆓', title: 'Free to Post', desc: 'No fees ever' },
      { icon: '📍', title: 'Bangladesh-wide', desc: 'All 64 districts' },
      { icon: '♻️', title: 'Reduce Waste', desc: 'Food saved from landfill' },
      { icon: '⚡', title: 'Instant Listing', desc: 'Live in minutes' },
    ],
  },
  bn: {
    badge: 'বাংলাদেশের #১ মেয়াদোত্তীর্ণ পণ্যের মার্কেটপ্লেস',
    hero: 'মেয়াদোত্তীর্ণ পণ্যে বড় ছাড়',
    heroSub: 'সর্বোচ্চ',
    heroSub2: 'পর্যন্ত সাশ্রয় করুন খাবার, মুদিপণ্য, প্রসাধনী ও আরও অনেক কিছুতে। অপচয় কমান, টাকা বাঁচান।',
    searchPlaceholder: 'পণ্য বা ব্র্যান্ড খুঁজুন...',
    allCategories: 'সব ক্যাটাগরি',
    search: 'খুঁজুন',
    browseDeal: '🔍 ডিল দেখুন',
    postDeal: '📢 বিজ্ঞাপন দিন — বিনামূল্যে!',
    activeDeals: 'সক্রিয় ডিল',
    productsListed: 'পণ্য তালিকাভুক্ত',
    toPost: 'বিজ্ঞাপন দিতে',
    browseByCategory: 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন',
    viewAll: 'সব দেখুন →',
    expiringSoon: '⏰ শীঘ্রই মেয়াদোত্তীর্ণ — তাড়াতাড়ি নিন!',
    seeAll: 'সব দেখুন →',
    justAdded: '🆕 নতুন যোগ হয়েছে',
    noListings: 'এখনো কোনো বিজ্ঞাপন নেই',
    noListingsSub: 'প্রথম ডিল পোস্ট করুন!',
    postFreeAd: 'বিনামূল্যে বিজ্ঞাপন দিন',
    howItWorks: 'কীভাবে কাজ করে',
    howItWorksSub: 'সহজ, দ্রুত, বিনামূল্যে — ৩ ধাপে পরবর্তী ডিল পান',
    steps: [
      { step: '১', icon: '📢', title: 'বিক্রেতা ডিল পোস্ট করেন', desc: 'মেয়াদ, ছবি এবং ছাড়ের মূল্য দিয়ে পণ্য তালিকাভুক্ত করুন। সম্পূর্ণ বিনামূল্যে।' },
      { step: '২', icon: '🔍', title: 'ক্রেতা খুঁজে পান', desc: 'ক্যাটাগরি, এলাকা বা ছাড় দিয়ে সার্চ করুন। সেরা ডিল খুঁজে নিন।' },
      { step: '৩', icon: '📞', title: 'যোগাযোগ করুন ও কিনুন', desc: 'সরাসরি ফোন বা হোয়াটসঅ্যাপে বিক্রেতার সাথে কথা বলুন। কোনো কমিশন নেই, কোনো মাঝখানের লোক নেই।' },
    ],
    ctaTitle: 'আপনার প্রথম ডিল পোস্ট করতে প্রস্তুত?',
    ctaSub: 'হাজার হাজার ক্রেতার কাছে পৌঁছান যারা ছাড় খুঁজছেন।',
    ctaBtn: '📢 বিনামূল্যে বিজ্ঞাপন দিন',
    badges: [
      { icon: '🆓', title: 'বিনামূল্যে পোস্ট', desc: 'কোনো ফি নেই' },
      { icon: '📍', title: 'সারা বাংলাদেশ', desc: 'সব ৬৪ জেলা' },
      { icon: '♻️', title: 'অপচয় কমান', desc: 'খাবার নষ্ট হওয়া থেকে বাঁচান' },
      { icon: '⚡', title: 'তাৎক্ষণিক তালিকা', desc: 'মিনিটের মধ্যে লাইভ' },
    ],
  },
}

export default function HomePage() {
  const { lang } = useLang()
  const t = T[lang]
  const [featured, setFeatured] = useState<any>({ just_added: [], expiring_soon: [] })
  const [categories, setCategories] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/listings/featured').then(r => r.json()).catch(() => ({ data: null })),
      fetch('/api/categories').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/stats/public').then(r => r.json()).catch(() => ({ data: null })),
    ]).then(([feat, cats, st]) => {
      setFeatured(feat.data || { just_added: [], expiring_soon: [] })
      setCategories(cats.data || [])
      setStats(st.data || null)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            {t.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
            {t.hero}
          </h1>
          <p className="text-orange-100 text-sm md:text-base mb-6 max-w-xl mx-auto">
            {t.heroSub} <strong className="text-white">70% off</strong> {t.heroSub2}
          </p>

          {/* Search form */}
          <form action="/listings" className="flex max-w-2xl mx-auto bg-white rounded-xl overflow-hidden shadow-xl mb-6">
            <input
              name="q"
              type="search"
              placeholder={t.searchPlaceholder}
              className="flex-1 px-4 py-3.5 text-sm text-gray-800 outline-none"
            />
            <select name="category" className="hidden sm:block border-l border-gray-200 px-3 py-3.5 text-sm text-gray-600 outline-none bg-white">
              <option value="">{t.allCategories}</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 text-sm transition-colors">
              {t.search}
            </button>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition text-sm shadow">
              {t.browseDeal}
            </Link>
            <Link href="/seller/listings/new" className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow">
              {t.postDeal}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📦', value: stats?.active_listings ?? '—', label: t.activeDeals },
            { icon: '♻️', value: stats?.total_listings ?? '—', label: t.productsListed },
            { icon: '💰', value: lang === 'en' ? 'Free' : 'বিনামূল্যে', label: t.toPost },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-black text-orange-600">{s.icon} {s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Categories grid */}
        {categories.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-base">{t.browseByCategory}</h2>
              <Link href="/listings" className="text-xs text-orange-600 hover:underline">{t.viewAll}</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/listings?category=${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-200 transition text-center group"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  <span className="text-xs text-gray-700 group-hover:text-orange-700 font-medium leading-tight">
                    {lang === 'bn' ? (CATEGORY_NAMES_BN[cat.slug] || cat.name) : cat.name}
                  </span>
                  {cat._count?.listings > 0 && (
                    <span className="text-[10px] text-gray-400">{cat._count.listings}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Expiring Soon */}
            {featured.expiring_soon?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-500 rounded inline-block"></span>
                    {t.expiringSoon}
                  </h2>
                  <Link href="/listings?sort=expiry_asc" className="text-xs text-orange-600 hover:underline">{t.seeAll}</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {featured.expiring_soon.map((l: any) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {/* Just Added */}
            {featured.just_added?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span className="w-1 h-5 bg-orange-500 rounded inline-block"></span>
                    {t.justAdded}
                  </h2>
                  <Link href="/listings?sort=newest" className="text-xs text-orange-600 hover:underline">{t.seeAll}</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {featured.just_added.map((l: any) => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}

            {/* Empty state */}
            {featured.expiring_soon?.length === 0 && featured.just_added?.length === 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                <p className="text-5xl mb-4">🛒</p>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t.noListings}</h2>
                <p className="text-gray-500 text-sm mb-6">{t.noListingsSub}</p>
                <Link href="/seller/listings/new" className="btn-primary">{t.postFreeAd}</Link>
              </section>
            )}
          </>
        )}

        {/* How it works */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-2 text-center">{t.howItWorks}</h2>
          <p className="text-sm text-gray-500 text-center mb-6">{t.howItWorksSub}</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {t.steps.map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-xl mb-1">{s.icon}</p>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">{t.ctaTitle}</p>
              <p className="text-xs text-gray-500">{t.ctaSub}</p>
            </div>
            <Link href="/seller/listings/new" className="btn-primary whitespace-nowrap">{t.ctaBtn}</Link>
          </div>
        </section>

        {/* Trust badges */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {t.badges.map(b => (
            <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl mb-1">{b.icon}</p>
              <p className="text-sm font-semibold text-gray-800">{b.title}</p>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}
