import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/response'

export async function POST(req: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: auth.user.userId, listingId: params.listingId } },
      create: { userId: auth.user.userId, listingId: params.listingId },
      update: {},
    })
    return ok({ saved: true }, 201)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { listingId: string } }) {
  try {
    const auth = await requireAuth(req)
    if ('error' in auth) return unauthorized()

    await prisma.favorite
      .delete({ where: { userId_listingId: { userId: auth.user.userId, listingId: params.listingId } } })
      .catch(() => {})
    return ok({ saved: false })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
