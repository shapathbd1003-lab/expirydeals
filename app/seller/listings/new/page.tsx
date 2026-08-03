'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import Link from 'next/link'
import { LocationPicker } from '@/components/LocationPicker'

const MIN_DESCRIPTION_LENGTH = 15

const LISTING_TYPES = [
  { value: 'near_expiry', icon: '⏰', en: 'Near Expiry', bn: 'মেয়াদ শেষ হওয়ার কাছাকাছি', descEn: 'Food, medicine & products nearing expiry', descBn: 'খাবার, ওষুধ ও মেয়াদ শেষ হওয়ার কাছাকাছি পণ্য' },
  { value: 'new_item', icon: '✨', en: 'New Product', bn: 'নতুন পণ্য', descEn: 'Brand new, unused item', descBn: 'একদম নতুন, অব্যবহৃত পণ্য' },
  { value: 'used_item', icon: '♻️', en: 'Used Product', bn: 'ব্যবহৃত পণ্য', descEn: 'Pre-owned item in working condition', descBn: 'ব্যবহৃত কিন্তু সচল অবস্থায় থাকা পণ্য' },
] as const

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
    back: '← Back', title: 'Create New Listing',
    steps: ['Details', 'Pricing', 'Location & Photos'],
    productDetails: 'Product Details',
    productName: 'Product Name', category: 'Category', selectCategory: 'Select category...',
    description: 'Description',
    descPlaceholder: 'Describe the product: brand, quantity/condition, your full pickup address (house/road/area/landmark), phone number etc.',
    descCounter: (n: number) => `${n}/${MIN_DESCRIPTION_LENGTH} — write ${MIN_DESCRIPTION_LENGTH - n} more characters`,
    descOk: (n: number) => `✓ ${n} characters`,
    next: 'Next →', back2: '← Back',
    errName: 'Please enter a product name.', errCategory: 'Please select a category.',
    errDesc: (n: number) => `Description too short — write ${n} more characters.`,
    pricingStock: 'Pricing & Stock',
    origPrice: 'Original Price (৳)', origPriceOptional: 'Original / MRP Price (৳)', optional: '(optional)',
    price: 'Price (৳)', discPrice: 'Discounted Price (৳)',
    discountMsg: (n: number) => `🎉 That's a ${n}% discount!`,
    quantity: 'Quantity Available', expiryDate: 'Expiry Date', condition: 'Condition', selectCondition: 'Select condition...',
    errFields: 'Please fill all required fields',
    errPriceExpiry: 'Discounted price must be less than original price',
    errPriceGeneral: 'Price must be less than original/MRP price',
    locationPhotos: 'Location & Photos', photos: 'Photos', photosOptional: '(optional — up to 8)',
    uploadDevice: '📁 Upload from device', pasteUrl: '🔗 Paste image URL', addPhoto: 'Add photo',
    photoCount: (n: number) => `${n}/8 photos · JPG, PNG, WebP · max 10 MB each`,
    urlHint: 'Paste links to images already online (e.g. from Google, Facebook, or any website)',
    urlPlaceholder: (i: number) => `Image URL ${i} — paste a link starting with https://`,
    addAnotherUrl: '+ Add another URL',
    saveDraft: 'Save Draft', submitReview: '📋 Submit for Review', submitting: 'Submitting...',
  },
  bn: {
    back: '← ফিরে যান', title: 'নতুন বিজ্ঞাপন তৈরি করুন',
    steps: ['বিবরণ', 'মূল্য', 'অবস্থান ও ছবি'],
    productDetails: 'পণ্যের বিবরণ',
    productName: 'পণ্যের নাম', category: 'ক্যাটাগরি', selectCategory: 'ক্যাটাগরি নির্বাচন করুন...',
    description: 'বর্ণনা',
    descPlaceholder: 'পণ্যের বর্ণনা দিন: ব্র্যান্ড, পরিমাণ/অবস্থা, আপনার সম্পূর্ণ পিকআপ ঠিকানা (বাড়ি/রোড/এলাকা/ল্যান্ডমার্ক), ফোন নম্বর ইত্যাদি।',
    descCounter: (n: number) => `${n}/${MIN_DESCRIPTION_LENGTH} — আরও ${MIN_DESCRIPTION_LENGTH - n}টি অক্ষর লিখুন`,
    descOk: (n: number) => `✓ ${n} অক্ষর`,
    next: 'পরবর্তী →', back2: '← পেছনে',
    errName: 'পণ্যের নাম লিখুন।', errCategory: 'একটি ক্যাটাগরি নির্বাচন করুন।',
    errDesc: (n: number) => `বর্ণনা খুব ছোট — আরও ${n}টি অক্ষর লিখুন।`,
    pricingStock: 'মূল্য ও স্টক',
    origPrice: 'আসল মূল্য (৳)', origPriceOptional: 'আসল / এমআরপি মূল্য (৳)', optional: '(ঐচ্ছিক)',
    price: 'মূল্য (৳)', discPrice: 'ছাড়ের মূল্য (৳)',
    discountMsg: (n: number) => `🎉 এটি ${n}% ছাড়!`,
    quantity: 'উপলব্ধ পরিমাণ', expiryDate: 'মেয়াদ শেষের তারিখ', condition: 'অবস্থা', selectCondition: 'অবস্থা নির্বাচন করুন...',
    errFields: 'সব প্রয়োজনীয় ঘর পূরণ করুন',
    errPriceExpiry: 'ছাড়ের মূল্য আসল মূল্যের চেয়ে কম হতে হবে',
    errPriceGeneral: 'মূল্য আসল/এমআরপি মূল্যের চেয়ে কম হতে হবে',
    locationPhotos: 'অবস্থান ও ছবি', photos: 'ছবি', photosOptional: '(ঐচ্ছিক — সর্বোচ্চ ৮টি)',
    uploadDevice: '📁 ডিভাইস থেকে আপলোড', pasteUrl: '🔗 ছবির লিংক পেস্ট করুন', addPhoto: 'ছবি যোগ করুন',
    photoCount: (n: number) => `${n}/৮ ছবি · JPG, PNG, WebP · সর্বোচ্চ ১০ MB প্রতিটি`,
    urlHint: 'ইতিমধ্যে অনলাইনে থাকা ছবির লিংক পেস্ট করুন (যেমন Google, Facebook, বা যেকোনো ওয়েবসাইট থেকে)',
    urlPlaceholder: (i: number) => `ছবির লিংক ${i} — https:// দিয়ে শুরু হওয়া একটি লিংক পেস্ট করুন`,
    addAnotherUrl: '+ আরেকটি লিংক যোগ করুন',
    saveDraft: 'খসড়া সংরক্ষণ করুন', submitReview: '📋 পর্যালোচনার জন্য জমা দিন', submitting: 'জমা হচ্ছে...',
  },
}

export default function NewListingPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [listingType, setListingType] = useState<'near_expiry' | 'new_item' | 'used_item'>('near_expiry')
  const [form, setForm] = useState({
    title: '', category_id: '', description: '',
    original_price: '', discounted_price: '', condition: '',
    quantity: '', expiry_date: '', city: '', region: '', address: '',
  })
  const [location, setLocation] = useState({ division: '', district: '', address: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [photoTab, setPhotoTab] = useState<'upload' | 'url'>('upload')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const isNearExpiry = listingType === 'near_expiry'
  const categoriesForType = categories.filter(c => c.group === (isNearExpiry ? 'near_expiry' : 'general'))
  const conditionOptions = listingType === 'new_item' ? NEW_CONDITIONS : USED_CONDITIONS

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.data || []))
  }, [])

  // Reset category and type-specific fields when switching listing type
  const changeType = (ty: typeof listingType) => {
    setListingType(ty)
    setForm(f => ({ ...f, category_id: '', condition: '', expiry_date: '', original_price: '' }))
  }

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
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/seller/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          listing_type: listingType,
          city: location.district,
          region: location.division,
          address: location.address,
          status: publish ? 'pending' : 'draft',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message || 'Failed to create listing'); return }

      const listingId = data.data.id
      const authHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

      if (photos.length > 0) {
        const dataUrls = await Promise.all(photos.map(f => new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(f)
        })))
        await fetch(`/api/seller/listings/${listingId}/photo-urls`, {
          method: 'POST', headers: authHeaders, credentials: 'include',
          body: JSON.stringify({ urls: dataUrls }),
        })
      }

      if (photoTab === 'url' && validImageUrls.length > 0) {
        await fetch(`/api/seller/listings/${listingId}/photo-urls`, {
          method: 'POST', headers: authHeaders, credentials: 'include',
          body: JSON.stringify({ urls: validImageUrls }),
        })
      }

      router.push(publish ? '/my/listings?submitted=1' : '/my/listings?tab=draft')
    } catch {
      setError('Network error — please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null

  const discount = form.original_price && form.discounted_price
    ? Math.round((1 - parseFloat(form.discounted_price) / parseFloat(form.original_price)) * 100)
    : 0

  const canPublish = !loading && !!location.district

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/my/listings" className="text-gray-400 hover:text-gray-600">{t.back}</Link>
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Listing type selector — always visible, switching resets type-specific fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {LISTING_TYPES.map(lt => (
          <button key={lt.value} type="button" onClick={() => changeType(lt.value)}
            className={`text-left p-3 rounded-xl border-2 transition ${
              listingType === lt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <p className="font-semibold text-sm text-gray-900">{lt.icon} {lang === 'bn' ? lt.bn : lt.en}</p>
            <p className="text-xs text-gray-500 mt-0.5">{lang === 'bn' ? lt.descBn : lt.descEn}</p>
          </button>
        ))}
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {t.steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step > i + 1 ? 'bg-orange-500 text-white' : step === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
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
            <h2 className="font-semibold text-gray-900">{t.productDetails}</h2>
            <div>
              <label htmlFor="new-title" className="label">{t.productName} <span className="text-red-500">*</span></label>
              <input id="new-title" className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label htmlFor="new-category" className="label">{t.category} <span className="text-red-500">*</span></label>
              <select id="new-category" className="input" required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">{t.selectCategory}</option>
                {categoriesForType.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="new-desc" className="label">{t.description} <span className="text-red-500">*</span></label>
              <textarea id="new-desc" className="input resize-none" rows={4} required
                placeholder={t.descPlaceholder}
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <p className={`text-xs mt-1 ${form.description.length < MIN_DESCRIPTION_LENGTH ? 'text-orange-500' : 'text-orange-600'}`}>
                {form.description.length < MIN_DESCRIPTION_LENGTH
                  ? t.descCounter(form.description.length)
                  : t.descOk(form.description.length)}
              </p>
            </div>
            <button onClick={() => {
              if (!form.title || !form.category_id || form.description.length < MIN_DESCRIPTION_LENGTH) {
                setError(
                  !form.title ? t.errName :
                  !form.category_id ? t.errCategory :
                  t.errDesc(MIN_DESCRIPTION_LENGTH - form.description.length)
                )
                return
              }
              setError(''); setStep(2)
            }} className="btn-primary w-full">{t.next}</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">{t.pricingStock}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-orig-price" className="label">
                  {isNearExpiry ? <>{t.origPrice} <span className="text-red-500">*</span></> : <>{t.origPriceOptional} <span className="text-gray-400 font-normal">{t.optional}</span></>}
                </label>
                <input id="new-orig-price" type="number" min="0.01" step="0.01" className="input" required={isNearExpiry}
                  value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})} />
              </div>
              <div>
                <label htmlFor="new-disc-price" className="label">{isNearExpiry ? t.discPrice : t.price} <span className="text-red-500">*</span></label>
                <input id="new-disc-price" type="number" min="0.01" step="0.01" className="input" required
                  value={form.discounted_price} onChange={e => setForm({...form, discounted_price: e.target.value})} />
              </div>
            </div>
            {discount > 0 && (
              <div className="bg-orange-50 text-orange-700 text-sm px-4 py-2 rounded-lg">
                {t.discountMsg(discount)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="new-qty" className="label">{t.quantity} <span className="text-red-500">*</span></label>
                <input id="new-qty" type="number" min="1" className="input" required
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              {isNearExpiry ? (
                <div>
                  <label htmlFor="new-expiry" className="label">{t.expiryDate} <span className="text-red-500">*</span></label>
                  <input id="new-expiry" type="date" className="input" required min={new Date().toISOString().split('T')[0]}
                    value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                </div>
              ) : (
                <div>
                  <label htmlFor="new-condition" className="label">{t.condition} <span className="text-red-500">*</span></label>
                  <select id="new-condition" className="input" required
                    value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                    <option value="">{t.selectCondition}</option>
                    {conditionOptions.map(c => <option key={c.en} value={c.en}>{lang === 'bn' ? c.bn : c.en}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">{t.back2}</button>
              <button onClick={() => {
                if (!form.discounted_price || !form.quantity || (isNearExpiry && (!form.original_price || !form.expiry_date)) || (!isNearExpiry && !form.condition)) {
                  setError(t.errFields); return
                }
                if (form.original_price && parseFloat(form.discounted_price) >= parseFloat(form.original_price)) {
                  setError(isNearExpiry ? t.errPriceExpiry : t.errPriceGeneral); return
                }
                setError(''); setStep(3)
              }} className="btn-primary flex-1">{t.next}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">{t.locationPhotos}</h2>
            <LocationPicker value={location} onChange={setLocation} />

            {/* Photos */}
            <div>
              <label className="label">{t.photos} <span className="text-gray-400 font-normal">{t.photosOptional}</span></label>

              {/* Tab toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-3">
                <button type="button" onClick={() => setPhotoTab('upload')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  {t.uploadDevice}
                </button>
                <button type="button" onClick={() => setPhotoTab('url')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${photoTab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                  {t.pasteUrl}
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
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 text-gray-400 gap-1">
                        <span className="text-2xl">+</span>
                        <span className="text-xs">{t.addPhoto}</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{t.photoCount(photos.length)}</p>
                </div>
              )}

              {photoTab === 'url' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">{t.urlHint}</p>
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className="input flex-1 text-sm"
                        placeholder={t.urlPlaceholder(i + 1)}
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
                      className="text-sm text-orange-600 hover:underline">{t.addAnotherUrl}</button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">{t.back2}</button>
              <button type="button" onClick={() => handleSubmit(false)} disabled={!canPublish}
                className="btn-secondary flex-1">
                {loading ? '...' : t.saveDraft}
              </button>
              <button type="button" onClick={() => handleSubmit(true)} disabled={!canPublish}
                className="btn-primary flex-1">
                {loading ? t.submitting : t.submitReview}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
