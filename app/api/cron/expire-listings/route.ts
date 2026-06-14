import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'
import { err } from '@/lib/response'

export async function POST(req: NextRequest) {
  // Always require the cron secret — fail closed if not set
  const secret = req.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || secret !== cronSecret) {
    return err('UNAUTHORIZED', 'Invalid or missing cron secret', 401)
  }

  try {
    const result = await prisma.listing.updateMany({
      where: {
        status: { in: ['active', 'paused'] },
        expiryDate: { lt: new Date() },
      },
      data: { status: 'expired' },
    })

    console.log(`[cron] Expired ${result.count} listings`)
    return ok({ expired: result.count })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
