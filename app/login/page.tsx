'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { Suspense } from 'react'

const T = {
  en: {
    welcomeBack: 'Welcome back', subtitle: 'Log in to your ExpiryDealsBD account',
    registeredTitle: '✅ Account created!',
    registeredBody: 'You can log in right away — no verification needed.',
    email: 'Email', password: 'Password',
    login: 'Log in', loggingIn: 'Logging in...',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?", signUp: 'Sign up',
  },
  bn: {
    welcomeBack: 'ফিরে আসার জন্য স্বাগতম', subtitle: 'আপনার ExpiryDealsBD অ্যাকাউন্টে লগ ইন করুন',
    registeredTitle: '✅ অ্যাকাউন্ট তৈরি হয়েছে!',
    registeredBody: 'আপনি এখনই লগ ইন করতে পারেন — কোনো যাচাইকরণের দরকার নেই।',
    email: 'ইমেইল', password: 'পাসওয়ার্ড',
    login: 'লগ ইন', loggingIn: 'লগ ইন হচ্ছে...',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    noAccount: 'অ্যাকাউন্ট নেই?', signUp: 'নিবন্ধন করুন',
  },
}

function LoginForm() {
  const { login } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === '1'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      if (result.role === 'admin') router.push('/admin')
      else router.push('/my/listings')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black">
              <span className="text-orange-500">Expiry</span><span className="text-gray-800">Deals</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{t.welcomeBack}</h1>
          <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
        </div>

        {justRegistered && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4 text-sm text-green-800">
            <p className="font-semibold mb-1">{t.registeredTitle}</p>
            <p>{t.registeredBody}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div>
            <label htmlFor="login-email" className="label">{t.email}</label>
            <input
              id="login-email" type="email" required className="input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">{t.password}</label>
            <input
              id="login-password" type="password" required className="input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.loggingIn : t.login}
          </button>
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
              {t.forgotPassword}
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {t.noAccount}{' '}
          <Link href="/register" className="text-orange-600 font-medium hover:underline">{t.signUp}</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
