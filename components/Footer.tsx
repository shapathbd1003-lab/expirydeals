'use client'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    tagline: "Bangladesh's marketplace for near-expiry products at big discounts.",
    browse: 'Browse',
    allListings: 'All Listings',
    expiringSoon: 'Expiring Soon',
    bestDiscounts: 'Best Discounts',
    company: 'Company',
    aboutUs: 'About Us',
    contact: 'Contact',
    legal: 'Legal',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    copyright: 'ExpiryDealsBD. All rights reserved.',
    disclaimer: 'ExpiryDealsBD does not handle payments or deliveries. Always inspect products before purchasing.',
  },
  bn: {
    tagline: 'বাংলাদেশের মেয়াদোত্তীর্ণ পণ্যের মার্কেটপ্লেস — বড় ছাড়ে কিনুন।',
    browse: 'ব্রাউজ',
    allListings: 'সব বিজ্ঞাপন',
    expiringSoon: 'শীঘ্রই মেয়াদোত্তীর্ণ',
    bestDiscounts: 'সর্বোচ্চ ছাড়',
    company: 'প্রতিষ্ঠান',
    aboutUs: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    legal: 'আইনি তথ্য',
    terms: 'সেবার শর্তাবলী',
    privacy: 'গোপনীয়তা নীতি',
    copyright: 'এক্সপায়ারিডিলস বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
    disclaimer: 'এক্সপায়ারিডিলস কোনো পেমেন্ট বা ডেলিভারি পরিচালনা করে না। কেনার আগে পণ্য যাচাই করুন।',
  },
}

export function Footer() {
  const { lang } = useLang()
  const t = T[lang]

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white font-bold text-base mb-1">ExpiryDealsBD</p>
            <p className="text-xs text-gray-500 leading-relaxed">{t.tagline}</p>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">{t.browse}</p>
            <ul className="space-y-1">
              <li><Link href="/listings" className="hover:text-orange-400 transition-colors">{t.allListings}</Link></li>
              <li><Link href="/listings?sort=expiry_asc" className="hover:text-orange-400 transition-colors">{t.expiringSoon}</Link></li>
              <li><Link href="/listings?sort=discount_desc" className="hover:text-orange-400 transition-colors">{t.bestDiscounts}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">{t.company}</p>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">{t.aboutUs}</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">{t.contact}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">{t.legal}</p>
            <ul className="space-y-1">
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">{t.terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">{t.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} {t.copyright}</p>
          <p className="text-center">{t.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
