import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, forbidden, unauthorized, notFound, serverError } from '@/lib/response'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, 'admin')
    if ('error' in auth) return auth.status === 403 ? forbidden() : unauthorized()

    const { name, is_active } = await req.json()
    const id = parseInt(params.id)

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) return notFound('Category not found')

    const data: any = {}
    if (name !== undefined) data.name = name.trim()
    if (is_active !== undefined) data.isActive = is_active

    const cat = await prisma.category.update({ where: { id }, data })
    return ok(cat)
  } catch (e) {
    console.error(e)
    return serverError()
  }
}
