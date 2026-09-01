import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'
import { startOfToday } from '@/lib/slugify'

// Force per-request execution — without this, Next.js statically freezes the
// response (and "today") at build/deploy time since no dynamic APIs are read.
export const dynamic = 'force-dynamic'

// Public + edge-cached. Counts include only active listings, and only
// exclude expired ones for near-expiry (new/used listings have no expiry date).
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true, group: true, icon: true,
        _count: {
          select: {
            listings: {
              where: {
                status: 'active',
                OR: [
                  { listingType: { not: 'near_expiry' } },
                  { expiryDate: { gte: startOfToday() } },
                ],
              },
            },
          },
        },
      },
    })
    return ok(categories)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
