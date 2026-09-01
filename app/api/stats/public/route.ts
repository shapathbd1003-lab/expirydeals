import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'
import { startOfToday } from '@/lib/slugify'

// Force per-request execution — without this, Next.js statically freezes the
// response (and "today") at build/deploy time since no dynamic APIs are read.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [active_listings, total_listings] = await Promise.all([
      prisma.listing.count({
        where: {
          status: 'active',
          OR: [
            { listingType: { not: 'near_expiry' } },
            { expiryDate: { gte: startOfToday() } },
          ],
        },
      }),
      // "Products Listed" = ever actually published (excludes drafts never
      // submitted and pending items still awaiting admin approval)
      prisma.listing.count({ where: { status: { notIn: ['deleted', 'draft', 'pending'] } } }),
    ])
    return ok({ active_listings, total_listings })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
