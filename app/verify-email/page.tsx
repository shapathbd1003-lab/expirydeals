'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { Suspense } from 'react'

const T = {
  en: {
    verifying: 'Verifying your email...',
    verified: 'Email verified!', activeMsg: 'Your account is now active.', loginNow: 'Log in now',
    invalidLink: 'Invalid link', expiredMsg: 'This verification link is invalid or has expired.',
    registerAgain: 'Register again',
  },
  bn: {
    verifying: 'আপনার ইমেইল যাচাই করা হচ্ছে...',
    verified: 'ইমেইল যাচাই সম্পন্ন!', activeMsg: 'আপনার অ্যাকাউন্ট এখন সক্রিয়।', loginNow: 'এখনই লগ ইন করুন',
    invalidLink: 'অবৈধ লিংক', expiredMsg: 'এই যাচাইকরণ লিংকটি অবৈধ অথবা মেয়াদ শেষ হয়ে গেছে।',
    registerAgain: 'আবার নিবন্ধন করুন',
  },
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const t = T[lang]
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

  if (status === 'loading') return <p className="text-gray-500">{t.verifying}</p>
  if (status === 'success') return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.verified}</h2>
      <p className="text-gray-600 mb-6">{t.activeMsg}</p>
      <Link href="/login" className="btn-primary">{t.loginNow}</Link>
    </div>
  )
  return (
    <div className="text-center">
      <div className="text-5xl mb-4">❌</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.invalidLink}</h2>
      <p className="text-gray-600 mb-6">{t.expiredMsg}</p>
      <Link href="/register" className="btn-secondary">{t.registerAgain}</Link>
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
