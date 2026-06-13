import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'

// Called by a cron job or Railway cron — protect with a secret header
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return ok({ error: 'Unauthorized' })
  }

  try {
    const result = await prisma.listing.updateMany({
      where: {
        status: 'active',
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
