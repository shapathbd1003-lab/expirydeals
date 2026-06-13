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
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
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

  const validImageUrls = imageUrls.filter(u => u.trim().startsWith('http'))

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

    const listingId = data.data.id

    // Save PC files as data URLs (no storage service needed)
    if (photos.length > 0) {
      const dataUrls = await Promise.all(photos.map(f => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(f)
      })))
      await fetch(`/api/seller/listings/${listingId}/photo-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ urls: dataUrls }),
      })
    }

    // Save image URLs directly as ListingPhoto records via API
    if (photoTab === 'url' && validImageUrls.length > 0) {
      await fetch(`/api/seller/listings/${listingId}/photo-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ urls: validImageUrls }),
      })
    }

    setLoading(false)
    router.push('/my/listings')
  }

  if (authLoading) return null

  const discount = form.original_price && form.discounted_price
    ? Math.round((1 - parseFloat(form.discounted_price) / parseFloat(form.original_price)) * 100)
    : 0

  const totalImages = photoTab === 'upload' ? photos.length : validImageUrls.length
  const canPublish = !loading && !!form.city

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">← Back</Link>
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
              <textarea className="input resize-none" rows={4} required
                placeholder="Describe the product: brand, quantity, condition, pickup details, phone number etc."
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <p className={`text-xs mt-1 ${form.description.length < 30 ? 'text-orange-500' : 'text-green-600'}`}>
                {form.description.length < 30
                  ? `${form.description.length}/30 — write ${30 - form.description.length} more characters`
                  : `✓ ${form.description.length} characters`}
              </p>
            </div>
            <button onClick={() => {
              if (!form.title || !form.category_id || form.description.length < 30) {
                setError(
                  !form.title ? 'Please enter a product name.' :
                  !form.category_id ? 'Please select a category.' :
                  `Description too short — write ${30 - form.description.length} more characters.`
                )
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
                <select className="input" required value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                  <option value="">Select city...</option>
                  <optgroup label="── Dhaka Division ──"><option>Dhaka</option><option>Gazipur</option><option>Narayanganj</option><option>Manikganj</option><option>Munshiganj</option><option>Narsingdi</option></optgroup>
                  <optgroup label="── Chittagong Division ──"><option>Chittagong</option><option>Cox's Bazar</option><option>Comilla</option><option>Feni</option><option>Noakhali</option></optgroup>
                  <optgroup label="── Sylhet Division ──"><option>Sylhet</option><option>Moulvibazar</option><option>Habiganj</option><option>Sunamganj</option></optgroup>
                  <optgroup label="── Rajshahi Division ──"><option>Rajshahi</option><option>Bogura</option><option>Pabna</option><option>Natore</option></optgroup>
                  <optgroup label="── Khulna Division ──"><option>Khulna</option><option>Jessore</option><option>Satkhira</option></optgroup>
                  <optgroup label="── Mymensingh Division ──"><option>Mymensingh</option><option>Jamalpur</option><option>Netrokona</option></optgroup>
                  <optgroup label="── Rangpur Division ──"><option>Rangpur</option><option>Dinajpur</option><option>Kurigram</option></optgroup>
                  <optgroup label="── Barishal Division ──"><option>Barishal</option><option>Patuakhali</option><option>Bhola</option></optgroup>
                </select>
              </div>
              <div>
                <label className="label">Region / Area</label>
                <input className="input" placeholder="e.g. Mirpur-10" value={form.region} onChange={e => setForm({...form, region: e.target.value})} />
              </div>
              <div>
                <label className="label">Full Address (optional)</label>
                <input className="input" placeholder="e.g. Shop 5, Mirpur Bazar" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="label">Photos <span className="text-gray-400 font-normal">(optional — up to 8)</span></label>

              {/* Tab toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-3">
                <button type="button" onClick={() => setPhotoTab('upload')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  📁 Upload from device
                </button>
                <button type="button" onClick={() => setPhotoTab('url')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  🔗 Paste image URL
                </button>
              </div>

              {photoTab === 'upload' && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                      </div>
                    ))}
                    {photos.length < 8 && (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 gap-1">
                        <span className="text-2xl">+</span>
                        <span className="text-xs">Add photo</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{photos.length}/8 photos · JPG, PNG, WebP · max 10 MB each</p>
                </div>
              )}

              {photoTab === 'url' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Paste links to images already online (e.g. from Google, Facebook, or any website)</p>
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className="input flex-1 text-sm"
                        placeholder={`Image URL ${i + 1} — paste a link starting with https://`}
                        value={url}
                        onChange={e => {
                          const next = [...imageUrls]
                          next[i] = e.target.value
                          setImageUrls(next)
                        }}
                      />
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
                  {imageUrls.length < 8 && (
                    <button type="button" onClick={() => setImageUrls(u => [...u, ''])}
                      className="text-sm text-green-600 hover:underline">+ Add another URL</button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button type="button" onClick={() => handleSubmit(false)} disabled={!canPublish}
                className="btn-secondary flex-1">
                {loading ? '...' : 'Save Draft'}
              </button>
              <button type="button" onClick={() => handleSubmit(true)} disabled={!canPublish}
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
