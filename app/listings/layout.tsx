import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Near-Expiry Deals',
  description:
    'Browse discounted near-expiry food, groceries, cosmetics, medicine and more across all 64 districts of Bangladesh. Filter by category, location and price.',
}

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
