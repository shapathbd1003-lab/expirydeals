import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, forbidden, unauthorized, notFound, validationError, serverError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { action } = await req.json()
    if (!action) return validationError('action is required')

    const existing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!existing) return notFound('Listing not found')

    if (action === 'approve') {
      if (existing.status !== 'pending') return validationError('Only pending listings can be approved')
      const listing = await prisma.listing.update({
        where: { id: params.id },
        data: { status: 'active' },
      })
      return ok(listing)
    }

    if (action === 'activate') {
      if (!['paused', 'expired'].includes(existing.status)) return validationError('Only paused or expired listings can be activated')
      const listing = await prisma.listing.update({
        where: { id: params.id },
        data: { status: 'active' },
      })
      return ok(listing)
    }

    if (action === 'pause') {
      const listing = await prisma.listing.update({
        where: { id: params.id },
        data: { status: 'paused' },
      })
      return ok(listing)
    }

    if (action === 'delete') {
      const listing = await prisma.listing.update({
        where: { id: params.id },
        data: { status: 'deleted' },
      })
      return ok(listing)
    }

    return validationError('Invalid action. Use: approve, activate, pause, delete')
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
