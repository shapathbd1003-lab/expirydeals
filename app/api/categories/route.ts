import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/response'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true,
        _count: { select: { listings: { where: { status: 'active' } } } },
      },
    })
    return ok(categories)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
