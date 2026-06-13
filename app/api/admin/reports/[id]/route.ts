import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, unauthorized, validationError, serverError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { action } = await req.json()
    if (!action || !['dismiss', 'remove_listing'].includes(action)) {
      return validationError('action must be dismiss or remove_listing')
    }

    const report = await prisma.report.findUnique({ where: { id: params.id } })
    if (!report) return notFound('Report not found')

    const newStatus = action === 'dismiss' ? 'resolved_dismissed' : 'resolved_removed'

    if (action === 'remove_listing') {
      await prisma.listing.update({ where: { id: report.listingId }, data: { status: 'deleted' } })
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { status: newStatus, resolvedBy: auth.user.userId, resolvedAt: new Date() },
    })

    return ok({ status: updated.status })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
