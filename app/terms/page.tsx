import type { Metadata } from 'next'
import TermsContent from './TermsContent'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for ExpiryDealsBD — the Bangladesh marketplace for near-expiry products.',
}

export default function TermsPage() {
  return <TermsContent />
}
