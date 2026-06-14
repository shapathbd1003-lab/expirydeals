import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers on every response
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; ')
  )

  // Simple in-memory rate limiting for auth routes via response header hint
  // Real rate limiting should be done at edge/CDN level (Vercel has it built-in)
  const pathname = req.nextUrl.pathname
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/forgot-password') ||
    pathname.startsWith('/api/auth/resend-verification')
  ) {
    res.headers.set('X-RateLimit-Policy', 'auth')
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
