'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BuyerProfilePage() {
  const { user, token, loading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', phone: '', storeName: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
    if (user) setForm(f => ({ ...f, fullName: user.full_name || '', phone: user.phone || '', storeName: user.business_name || '' }))
  }, [user, authLoading, router])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const body: any = { fullName: form.fullName, phone: form.phone, business_name: form.storeName }
      if (form.newPassword) {
        body.current_password = form.currentPassword
        body.new_password = form.newPassword
      }
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/users/me', {
        method: 'PATCH', headers, credentials: 'include', body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message || data.message || 'Failed to update'); return }
      setSuccess('Profile updated!')
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
      if (refreshUser) refreshUser()
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return null

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">← My Ads</Link>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">
        <div>
          <label className="label">Email</label>
          <input className="input bg-gray-50 text-gray-500" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="label">Full Name *</label>
          <input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Store / Business Name <span className="text-gray-400 font-normal">(shown on your listings)</span></label>
          <input className="input" placeholder="e.g. Rahim Traders, City Mart" value={form.storeName} onChange={e => set('storeName', e.target.value)} />
        </div>

        <hr className="border-gray-100" />
        <p className="text-sm font-medium text-gray-700">Change Password <span className="text-gray-400 font-normal">(optional)</span></p>

        <div>
          <label className="label">Current Password</label>
          <input className="input" type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input className="input" type="password" placeholder="Min 8 characters" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
