import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-white font-bold text-base mb-1">ExpiryDeals</p>
            <p className="text-xs text-gray-500 leading-relaxed">Bangladesh&rsquo;s marketplace for near-expiry products at big discounts.</p>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">Browse</p>
            <ul className="space-y-1">
              <li><Link href="/listings" className="hover:text-orange-400 transition-colors">All Listings</Link></li>
              <li><Link href="/listings?sort=expiry_asc" className="hover:text-orange-400 transition-colors">Expiring Soon</Link></li>
              <li><Link href="/listings?sort=discount_desc" className="hover:text-orange-400 transition-colors">Best Discounts</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">Company</p>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-gray-300 font-semibold mb-2">Legal</p>
            <ul className="space-y-1">
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} ExpiryDeals Bangladesh. All rights reserved.</p>
          <p className="text-center">
            ExpiryDeals does not handle payments or deliveries. Always inspect products before purchasing.
          </p>
        </div>
      </div>
    </footer>
  )
}
