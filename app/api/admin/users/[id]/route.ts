import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, notFound, forbidden, unauthorized, validationError, serverError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const body = await req.json()

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return notFound('User not found')

    // Toggle seller verification
    if (body.is_verified_seller !== undefined) {
      await prisma.user.update({ where: { id: params.id }, data: { isVerifiedSeller: !!body.is_verified_seller } })
      return ok({ message: body.is_verified_seller ? 'Seller verified.' : 'Seller verification removed.' })
    }

    const { status } = body
    if (!status || !['active', 'suspended', 'deleted'].includes(status)) {
      return validationError('status must be active, suspended, or deleted')
    }

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
