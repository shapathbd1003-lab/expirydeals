'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { LocationPicker } from '@/components/LocationPicker'

const MIN_DESCRIPTION_LENGTH = 15

const NEW_CONDITIONS = [
  { en: 'Brand New (Sealed)', bn: 'একদম নতুন (সিলড)' },
  { en: 'Brand New (Box Opened)', bn: 'একদম নতুন (বক্স খোলা)' },
  { en: 'Refurbished', bn: 'রিফার্বিশড' },
]
const USED_CONDITIONS = [
  { en: 'Like New', bn: 'নতুনের মতো' },
  { en: 'Good', bn: 'ভালো' },
  { en: 'Fair', bn: 'মোটামুটি' },
  { en: 'For Parts', bn: 'পার্টসের জন্য' },
]

const T = {
  en: {
    myAds: '← My Ads', title: 'Edit Listing',
    titleLabel: 'Title', category: 'Category', selectCategory: 'Select category',
    description: 'Description',
    origPrice: 'Original Price (৳)', origPriceOptional: 'Original / MRP Price (৳)', optional: '(optional)',
    price: 'Price (৳)', discPrice: 'Discounted Price (৳)',
    quantity: 'Quantity', expiryDate: 'Expiry Date', condition: 'Condition', selectCondition: 'Select condition...',
    status: 'Status', active: 'Active', paused: 'Paused',
    draftNote: 'Draft — submit it for review from My Ads', pendingNote: 'Pending admin approval',
    photos: 'Photos', deletePhoto: 'Delete this photo?',
    photoCount: (n: number) => `${n} photo(s) — click ✕ to delete`,
    uploadPC: '📁 Upload from PC', pasteUrl: '🔗 Paste URL', add: 'Add',
    newFileCount: (n: number) => `${n} new file(s) selected`,
    urlPlaceholder: 'Paste image URL starting with https://', addAnotherUrl: '+ Add another URL',
    saveChanges: 'Save Changes', saving: 'Saving...', cancel: 'Cancel',
  },
  bn: {
    myAds: '← আমার বিজ্ঞাপন', title: 'বিজ্ঞাপন সম্পাদনা করুন',
    titleLabel: 'শিরোনাম', category: 'ক্যাটাগরি', selectCategory: 'ক্যাটাগরি নির্বাচন করুন',
    description: 'বর্ণনা',
    origPrice: 'আসল মূল্য (৳)', origPriceOptional: 'আসল / এমআরপি মূল্য (৳)', optional: '(ঐচ্ছিক)',
    price: 'মূল্য (৳)', discPrice: 'ছাড়ের মূল্য (৳)',
    quantity: 'পরিমাণ', expiryDate: 'মেয়াদ শেষের তারিখ', condition: 'অবস্থা', selectCondition: 'অবস্থা নির্বাচন করুন...',
    status: 'স্ট্যাটাস', active: 'সক্রিয়', paused: 'বিরতি দেওয়া',
    draftNote: 'খসড়া — আমার বিজ্ঞাপন থেকে পর্যালোচনার জন্য জমা দিন', pendingNote: 'অ্যাডমিন অনুমোদনের অপেক্ষায়',
    photos: 'ছবি', deletePhoto: 'এই ছবিটি মুছে ফেলবেন?',
    photoCount: (n: number) => `${n}টি ছবি — মুছতে ✕ ক্লিক করুন`,
    uploadPC: '📁 পিসি থেকে আপলোড', pasteUrl: '🔗 লিংক পেস্ট করুন', add: 'যোগ করুন',
    newFileCount: (n: number) => `${n}টি নতুন ফাইল নির্বাচিত`,
    urlPlaceholder: 'https:// দিয়ে শুরু হওয়া ছবির লিংক পেস্ট করুন', addAnotherUrl: '+ আরেকটি লিংক যোগ করুন',
    saveChanges: 'পরিবর্তন সংরক্ষণ করুন', saving: 'সংরক্ষণ হচ্ছে...', cancel: 'বাতিল',
  },
}

export default function EditListingPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [existingPhotos, setExistingPhotos] = useState<any[]>([])
  const [location, setLocation] = useState<{ division: string; district: string; address: string } | null>(null)
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
      setLocation({ division: d.region || '', district: d.city || '', address: d.address || '' })

      setForm({
        title: d.title,
        description: d.description || '',
        categoryId: d.categoryId,
        listingType: d.listingType || 'near_expiry',
        condition: d.condition || '',
        originalPrice: d.originalPrice ?? '',
        discountedPrice: d.discountedPrice,
        quantity: d.quantity,
        expiryDate: d.expiryDate ? d.expiryDate.split('T')[0] : '',
        status: d.status,
      })
      setCategories(cats.data || [])
    })
  }, [user, id])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.description.length < MIN_DESCRIPTION_LENGTH) {
      setError(lang === 'bn' ? `বর্ণনা কমপক্ষে ${MIN_DESCRIPTION_LENGTH} অক্ষরের হতে হবে।` : `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`)
      return
    }
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
          original_price: form.originalPrice ? parseFloat(form.originalPrice) : null,
          discounted_price: parseFloat(form.discountedPrice),
          quantity: parseInt(form.quantity),
          ...(form.listingType === 'near_expiry' ? { expiry_date: form.expiryDate } : { condition: form.condition }),
          city: location?.district,
          region: location?.division,
          address: location?.address,
          // Status only changeable for approved listings; drafts/pending keep server status
          ...(['active', 'paused'].includes(form.status) ? { status: form.status } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message || data.message || 'Failed to save'); return }

      // Save PC files as data URLs (no storage service needed)
      if (newFiles.length > 0) {
        const dataUrls = await Promise.all(newFiles.map(f => new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(f)
        })))
        await fetch(`/api/seller/listings/${id}/photo-urls`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ urls: dataUrls }),
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
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">{t.myAds}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">{t.titleLabel} *</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>

        <div>
          <label className="label">{t.category} *</label>
          <select className="input" value={form.categoryId} onChange={e => set('categoryId', parseInt(e.target.value))} required>
            <option value="">{t.selectCategory}</option>
            {categories.filter((c: any) => c.group === (form.listingType === 'near_expiry' ? 'near_expiry' : 'general')).map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">{t.description}</label>
          <textarea className="input min-h-[100px]" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              {form.listingType === 'near_expiry' ? <>{t.origPrice} *</> : <>{t.origPriceOptional} <span className="text-gray-400 font-normal">{t.optional}</span></>}
            </label>
            <input className="input" type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} required={form.listingType === 'near_expiry'} />
          </div>
          <div>
            <label className="label">{form.listingType === 'near_expiry' ? `${t.discPrice} *` : `${t.price} *`}</label>
            <input className="input" type="number" min="0" step="0.01" value={form.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">{t.quantity} *</label>
          <input className="input" type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
        </div>

        {form.listingType === 'near_expiry' ? (
          <div>
            <label className="label">{t.expiryDate} *</label>
            <input className="input" type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required />
          </div>
        ) : (
          <div>
            <label className="label">{t.condition} *</label>
            <select className="input" value={form.condition} onChange={e => set('condition', e.target.value)} required>
              <option value="">{t.selectCondition}</option>
              {(form.listingType === 'new_item' ? NEW_CONDITIONS : USED_CONDITIONS).map(c => <option key={c.en} value={c.en}>{lang === 'bn' ? c.bn : c.en}</option>)}
            </select>
          </div>
        )}

        {location && <LocationPicker value={location} onChange={setLocation} />}

        <div>
          <label className="label">{t.status}</label>
          {['active', 'paused'].includes(form.status) ? (
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">{t.active}</option>
              <option value="paused">{t.paused}</option>
            </select>
          ) : (
            <p className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              ⏳ {form.status === 'draft' ? t.draftNote : t.pendingNote}
            </p>
          )}
        </div>

        {/* Photos */}
        <div>
          <label className="label">{t.photos}</label>

          {/* Existing photos */}
          {existingPhotos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingPhotos.map((p: any) => (
                <div key={p.id} className="relative w-16 h-16">
                  <img src={p.urlThumb} alt="" className="w-16 h-16 rounded object-cover border border-gray-200" />
                  <button type="button"
                    onClick={async () => {
                      if (!confirm(t.deletePhoto)) return
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
              <p className="text-xs text-gray-400 w-full">{t.photoCount(existingPhotos.length)}</p>
            </div>
          )}

          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-3">
            <button type="button" onClick={() => setPhotoTab('upload')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {t.uploadPC}
            </button>
            <button type="button" onClick={() => setPhotoTab('url')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {t.pasteUrl}
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
                    <span className="text-xs">{t.add}</span>
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
              <p className="text-xs text-gray-400 mt-2">{t.newFileCount(newFiles.length)}</p>
            </div>
          )}

          {photoTab === 'url' && (
            <div className="space-y-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className="input flex-1 text-sm"
                    placeholder={t.urlPlaceholder}
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
                  className="text-sm text-green-600 hover:underline">{t.addAnotherUrl}</button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? t.saving : t.saveChanges}
          </button>
          <Link href="/my/listings" className="btn-secondary">{t.cancel}</Link>
        </div>
      </form>
    </div>
  )
}
