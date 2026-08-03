'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { Suspense } from 'react'

const T = {
  en: {
    checkEmail: 'Check your email',
    sentTo: 'We sent a verification link to:',
    instructions: 'Click the link in the email to activate your account. The link expires in 24 hours.',
    notReceived: "Didn't receive it?",
    tip1: 'Check your spam or junk folder',
    tip2: 'Make sure the email address is correct',
    tip3: 'Wait a minute and try resending',
    resentMsg: '✅ Verification email resent! Check your inbox.',
    sending: 'Sending...', resendBtn: 'Resend verification email',
    alreadyVerified: 'Already verified?', login: 'Log in',
  },
  bn: {
    checkEmail: 'আপনার ইমেইল চেক করুন',
    sentTo: 'আমরা একটি যাচাইকরণ লিংক পাঠিয়েছি:',
    instructions: 'আপনার অ্যাকাউন্ট সক্রিয় করতে ইমেইলের লিংকে ক্লিক করুন। লিংকটি ২৪ ঘণ্টার মধ্যে মেয়াদ শেষ হবে।',
    notReceived: 'পাননি?',
    tip1: 'আপনার স্প্যাম বা জাঙ্ক ফোল্ডার চেক করুন',
    tip2: 'ইমেইল ঠিকানা সঠিক কিনা নিশ্চিত করুন',
    tip3: 'কিছুক্ষণ অপেক্ষা করে আবার পাঠানোর চেষ্টা করুন',
    resentMsg: '✅ যাচাইকরণ ইমেইল আবার পাঠানো হয়েছে! আপনার ইনবক্স দেখুন।',
    sending: 'পাঠানো হচ্ছে...', resendBtn: 'যাচাইকরণ ইমেইল আবার পাঠান',
    alreadyVerified: 'ইতিমধ্যে যাচাই করা হয়েছে?', login: 'লগ ইন',
  },
}

function PendingContent() {
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const t = T[lang]
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.checkEmail}</h1>
        <p className="text-gray-600 mb-1">{t.sentTo}</p>
        {email && (
          <p className="font-semibold text-gray-900 mb-6">{email}</p>
        )}
        <p className="text-gray-500 text-sm mb-8">
          {t.instructions}
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-left space-y-2">
          <p className="font-semibold text-orange-800">{t.notReceived}</p>
          <ul className="text-orange-700 space-y-1 list-disc list-inside">
            <li>{t.tip1}</li>
            <li>{t.tip2}</li>
            <li>{t.tip3}</li>
          </ul>
        </div>

        {resendSent ? (
          <p className="text-green-600 font-medium mb-4">{t.resentMsg}</p>
        ) : (
          <button
            onClick={resend}
            disabled={resending || !email}
            className="btn-primary w-full mb-4"
          >
            {resending ? t.sending : t.resendBtn}
          </button>
        )}

        <p className="text-sm text-gray-500">
          {t.alreadyVerified}{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">{t.login}</Link>
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
