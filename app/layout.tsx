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
  keywords: ['near expiry products bangladesh', 'discount food dhaka', 'expiry deals bd', 'near expiry groceries', 'cheap groceries bangladesh'],
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    siteName: 'ExpiryDealsBD',
    locale: 'en_BD',
    url: BASE_URL,
    images: [{ url: '/logo.png', width: 800, height: 450, alt: 'ExpiryDealsBD' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'ExpiryDealsBD',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/listings?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ExpiryDealsBD',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      description: "Bangladesh's marketplace for near-expiry products at big discounts.",
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, '\\u003c') }}
        />
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
