'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '',
    role: searchParams.get('role') || 'buyer',
    business_name: '', business_city: '', business_region: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error?.message || 'Registration failed')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
        <p className="text-gray-600 mb-6">We sent a verification link to <strong>{form.email}</strong></p>
        <Link href="/login" className="btn-primary">Go to Login</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        {['buyer', 'seller'].map((r) => (
          <button
            key={r} type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition ${
              form.role === r
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {r === 'buyer' ? '🛒 I want to buy' : '🏪 I want to sell'}
          </button>
        ))}
      </div>

      <div>
        <label className="label">Full Name</label>
        <input type="text" required className="input"
          value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" required className="input"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label className="label">Phone</label>
        <input type="tel" className="input" placeholder="+1234567890"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="label">Password</label>
        <input type="password" required minLength={8} className="input"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
      </div>

      {form.role === 'seller' && (
        <>
          <hr className="border-gray-100" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Info</p>
          <div>
            <label className="label">Business Name <span className="text-red-500">*</span></label>
            <input type="text" required className="input"
              value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input type="text" className="input"
                value={form.business_city} onChange={(e) => setForm({ ...form, business_city: e.target.value })} />
            </div>
            <div>
              <label className="label">Region</label>
              <input type="text" className="input"
                value={form.business_region} onChange={(e) => setForm({ ...form, business_region: e.target.value })} />
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-gray-500">
        By signing up you agree to our{' '}
        <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>.
        Pharmaceutical listings must comply with local laws.
      </p>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl">🥦</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands saving money on near-expiry deals</p>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
