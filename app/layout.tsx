import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/hooks/useAuth'
import { LangProvider } from '@/hooks/useLang'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://expirydeals.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: 'ExpiryDealsBD — Save on Near-Expiry Products in Bangladesh', template: '%s | ExpiryDealsBD' },
  description: 'Find massive discounts on near-expiry food, groceries, health products and more from local sellers across Bangladesh.',
  keywords: ['near expiry products bangladesh', 'discount food dhaka', 'expiry deals bd', 'near expiry groceries'],
  openGraph: {
    type: 'website',
    siteName: 'ExpiryDealsBD',
    locale: 'en_BD',
    url: BASE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LangProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
