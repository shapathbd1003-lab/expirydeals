'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const T = {
  en: {
    admin: '← Admin', users: (n: number) => `Users (${n})`,
    searchPlaceholder: 'Search name or email...',
    allRoles: 'All roles', user: 'User', adminRole: 'Admin',
    name: 'Name', email: 'Email', role: 'Role', status: 'Status',
    emailStatus: 'Email Status', seller: 'Seller', listings: 'Listings', actions: 'Actions',
    loading: 'Loading...',
    verified: '✓ Verified', unverified: '⚠ Unverified',
    verifiedSeller: '✓ Verified Seller', markVerified: 'Mark Verified',
    suspend: 'Suspend', reactivate: 'Reactivate', deleteBtn: 'Delete',
    confirmDelete: 'Delete user?',
  },
  bn: {
    admin: '← অ্যাডমিন', users: (n: number) => `ব্যবহারকারী (${n})`,
    searchPlaceholder: 'নাম বা ইমেইল খুঁজুন...',
    allRoles: 'সব ভূমিকা', user: 'ব্যবহারকারী', adminRole: 'অ্যাডমিন',
    name: 'নাম', email: 'ইমেইল', role: 'ভূমিকা', status: 'স্ট্যাটাস',
    emailStatus: 'ইমেইল স্ট্যাটাস', seller: 'বিক্রেতা', listings: 'বিজ্ঞাপন', actions: 'পদক্ষেপ',
    loading: 'লোড হচ্ছে...',
    verified: '✓ যাচাইকৃত', unverified: '⚠ অযাচাইকৃত',
    verifiedSeller: '✓ যাচাইকৃত বিক্রেতা', markVerified: 'যাচাই করুন',
    suspend: 'স্থগিত করুন', reactivate: 'পুনরায় সক্রিয় করুন', deleteBtn: 'মুছুন',
    confirmDelete: 'ব্যবহারকারী মুছে ফেলবেন?',
  },
}

export default function AdminUsersPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, authLoading, router])

  const fetchUsers = async () => {
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams({ per_page: '50' })
    if (q) params.set('q', q)
    if (role) params.set('role', role)
    const res = await fetch(`/api/admin/users?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    const data = await res.json()
    setUsers(data.data || [])
    setTotal(data.pagination?.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [user, q, role])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    fetchUsers()
  }

  const toggleVerified = async (id: string, currentValue: boolean) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ is_verified_seller: !currentValue }),
    })
    fetchUsers()
  }

  if (authLoading) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">{t.admin}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.users(total)}</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder={t.searchPlaceholder}
          value={q} onChange={e => setQ(e.target.value)} />
        <select className="input w-auto" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">{t.allRoles}</option>
          <option value="user">{t.user}</option>
          <option value="admin">{t.adminRole}</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.name}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.email}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.role}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.status}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.emailStatus}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.seller}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.listings}</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">{t.loading}</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role === 'admin' ? t.adminRole : t.user}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' :
                    u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.status}</span>
                </td>
                <td className="px-4 py-3">
                  {u.emailVerified
                    ? <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{t.verified}</span>
                    : <span className="text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">{t.unverified}</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleVerified(u.id, u.isVerifiedSeller)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition ${u.isVerifiedSeller
                      ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                    }`}>
                    {u.isVerifiedSeller ? t.verifiedSeller : t.markVerified}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500">{u._count?.listings || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {u.status === 'active' && u.role !== 'admin' && (
                      <button onClick={() => updateStatus(u.id, 'suspended')} className="text-xs text-orange-600 hover:underline">{t.suspend}</button>
                    )}
                    {u.status === 'suspended' && (
                      <button onClick={() => updateStatus(u.id, 'active')} className="text-xs text-orange-600 hover:underline">{t.reactivate}</button>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => { if(confirm(t.confirmDelete)) updateStatus(u.id, 'deleted') }}
                        className="text-xs text-red-500 hover:underline">{t.deleteBtn}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
