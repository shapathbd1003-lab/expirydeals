'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function NewListingPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '', category_id: '', description: '',
    original_price: '', discounted_price: '',
    quantity: '', expiry_date: '', city: '', region: '', address: '',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'seller')) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [])

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 8 - photos.length)
    setPhotos(p => [...p, ...newFiles])
    newFiles.forEach(f => {
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreviews(p => [...p, e.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const removePhoto = (i: number) => {
    setPhotos(p => p.filter((_, j) => j !== i))
    setPhotoPreviews(p => p.filter((_, j) => j !== i))
  }

  const handleSubmit = async (publish: boolean) => {
    setError(''); setLoading(true)
    const res = await fetch('/api/seller/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ ...form, status: publish ? 'active' : 'draft' }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error?.message || 'Failed'); setLoading(false); return }

    // Upload photos
    if (photos.length > 0) {
      const fd = new FormData()
      photos.forEach(p => fd.append('photos', p))
      await fetch(`/api/seller/listings/${data.data.id}/photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: fd,
      })
    }

    setLoading(false)
    router.push('/seller/dashboard')
  }

  if (authLoading) return null

  const discount = form.original_price && form.discounted_price
    ? Math.round((1 - parseFloat(form.discounted_price) / parseFloat(form.original_price)) * 100)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/dashboard" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-xl font-bold text-gray-900">Create New Listing</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {['Details', 'Pricing', 'Location & Photos'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{step > i + 1 ? '✓' : i + 1}</div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Product Details</h2>
            <div>
              <label className="label">Product Name <span className="text-red-500">*</span></label>
              <input className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select className="input" required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">Select category...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description <span className="text-red-500">*</span></label>
              <textarea className="input resize-none" rows={4} required minLength={30}
                placeholder="Describe the product, quantity per pack, condition, etc. (min 30 chars)"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/30 minimum</p>
            </div>
            <button onClick={() => {
              if (!form.title || !form.category_id || form.description.length < 30) {
                setError('Please fill all required fields (description min 30 chars)')
                return
              }
              setError(''); setStep(2)
            }} className="btn-primary w-full">Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing & Stock</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Original Price (৳) <span className="text-red-500">*</span></label>
                <input type="number" min="0.01" step="0.01" className="input" required
                  value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} />
              </div>
              <div>
                <label className="label">Discounted Price (৳) <span className="text-red-500">*</span></label>
                <input type="number" min="0.01" step="0.01" className="input" required
                  value={form.discounted_price} onChange={e => setForm({...form, discounted_price: e.target.value})} />
              </div>
            </div>
            {discount > 0 && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">
                🎉 That&apos;s a <strong>{discount}% discount</strong>!
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Quantity Available <span className="text-red-500">*</span></label>
                <input type="number" min="1" className="input" required
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <label className="label">Expiry Date <span className="text-red-500">*</span></label>
                <input type="date" className="input" required min={new Date().toISOString().split('T')[0]}
                  value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => {
                if (!form.original_price || !form.discounted_price || !form.quantity || !form.expiry_date) {
                  setError('Please fill all required fields'); return
                }
                if (parseFloat(form.discounted_price) >= parseFloat(form.original_price)) {
                  setError('Discounted price must be less than original price'); return
                }
                setError(''); setStep(3)
              }} className="btn-primary flex-1">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Location & Photos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">City <span className="text-red-500">*</span></label>
                <input className="input" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
              <div>
                <label className="label">Region</label>
                <input className="input" value={form.region} onChange={e => setForm({...form, region: e.target.value})} />
              </div>
              <div>
                <label className="label">Address (optional)</label>
                <input className="input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="label">Photos (1–8) <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                ))}
                {photos.length < 8 && (
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 text-2xl">
                    +
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{photos.length}/8 photos added</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => handleSubmit(false)} disabled={loading || !form.city}
                className="btn-secondary flex-1">
                {loading ? '...' : 'Save Draft'}
              </button>
              <button onClick={() => handleSubmit(true)} disabled={loading || !form.city || photos.length === 0}
                className="btn-primary flex-1">
                {loading ? 'Publishing...' : '🚀 Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
