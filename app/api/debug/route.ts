import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const count = await prisma.listing.count()
    const dbUrl = process.env.DATABASE_URL
    return NextResponse.json({
      listing_count: count,
      db_url_prefix: dbUrl ? dbUrl.substring(0, 50) + '...' : 'NOT SET',
      env: process.env.NODE_ENV,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, db_url_prefix: (process.env.DATABASE_URL || 'NOT SET').substring(0, 50) }, { status: 500 })
  }
}
