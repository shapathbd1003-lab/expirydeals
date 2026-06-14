import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'

export const revalidate = 300 // cache 5 minutes

export async function GET() {
  try {
    const [active_listings, total_listings] = await Promise.all([
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.listing.count({ where: { status: { not: 'deleted' } } }),
    ])
    return ok({ active_listings, total_listings })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
