import type { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About ExpiryDealsBD',
  description: 'ExpiryDealsBD connects Bangladeshi buyers and sellers of near-expiry products at massive discounts — reducing waste and saving money.',
}

export default function AboutPage() {
  return <AboutContent />
}
