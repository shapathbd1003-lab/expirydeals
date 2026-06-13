'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) setError(data.error?.message || 'Reset failed')
    else setSuccess(true)
  }

  if (success) return (
    <div className="text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2">Password updated!</h2>
      <Link href="/login" className="btn-primary">Log in</Link>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
      <div>
        <label className="label">New Password</label>
        <input type="password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="label">Confirm Password</label>
        <input type="password" required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Set New Password</h1>
        <Suspense><ResetForm /></Suspense>
      </div>
    </div>
  )
}
