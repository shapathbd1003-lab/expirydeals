import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'
import { getAuthUser } from '@/lib/auth'
import { startOfToday } from '@/lib/slugify'

export async function GET(req: NextRequest) {
  try {
    // Count only listings the caller can actually see in browse:
    // active, not expired, and not their own
    const authUser = await getAuthUser(req)
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true,
        _count: {
          select: {
            listings: {
              where: {
                status: 'active',
                expiryDate: { gte: startOfToday() },
                ...(authUser ? { sellerId: { not: authUser.userId } } : {}),
              },
            },
          },
        },
      },
    })
    return ok(categories)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
