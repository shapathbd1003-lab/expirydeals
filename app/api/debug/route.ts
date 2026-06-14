import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, unauthorized, forbidden, serverError } from '@/lib/response'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Admin-only debug endpoint — never exposes secrets
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const count = await prisma.listing.count()
    return ok({
      listing_count: count,
      env: process.env.NODE_ENV,
      db_connected: true,
    })
  } catch (e: any) {
    console.error(e)
    return serverError()
  }
}
