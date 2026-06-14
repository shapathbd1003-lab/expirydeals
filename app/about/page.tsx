import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About ExpiryDeals',
  description: 'ExpiryDeals connects Bangladeshi buyers and sellers of near-expiry products at massive discounts — reducing waste and saving money.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About ExpiryDeals</h1>
      <p className="text-orange-600 font-medium mb-8">Bangladesh&rsquo;s marketplace for near-expiry products.</p>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p>Every year, tons of perfectly safe food and consumer products are thrown away simply because their expiry date is approaching. ExpiryDeals was built to connect sellers who have surplus near-expiry stock with buyers looking for genuine discounts — reducing waste and saving money at the same time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: '1', title: 'Sellers Post Free', desc: 'Businesses and individuals list near-expiry products at discounted prices. No commission, no fees.' },
              { n: '2', title: 'Buyers Browse', desc: 'Browse hundreds of listings by category, city, discount percentage, or expiry date.' },
              { n: '3', title: 'Direct Contact', desc: 'Buyers contact sellers directly via phone or WhatsApp. We facilitate the connection, not the transaction.' },
            ].map((step) => (
              <div key={step.n} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">{step.n}</div>
                <p className="font-semibold text-gray-900 mb-1 text-sm">{step.title}</p>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Who We Serve</h2>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li><strong>Retailers &amp; shops</strong> — clear near-expiry stock quickly instead of discarding it.</li>
            <li><strong>Restaurants &amp; hotels</strong> — sell surplus ingredients before they expire.</li>
            <li><strong>Individuals</strong> — resell groceries or products bought in bulk.</li>
            <li><strong>Budget-conscious buyers</strong> — access quality products at 20–80% discounts.</li>
          </ul>
        </section>

        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <p className="font-semibold mb-1">Important Disclaimer</p>
          <p>ExpiryDeals does not verify product safety or quality. Always inspect expiry dates and product condition before purchasing. ExpiryDeals is not responsible for transactions between buyers and sellers. Use good judgment and meet in public places.</p>
        </section>

        <div className="flex gap-3">
          <Link href="/listings" className="btn-primary">Browse Listings</Link>
          <Link href="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
