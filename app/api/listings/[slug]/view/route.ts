import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, serverError } from '@/lib/response'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { id: true, status: true },
    })
    if (!listing || listing.status === 'deleted') return ok({})

    const { session_id } = await req.json().catch(() => ({}))
    if (!session_id) return ok({})

    // Deduplicate by session_id
    const existing = await prisma.listingView.findFirst({
      where: { listingId: listing.id, sessionId: session_id },
    })
    if (existing) return ok({})

    const user = await getAuthUser(req)

    await prisma.$transaction([
      prisma.listingView.create({
        data: {
          listingId: listing.id,
          viewerId: user?.userId || null,
          sessionId: session_id,
        },
      }),
      prisma.listing.update({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
      }),
    ])

    // Track recently viewed for authenticated users
    if (user?.userId) {
      await prisma.recentlyViewed.upsert({
        where: { userId_listingId: { userId: user.userId, listingId: listing.id } },
        create: { userId: user.userId, listingId: listing.id },
        update: { viewedAt: new Date() },
      })
    }

    return ok({})
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
