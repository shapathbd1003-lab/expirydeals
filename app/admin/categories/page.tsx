'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const T = {
  en: {
    admin: '← Admin', categories: 'Categories',
    newCategoryPlaceholder: 'New category name...',
    nearExpiry: 'Near Expiry', general: 'General (New/Used)', add: 'Add',
    loading: 'Loading...',
    category: 'Category', group: 'Group', listings: 'Listings', status: 'Status',
    active: 'Active', disabled: 'Disabled', disable: 'Disable', enable: 'Enable',
  },
  bn: {
    admin: '← অ্যাডমিন', categories: 'ক্যাটাগরি',
    newCategoryPlaceholder: 'নতুন ক্যাটাগরির নাম...',
    nearExpiry: 'মেয়াদ শেষ হওয়ার কাছাকাছি', general: 'সাধারণ (নতুন/ব্যবহৃত)', add: 'যোগ করুন',
    loading: 'লোড হচ্ছে...',
    category: 'ক্যাটাগরি', group: 'গ্রুপ', listings: 'বিজ্ঞাপন', status: 'স্ট্যাটাস',
    active: 'সক্রিয়', disabled: 'নিষ্ক্রিয়', disable: 'নিষ্ক্রিয় করুন', enable: 'সক্রিয় করুন',
  },
}

export default function AdminCategoriesPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState<'near_expiry' | 'general'>('near_expiry')
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
      body: JSON.stringify({ name: newName, group: newGroup }),
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
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">{t.admin}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.categories}</h1>
      </div>

      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input className="input" placeholder={t.newCategoryPlaceholder} value={newName} onChange={e => setNewName(e.target.value)} required />
        <select className="input w-auto" value={newGroup} onChange={e => setNewGroup(e.target.value as typeof newGroup)}>
          <option value="near_expiry">{t.nearExpiry}</option>
          <option value="general">{t.general}</option>
        </select>
        <button type="submit" className="btn-primary">{t.add}</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? <p className="text-center py-8 text-gray-400">{t.loading}</p> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.category}</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.group}</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.listings}</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">{t.status}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.icon} {c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.group === 'general' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {c.group === 'general' ? t.general : t.nearExpiry}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c._count?.listings || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.isActive ? t.active : t.disabled}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(c.id, c.isActive)}
                      className="text-xs text-blue-600 hover:underline">
                      {c.isActive ? t.disable : t.enable}
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
