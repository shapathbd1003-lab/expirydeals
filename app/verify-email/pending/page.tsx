'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resendSent, setResendSent] = useState(false)
  const [resending, setResending] = useState(false)

  const resend = async () => {
    if (!email || resending) return
    setResending(true)
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResending(false)
    setResendSent(true)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-600 mb-1">We sent a verification link to:</p>
        {email && (
          <p className="font-semibold text-gray-900 mb-6">{email}</p>
        )}
        <p className="text-gray-500 text-sm mb-8">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-left space-y-2">
          <p className="font-semibold text-orange-800">Didn&apos;t receive it?</p>
          <ul className="text-orange-700 space-y-1 list-disc list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Wait a minute and try resending</li>
          </ul>
        </div>

        {resendSent ? (
          <p className="text-green-600 font-medium mb-4">✅ Verification email resent! Check your inbox.</p>
        ) : (
          <button
            onClick={resend}
            disabled={resending || !email}
            className="btn-primary w-full mb-4"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
        )}

        <p className="text-sm text-gray-500">
          Already verified?{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  )
}
