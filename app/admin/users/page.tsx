'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminUsersPage() {
  const { user, token, loading: authLoading } = useAuth()
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

  if (authLoading) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
        <h1 className="text-xl font-bold text-gray-900">Users ({total})</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search name or email..."
          value={q} onChange={e => setQ(e.target.value)} />
        <select className="input w-auto" value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Listings</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' :
                    u.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u._count?.listings || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {u.status === 'active' && u.role !== 'admin' && (
                      <button onClick={() => updateStatus(u.id, 'suspended')} className="text-xs text-orange-600 hover:underline">Suspend</button>
                    )}
                    {u.status === 'suspended' && (
                      <button onClick={() => updateStatus(u.id, 'active')} className="text-xs text-green-600 hover:underline">Reactivate</button>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => { if(confirm('Delete user?')) updateStatus(u.id, 'deleted') }}
                        className="text-xs text-red-500 hover:underline">Delete</button>
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
