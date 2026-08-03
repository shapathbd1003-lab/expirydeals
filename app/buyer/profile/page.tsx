'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const T = {
  en: {
    myAds: '← My Ads', myProfile: 'My Profile',
    email: 'Email', fullName: 'Full Name', phone: 'Phone',
    storeName: 'Store / Business Name', storeNameHint: '(shown on your listings)', storeNamePlaceholder: 'e.g. Rahim Traders, City Mart',
    changePassword: 'Change Password', optional: '(optional)',
    currentPassword: 'Current Password', newPassword: 'New Password', newPasswordPlaceholder: 'Min 8 characters',
    confirmNewPassword: 'Confirm New Password',
    saving: 'Saving...', saveChanges: 'Save Changes',
    updated: 'Profile updated!',
    mismatchErr: 'New passwords do not match',
    tooShortErr: 'New password must be at least 8 characters',
    failedErr: 'Failed to update',
  },
  bn: {
    myAds: '← আমার বিজ্ঞাপন', myProfile: 'আমার প্রোফাইল',
    email: 'ইমেইল', fullName: 'পূর্ণ নাম', phone: 'ফোন',
    storeName: 'দোকান / ব্যবসার নাম', storeNameHint: '(আপনার বিজ্ঞাপনে দেখানো হবে)', storeNamePlaceholder: 'যেমন: রহিম ট্রেডার্স, সিটি মার্ট',
    changePassword: 'পাসওয়ার্ড পরিবর্তন করুন', optional: '(ঐচ্ছিক)',
    currentPassword: 'বর্তমান পাসওয়ার্ড', newPassword: 'নতুন পাসওয়ার্ড', newPasswordPlaceholder: 'কমপক্ষে ৮টি অক্ষর',
    confirmNewPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
    saving: 'সংরক্ষণ হচ্ছে...', saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
    updated: 'প্রোফাইল হালনাগাদ হয়েছে!',
    mismatchErr: 'নতুন পাসওয়ার্ড মিলছে না',
    tooShortErr: 'নতুন পাসওয়ার্ড কমপক্ষে ৮টি অক্ষরের হতে হবে',
    failedErr: 'হালনাগাদ ব্যর্থ হয়েছে',
  },
}

export default function BuyerProfilePage() {
  const { user, token, loading: authLoading, refreshUser } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
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
      setError(t.mismatchErr)
      return
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError(t.tooShortErr)
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
      if (!res.ok) { setError(data.error?.message || data.message || t.failedErr); return }
      setSuccess(t.updated)
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
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">{t.myAds}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.myProfile}</h1>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">{success}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">
        <div>
          <label className="label">{t.email}</label>
          <input className="input bg-gray-50 text-gray-500" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="label">{t.fullName} *</label>
          <input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t.phone}</label>
          <input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">{t.storeName} <span className="text-gray-400 font-normal">{t.storeNameHint}</span></label>
          <input className="input" placeholder={t.storeNamePlaceholder} value={form.storeName} onChange={e => set('storeName', e.target.value)} />
        </div>

        <hr className="border-gray-100" />
        <p className="text-sm font-medium text-gray-700">{t.changePassword} <span className="text-gray-400 font-normal">{t.optional}</span></p>

        <div>
          <label className="label">{t.currentPassword}</label>
          <input className="input" type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} />
        </div>
        <div>
          <label className="label">{t.newPassword}</label>
          <input className="input" type="password" placeholder={t.newPasswordPlaceholder} value={form.newPassword} onChange={e => set('newPassword', e.target.value)} />
        </div>
        <div>
          <label className="label">{t.confirmNewPassword}</label>
          <input className="input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
          {saving ? t.saving : t.saveChanges}
        </button>
      </form>
    </div>
  )
}
