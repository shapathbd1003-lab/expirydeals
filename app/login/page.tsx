'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
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
      setError(result.error)
    } else {
      const res = await fetch('/api/users/me', { credentials: 'include' })
      const data = await res.json()
      const user = data?.data
      if (user && !user.email_verified) {
        setUnverified(true)
        return
      }
      if (user?.role === 'admin') router.push('/admin')
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

        {/* Test credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-xs text-blue-800 space-y-2">
          <p className="font-bold text-blue-900 mb-1">🧪 Test Accounts</p>
          {[
            { role: 'Buyer', email: 'buyer@test.com', pass: 'Test@1234' },
            { role: 'Seller', email: 'seller@test.com', pass: 'Test@1234' },
            { role: 'Admin', email: 'admin@expirydeals.com', pass: 'Admin@123456' },
          ].map(({ role, email, pass }) => (
            <button key={role} type="button"
              onClick={() => setForm({ email, password: pass })}
              className="w-full text-left flex items-center justify-between bg-white border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition">
              <span><span className="font-semibold">{role}:</span> {email}</span>
              <span className="text-blue-500 font-mono">{pass}</span>
            </button>
          ))}
          <p className="text-blue-500 text-center">Click any row to auto-fill</p>
        </div>

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
            <label className="label">Email</label>
            <input
              type="email" required className="input"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password" required className="input"
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
