'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditListingPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user || !id) return
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    Promise.all([
      fetch(`/api/seller/listings/${id}`, { headers, credentials: 'include' }).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([listing, cats]) => {
      if (listing.error) { router.push('/my/listings'); return }
      const d = listing.data
      setExistingPhotos(d.photos || [])
      setForm({
        title: d.title,
        description: d.description || '',
        categoryId: d.categoryId,
        originalPrice: d.originalPrice,
        discountedPrice: d.discountedPrice,
        quantity: d.quantity,
        expiryDate: d.expiryDate ? d.expiryDate.split('T')[0] : '',
        city: d.city || '',
        region: d.region || '',
        address: d.address || '',
        status: d.status,
      })
      setCategories(cats.data || [])
    })
  }, [user, id])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    try {
      const res = await fetch(`/api/seller/listings/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category_id: form.categoryId,
          original_price: parseFloat(form.originalPrice),
          discounted_price: parseFloat(form.discountedPrice),
          quantity: parseInt(form.quantity),
          expiry_date: form.expiryDate,
          city: form.city,
          region: form.region,
          address: form.address,
          status: form.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to save'); return }

      // Upload files from PC
      if (newFiles.length > 0) {
        const fd = new FormData()
        newFiles.forEach(f => fd.append('photos', f))
        const fHeaders: any = {}
        if (token) fHeaders.Authorization = `Bearer ${token}`
        await fetch(`/api/seller/listings/${id}/photos`, {
          method: 'POST', headers: fHeaders, credentials: 'include', body: fd,
        })
      }

      // Save new image URLs if any
      const validUrls = imageUrls.filter(u => u.trim().startsWith('http'))
      if (validUrls.length > 0) {
        await fetch(`/api/seller/listings/${id}/photo-urls`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ urls: validUrls }),
        })
      }

      router.push('/my/listings')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !form) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">← My Ads</Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>

        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.categoryId} onChange={e => set('categoryId', parseInt(e.target.value))} required>
            <option value="">Select category</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Original Price (৳) *</label>
            <input className="input" type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} required />
          </div>
          <div>
            <label className="label">Discounted Price (৳) *</label>
            <input className="input" type="number" min="0" step="0.01" value={form.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Quantity *</label>
          <input className="input" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
        </div>

        <div>
          <label className="label">Expiry Date *</label>
          <input className="input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Region</label>
            <input className="input" value={form.region} onChange={e => set('region', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Full Address</label>
          <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Photos */}
        <div>
          <label className="label">Photos</label>

          {/* Existing photos */}
          {existingPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingPhotos.map((p: any) => (
                <div key={p.id} className="relative w-16 h-16">
                  <img src={p.urlThumb} alt="" className="w-16 h-16 rounded object-cover border border-gray-200" />
                  <button type="button"
                    onClick={async () => {
                      if (!confirm('Delete this photo?')) return
                      const h: any = {}
                      if (token) h.Authorization = `Bearer ${token}`
                      await fetch(`/api/seller/listings/${id}/photos/${p.id}`, {
                        method: 'DELETE', headers: h, credentials: 'include',
                      })
                      setExistingPhotos(prev => prev.filter(x => x.id !== p.id))
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow">
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400 w-full">{existingPhotos.length} photo(s) — click ✕ to delete</p>
            </div>
          )}

          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-3">
            <button type="button" onClick={() => setPhotoTab('upload')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              📁 Upload from PC
            </button>
            <button type="button" onClick={() => setPhotoTab('url')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              🔗 Paste URL
            </button>
          </div>

          {photoTab === 'upload' && (
            <div>
              <div className="flex flex-wrap gap-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      setNewFiles(f => f.filter((_, j) => j !== i))
                      setNewPreviews(p => p.filter((_, j) => j !== i))
                    }} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
                {newFiles.length < 8 - existingPhotos.length && (
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 gap-0.5">
                    <span className="text-xl">+</span>
                    <span className="text-xs">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                      const files = Array.from(e.target.files || []).slice(0, 8 - existingPhotos.length - newFiles.length)
                      setNewFiles(f => [...f, ...files])
                      files.forEach(f => {
                        const reader = new FileReader()
                        reader.onload = ev => setNewPreviews(p => [...p, ev.target?.result as string])
                        reader.readAsDataURL(f)
                      })
                    }} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{newFiles.length} new file(s) selected</p>
            </div>
          )}

          {photoTab === 'url' && (
            <div className="space-y-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="input flex-1 text-sm"
                    placeholder="Paste image URL starting with https://"
                    value={url}
                    onChange={e => {
                      const next = [...imageUrls]
                      next[i] = e.target.value
                      setImageUrls(next)
                    }} />
                  {url.trim().startsWith('http') && (
                    <img src={url} alt="" className="w-10 h-10 rounded object-cover border border-gray-200 flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  )}
                  {imageUrls.length > 1 && (
                    <button type="button" onClick={() => setImageUrls(u => u.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                  )}
                </div>
              ))}
              {imageUrls.length < 8 - existingPhotos.length && (
                <button type="button" onClick={() => setImageUrls(u => [...u, ''])}
                  className="text-sm text-green-600 hover:underline">+ Add another URL</button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/my/listings" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
