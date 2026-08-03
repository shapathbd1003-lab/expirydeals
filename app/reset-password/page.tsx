'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { Suspense } from 'react'

const T = {
  en: {
    setNewPassword: 'Set New Password',
    newPassword: 'New Password', confirmPassword: 'Confirm Password',
    updating: 'Updating...', updateBtn: 'Update Password',
    updated: 'Password updated!', login: 'Log in',
    mismatch: 'Passwords do not match', failedMsg: 'Reset failed',
  },
  bn: {
    setNewPassword: 'নতুন পাসওয়ার্ড সেট করুন',
    newPassword: 'নতুন পাসওয়ার্ড', confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    updating: 'হালনাগাদ হচ্ছে...', updateBtn: 'পাসওয়ার্ড হালনাগাদ করুন',
    updated: 'পাসওয়ার্ড হালনাগাদ হয়েছে!', login: 'লগ ইন',
    mismatch: 'পাসওয়ার্ড মিলছে না', failedMsg: 'রিসেট ব্যর্থ হয়েছে',
  },
}

function ResetForm() {
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const t = T[lang]
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError(t.mismatch); return }
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) setError(data.error?.message || t.failedMsg)
    else setSuccess(true)
  }

  if (success) return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2">{t.updated}</h2>
      <Link href="/login" className="btn-primary">{t.login}</Link>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <div>
        <label htmlFor="reset-password" className="label">{t.newPassword}</label>
        <input id="reset-password" type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="label">{t.confirmPassword}</label>
        <input id="reset-confirm" type="password" required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t.updating : t.updateBtn}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">{t.setNewPassword}</h1>
        <Suspense><ResetForm /></Suspense>
      </div>
    </div>
  )
}
