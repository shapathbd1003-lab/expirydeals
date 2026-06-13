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
        </AuthProvider>
      </body>
    </html>
  )
}
