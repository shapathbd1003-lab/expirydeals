import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, forbidden, unauthorized, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers, totalAdmins, totalActiveListings,
      listingsThisWeek, contactsThisWeek, openReports,
    ] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'deleted' } } }),
      prisma.user.count({ where: { role: 'admin', status: { not: 'deleted' } } }),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.listing.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.listingContact.count({ where: { contactedAt: { gte: weekAgo } } }),
      prisma.report.count({ where: { status: 'open' } }),
    ])

    return ok({
      total_users: totalUsers,
      total_admins: totalAdmins,
      total_active_listings: totalActiveListings,
      listings_created_this_week: listingsThisWeek,
      contact_clicks_this_week: contactsThisWeek,
      open_reports: openReports,
    })
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
