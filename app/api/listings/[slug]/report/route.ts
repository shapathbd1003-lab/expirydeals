import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, validationError, unauthorized, serverError } from '@/lib/response'

const VALID_REASONS = ['spam', 'wrong_info', 'illegal_item', 'other']

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    const { reason, note } = await req.json()
    if (!reason || !VALID_REASONS.includes(reason)) {
      return validationError(`reason must be one of: ${VALID_REASONS.join(', ')}`)
    }

    const listing = await prisma.listing.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })
    if (!listing) return validationError('Listing not found')

    await prisma.report.upsert({
      where: { listingId_reporterId: { listingId: listing.id, reporterId: auth.user.userId } },
      create: { listingId: listing.id, reporterId: auth.user.userId, reason, note: note || null },
      update: { reason, note: note || null, status: 'open' },
    })

    return ok({ message: 'Report submitted. Thank you.' }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
