'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Suspense } from 'react'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('verify') === '1'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUnverified(false)
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.error) {
      // API now blocks unverified users with a specific message
      if (result.error.toLowerCase().includes('verify your email')) {
        setUnverified(true)
      } else {
        setError(result.error)
      }
    } else {
      if (result.role === 'admin') router.push('/admin')
      else router.push('/my/listings')
    }
  }

  const resendVerification = async () => {
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
      credentials: 'include',
    })
    setResendSent(true)
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
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your ExpiryDeals account</p>
        </div>

        {justRegistered && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4 text-sm text-green-800">
            <p className="font-semibold mb-1">📧 Check your email!</p>
            <p>We sent a verification link to your email address. Click it to activate your account, then log in here.</p>
          </div>
        )}

        {unverified && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">📧 Email not verified</p>
            <p className="mb-3">Please verify your email address to continue. Check your inbox for a verification link.</p>
            {resendSent ? (
              <p className="text-green-700 font-medium">✅ Verification email sent! Check your inbox.</p>
            ) : (
              <button onClick={resendVerification} className="text-orange-600 font-semibold hover:underline">
                Resend verification email →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div>
            <label htmlFor="login-email" className="label">Email</label>
            <input
              id="login-email" type="email" required className="input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input
              id="login-password" type="password" required className="input"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-orange-600 font-medium hover:underline">Sign up</Link>
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
