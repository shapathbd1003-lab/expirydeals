import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  title: { default: 'ExpiryDeals — Save on Near-Expiry Products', template: '%s | ExpiryDeals' },
  description: 'Find massive discounts on near-expiry food, groceries, health products and more from local sellers.',
  openGraph: { type: 'website', siteName: 'ExpiryDeals' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-800 text-gray-400 text-sm py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
              <p className="text-white font-semibold text-base">🥦 ExpiryDeals</p>
              <p>Connecting buyers and sellers of near-expiry products — saving money, reducing waste.</p>
              <p className="text-xs mt-4 text-gray-500">
                Sellers are solely responsible for the legality of their listings.
                ExpiryDeals does not handle payments or delivery.
              </p>
              <p className="text-xs">© {new Date().getFullYear()} ExpiryDeals. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
