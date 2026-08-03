import type { Metadata } from 'next'
import ContactContent from './ContactContent'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ExpiryDealsBD team for support or partnership inquiries.',
}

export default function ContactPage() {
  return <ContactContent />
}
