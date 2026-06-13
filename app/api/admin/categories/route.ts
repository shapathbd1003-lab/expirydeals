import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, forbidden, unauthorized, validationError, serverError } from '@/lib/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { listings: true } } },
    })
    return ok(categories)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { name } = await req.json()
    if (!name?.trim()) return validationError('name is required')

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const cat = await prisma.category.create({
      data: { name: name.trim(), slug, isActive: true },
    })
    return ok(cat, 201)
  } catch (e: any) {
    if (e?.code === 'P2002') return validationError('Category name already exists')
    console.error(e)
    return serverError()
  }
}
