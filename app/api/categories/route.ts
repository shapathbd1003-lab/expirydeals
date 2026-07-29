import { prisma } from '@/lib/prisma'
import { okCached, serverError } from '@/lib/response'
import { startOfToday } from '@/lib/slugify'

// Force per-request execution — without this, Next.js statically freezes the
// response (and "today") at build/deploy time since no dynamic APIs are read.
export const dynamic = 'force-dynamic'

// Public + edge-cached. Counts include only active, non-expired listings.
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true,
        _count: {
          select: {
            listings: {
              where: {
                status: 'active',
                expiryDate: { gte: startOfToday() },
              },
            },
          },
        },
      },
    })
    return okCached(categories, 60)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
