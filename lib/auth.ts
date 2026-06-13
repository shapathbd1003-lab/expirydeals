import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 // 7 days in seconds

export interface JwtPayload {
  userId: string
  role: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return verifyAccessToken(token)
  }

  // Also check cookie for SSR
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (token) return verifyAccessToken(token)

  return null
}

export async function requireAuth(req: NextRequest, role?: string) {
  const user = await getAuthUser(req)
  if (!user) {
    return { error: 'UNAUTHORIZED', status: 401 }
  }
  if (role && user.role !== role) {
    return { error: 'FORBIDDEN', status: 403 }
  }
  return { user }
}

export function setRefreshTokenCookie(token: string) {
  return {
    name: 'refresh_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: REFRESH_TOKEN_EXPIRY,
    path: '/',
  }
}
