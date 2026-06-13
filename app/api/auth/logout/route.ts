import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => {})
  }
  const res = NextResponse.json({ success: true, data: { message: 'Logged out.' } })
  res.cookies.delete('refresh_token')
  return res
}
