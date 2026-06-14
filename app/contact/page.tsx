import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ExpiryDeals team for support or partnership inquiries.',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">We&rsquo;d love to hear from you. Reach out for support, partnership, or any questions about ExpiryDeals.</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">✉️</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">Email Support</p>
            <a href="mailto:support@expirydeals.com" className="text-orange-600 hover:underline text-sm">
              support@expirydeals.com
            </a>
            <p className="text-xs text-gray-500 mt-1">We typically respond within 24 hours.</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">📍</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">Location</p>
            <p className="text-gray-600 text-sm">Dhaka, Bangladesh</p>
            <p className="text-xs text-gray-500 mt-1">Serving buyers and sellers across Bangladesh.</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🚩</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">Report a Listing</p>
            <p className="text-gray-600 text-sm">Use the &ldquo;Report this ad&rdquo; button on any listing page to flag inappropriate content.</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🤝</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">Business & Partnerships</p>
            <a href="mailto:hello@expirydeals.com" className="text-orange-600 hover:underline text-sm">
              hello@expirydeals.com
            </a>
            <p className="text-xs text-gray-500 mt-1">Bulk listings, advertising, or API access inquiries.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-orange-50 border border-orange-100 rounded-xl p-5 text-sm text-orange-800">
        <p className="font-semibold mb-1">Need help fast?</p>
        <p>Browse our <a href="/terms" className="underline hover:text-orange-900">Terms of Service</a> and <a href="/privacy" className="underline hover:text-orange-900">Privacy Policy</a> for common questions about how ExpiryDeals works.</p>
      </div>
    </div>
  )
}
