import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, unauthorized, validationError, serverError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { status } = await req.json()
    if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
      return validationError('status must be active, suspended, or deleted')
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return notFound('User not found')

    await prisma.user.update({ where: { id: params.id }, data: { status } })

    // If suspending, hide their listings
    if (status === 'suspended' || status === 'deleted') {
      await prisma.listing.updateMany({
        where: { sellerId: params.id, status: 'active' },
        data: { status: 'paused' },
      })
    }

    return ok({ message: `User ${status}.` })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
