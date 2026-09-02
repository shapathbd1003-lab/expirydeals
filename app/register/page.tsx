'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { Suspense } from 'react'

const T = {
  en: {
    createAccount: 'Create your account', subtitle: 'Buy and sell near-expiry products in Bangladesh',
    fullName: 'Full Name', email: 'Email', phone: 'Phone', password: 'Password',
    minChars: 'Minimum 8 characters',
    agreeText: 'By signing up you agree to our', terms: 'Terms of Service',
    creating: 'Creating account...', createBtn: 'Create Account',
    haveAccount: 'Already have an account?', login: 'Log in',
    failedMsg: 'Registration failed',
  },
  bn: {
    createAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন', subtitle: 'বাংলাদেশে মেয়াদ শেষ হওয়ার কাছাকাছি পণ্য কিনুন ও বিক্রি করুন',
    fullName: 'পূর্ণ নাম', email: 'ইমেইল', phone: 'ফোন', password: 'পাসওয়ার্ড',
    minChars: 'কমপক্ষে ৮টি অক্ষর',
    agreeText: 'নিবন্ধন করার মাধ্যমে আপনি আমাদের সাথে সম্মত হচ্ছেন', terms: 'সেবার শর্তাবলী',
    creating: 'অ্যাকাউন্ট তৈরি হচ্ছে...', createBtn: 'অ্যাকাউন্ট তৈরি করুন',
    haveAccount: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?', login: 'লগ ইন',
    failedMsg: 'নিবন্ধন ব্যর্থ হয়েছে',
  },
}

function RegisterForm() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'user' }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error?.message || t.failedMsg)
    } else {
      router.push('/login?registered=1')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div>
        <label htmlFor="reg-name" className="label">{t.fullName}</label>
        <input id="reg-name" type="text" required className="input"
          value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-email" className="label">{t.email}</label>
        <input id="reg-email" type="email" required className="input"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-phone" className="label">{t.phone} *</label>
        <input id="reg-phone" type="tel" required className="input" placeholder="01XXXXXXXXX"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-password" className="label">{t.password}</label>
        <input id="reg-password" type="password" required minLength={8} className="input"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="text-xs text-gray-500 mt-1">{t.minChars}</p>
      </div>

      <p className="text-xs text-gray-500">
        {t.agreeText}{' '}
        <Link href="/terms" className="text-orange-600 hover:underline">{t.terms}</Link>.
      </p>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? t.creating : t.createBtn}
      </button>
    </form>
  )
}

export default function RegisterPage() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">🥦</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{t.createAccount}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="text-center text-sm text-gray-600 mt-4">
          {t.haveAccount}{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">{t.login}</Link>
        </p>
      </div>
    </div>
  )
}
