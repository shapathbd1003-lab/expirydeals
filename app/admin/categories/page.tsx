'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminCategoriesPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) router.push('/login')
  }, [user, authLoading, router])

  const fetchCats = () => {
    if (!user) return
    fetch('/api/admin/categories', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => { setCategories(d.data || []); setLoading(false) })
  }

  useEffect(() => { fetchCats() }, [user])

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ name: newName }),
    })
    setNewName('')
    fetchCats()
  }

  const toggleActive = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ is_active: !isActive }),
    })
    fetchCats()
  }

  if (authLoading) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
      </div>

      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input className="input" placeholder="New category name..." value={newName} onChange={e => setNewName(e.target.value)} required />
        <button type="submit" className="btn-primary">Add</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <p className="text-center py-8 text-gray-400">Loading...</p> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Listings</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c._count?.listings || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(c.id, c.isActive)}
                      className="text-xs text-blue-600 hover:underline">
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
