'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
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
      setError(data.error?.message || 'Registration failed')
    } else if (data.data?.auto_verified) {
      router.push('/login?registered=1')
    } else {
      router.push('/login?verify=1')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <div>
        <label htmlFor="reg-name" className="label">Full Name</label>
        <input id="reg-name" type="text" required className="input"
          value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-email" className="label">Email</label>
        <input id="reg-email" type="email" required className="input"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-phone" className="label">Phone</label>
        <input id="reg-phone" type="tel" className="input" placeholder="01XXXXXXXXX"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label htmlFor="reg-password" className="label">Password</label>
        <input id="reg-password" type="password" required minLength={8} className="input"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
      </div>

      <p className="text-xs text-gray-500">
        By signing up you agree to our{' '}
        <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>.
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
          <p className="text-gray-500 text-sm mt-1">Buy and sell near-expiry products in Bangladesh</p>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
