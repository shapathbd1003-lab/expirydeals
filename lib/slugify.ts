import { nanoid } from 'nanoid'

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return `${base}-${nanoid(8)}`
}

export function daysRemaining(expiryDate: Date | string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  // Compare dates only (no time component)
  expiry.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return 'Expired'
  if (days === 0) return 'Expires today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function discountPct(original: number, discounted: number): number {
  return Math.round((1 - discounted / original) * 100 * 100) / 100
}
