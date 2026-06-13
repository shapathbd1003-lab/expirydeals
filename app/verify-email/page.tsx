'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.ok ? setStatus('success') : setStatus('error'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'loading') return <p className="text-gray-500">Verifying your email...</p>
  if (status === 'success') return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
      <p className="text-gray-600 mb-6">Your account is now active.</p>
      <Link href="/login" className="btn-primary">Log in now</Link>
    </div>
  )
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid link</h2>
      <p className="text-gray-600 mb-6">This verification link is invalid or has expired.</p>
      <Link href="/register" className="btn-secondary">Register again</Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense><VerifyContent /></Suspense>
    </div>
  )
}
