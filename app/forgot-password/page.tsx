'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    checkEmail: 'Check your email',
    sentMsg: "If that email exists, we sent a reset link. It expires in 1 hour.",
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    subtitle: "Enter your email and we'll send you a reset link",
    email: 'Email', sending: 'Sending...', sendLink: 'Send Reset Link',
  },
  bn: {
    checkEmail: 'আপনার ইমেইল চেক করুন',
    sentMsg: 'যদি সেই ইমেইলটি বিদ্যমান থাকে, আমরা একটি রিসেট লিংক পাঠিয়েছি। এটি ১ ঘণ্টার মধ্যে মেয়াদ শেষ হবে।',
    backToLogin: 'লগ ইনে ফিরে যান',
    resetPassword: 'পাসওয়ার্ড রিসেট করুন',
    subtitle: 'আপনার ইমেইল লিখুন, আমরা আপনাকে একটি রিসেট লিংক পাঠাব',
    email: 'ইমেইল', sending: 'পাঠানো হচ্ছে...', sendLink: 'রিসেট লিংক পাঠান',
  },
}

export default function ForgotPasswordPage() {
  const { lang } = useLang()
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

  if (sent) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-2">{t.checkEmail}</h2>
        <p className="text-gray-600 mb-6">{t.sentMsg}</p>
        <Link href="/login" className="btn-secondary">{t.backToLogin}</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.resetPassword}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label htmlFor="forgot-email" className="label">{t.email}</label>
            <input id="forgot-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.sending : t.sendLink}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/login" className="text-orange-600 hover:underline">{t.backToLogin}</Link>
        </p>
      </div>
    </div>
  )
}
