'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const STATUS_TABS = ['active', 'pending', 'draft', 'paused', 'expired', 'deleted'] as const

const T = {
  en: {
    submittedTitle: '✅ Listing submitted for review!',
    submittedBody: 'Your listing is pending admin approval. It will go live once approved — usually within 24 hours.',
    myAds: 'My Ads', postNewItem: '+ Post New Item',
    tabs: { active: 'Active', pending: 'Pending Approval', draft: 'Drafts', paused: 'Paused', expired: 'Expired', deleted: 'Deleted' },
    noneOf: { active: 'No active ads.', pending: 'No listings pending approval.', draft: 'No saved drafts.', paused: 'No paused ads.', expired: 'No expired ads.', deleted: 'No deleted ads.' },
    postFirstAd: 'Post your first ad', createListing: 'Create a new listing',
    views: 'views', edit: 'Edit', submitForReview: '📋 Submit for Review',
    awaitingApproval: '⏳ Awaiting admin approval',
    pause: 'Pause', resume: 'Resume', markSold: '✅ Mark Sold',
    delete: 'Delete', removePermanently: 'Remove permanently',
    draftBadge: 'Draft', pendingBadge: 'Pending Approval', newBadge: 'New', usedBadge: 'Used',
    expiredWord: 'Expired', today: 'Today',
    confirmPermanentDelete: 'Permanently remove this listing from the database? This cannot be undone.',
    modal: {
      markSoldTitle: 'Mark as Sold', deleteListingTitle: 'Delete Listing',
      howSold: 'How did you sell it?', howResolved: 'How was this resolved?',
      soldViaED: 'Sold via ExpiryDeals', soldViaEDDesc: 'Buyer found you through this platform',
      soldViaOther: 'Sold via another platform', soldViaOtherDesc: 'Facebook, Bikroy, WhatsApp, etc.',
      otherNotSure: 'Other / Not sure',
      justDelete: 'Just delete — not sold', justDeleteDesc: 'Remove without recording a sale',
      note: 'Note', optional: '(optional)', notePlaceholder: 'e.g. sold to a restaurant, 50 units',
      saving: 'Saving...', deleteBtn: '🗑️ Delete', confirmSold: '✅ Confirm Sold', confirmDelete: '✅ Confirm & Delete',
      cancel: 'Cancel',
    },
  },
  bn: {
    submittedTitle: '✅ বিজ্ঞাপন পর্যালোচনার জন্য জমা হয়েছে!',
    submittedBody: 'আপনার বিজ্ঞাপনটি অ্যাডমিন অনুমোদনের অপেক্ষায় আছে। অনুমোদন হলেই এটি লাইভ হবে — সাধারণত ২৪ ঘণ্টার মধ্যে।',
    myAds: 'আমার বিজ্ঞাপন', postNewItem: '+ নতুন পণ্য যোগ করুন',
    tabs: { active: 'সক্রিয়', pending: 'অনুমোদনের অপেক্ষায়', draft: 'খসড়া', paused: 'বিরতি দেওয়া', expired: 'মেয়াদোত্তীর্ণ', deleted: 'মুছে ফেলা হয়েছে' },
    noneOf: { active: 'কোনো সক্রিয় বিজ্ঞাপন নেই।', pending: 'অনুমোদনের অপেক্ষায় কোনো বিজ্ঞাপন নেই।', draft: 'কোনো সংরক্ষিত খসড়া নেই।', paused: 'বিরতি দেওয়া কোনো বিজ্ঞাপন নেই।', expired: 'মেয়াদোত্তীর্ণ কোনো বিজ্ঞাপন নেই।', deleted: 'মুছে ফেলা কোনো বিজ্ঞাপন নেই।' },
    postFirstAd: 'আপনার প্রথম বিজ্ঞাপন দিন', createListing: 'নতুন বিজ্ঞাপন তৈরি করুন',
    views: 'ভিউ', edit: 'সম্পাদনা', submitForReview: '📋 পর্যালোচনার জন্য জমা দিন',
    awaitingApproval: '⏳ অ্যাডমিন অনুমোদনের অপেক্ষায়',
    pause: 'বিরতি দিন', resume: 'পুনরায় চালু করুন', markSold: '✅ বিক্রি হয়েছে চিহ্নিত করুন',
    delete: 'মুছুন', removePermanently: 'স্থায়ীভাবে মুছে ফেলুন',
    draftBadge: 'খসড়া', pendingBadge: 'অনুমোদনের অপেক্ষায়', newBadge: 'নতুন', usedBadge: 'ব্যবহৃত',
    expiredWord: 'মেয়াদোত্তীর্ণ', today: 'আজ',
    confirmPermanentDelete: 'এই বিজ্ঞাপনটি ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলবেন? এটি আর ফিরিয়ে আনা যাবে না।',
    modal: {
      markSoldTitle: 'বিক্রি হয়েছে চিহ্নিত করুন', deleteListingTitle: 'বিজ্ঞাপন মুছুন',
      howSold: 'আপনি কীভাবে এটি বিক্রি করেছেন?', howResolved: 'এটি কীভাবে সমাধান হয়েছে?',
      soldViaED: 'ExpiryDealsBD এর মাধ্যমে বিক্রি হয়েছে', soldViaEDDesc: 'ক্রেতা এই প্ল্যাটফর্মের মাধ্যমে আপনাকে পেয়েছেন',
      soldViaOther: 'অন্য প্ল্যাটফর্মের মাধ্যমে বিক্রি হয়েছে', soldViaOtherDesc: 'ফেসবুক, বিক্রয়, হোয়াটসঅ্যাপ ইত্যাদি',
      otherNotSure: 'অন্যান্য / নিশ্চিত নই',
      justDelete: 'শুধু মুছে ফেলুন — বিক্রি হয়নি', justDeleteDesc: 'বিক্রয়ের তথ্য ছাড়াই মুছে ফেলুন',
      note: 'নোট', optional: '(ঐচ্ছিক)', notePlaceholder: 'যেমন: একটি রেস্তোরাঁর কাছে ৫০ ইউনিট বিক্রি হয়েছে',
      saving: 'সংরক্ষণ হচ্ছে...', deleteBtn: '🗑️ মুছুন', confirmSold: '✅ বিক্রি নিশ্চিত করুন', confirmDelete: '✅ নিশ্চিত করুন ও মুছুন',
      cancel: 'বাতিল',
    },
  },
}

function daysLeft(expiryDate: string, t: typeof T['en']) {
  const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  if (diff < 0) return t.expiredWord
  if (diff === 0) return t.today
  return `${diff}d`
}

function ActionModal({ listing, token, mode, lang, onClose, onDone }: {
  listing: any, token: string | null, mode: 'sold' | 'delete', lang: 'en' | 'bn', onClose: () => void, onDone: () => void
}) {
  const t = T[lang].modal
  const [soldVia, setSoldVia] = useState<'expirydeals' | 'other_platform' | 'other' | 'no_sale'>('expirydeals')
  const [soldNote, setSoldNote] = useState('')
  const [saving, setSaving] = useState(false)

  const isSold = mode === 'sold'

  const confirm = async () => {
    setSaving(true)
    if (soldVia === 'no_sale') {
      // Delete without sold info
      await fetch(`/api/seller/listings/${listing.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      })
    } else {
      await fetch(`/api/seller/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ status: 'deleted', sold_via: soldVia, sold_note: soldNote }),
      })
    }
    setSaving(false)
    onDone()
  }

  const options = [
    { value: 'expirydeals', icon: '🟠', label: t.soldViaED, desc: t.soldViaEDDesc },
    { value: 'other_platform', icon: '🔵', label: t.soldViaOther, desc: t.soldViaOtherDesc },
    { value: 'other', icon: '⚪', label: t.otherNotSure, desc: '' },
    ...(!isSold ? [{ value: 'no_sale', icon: '🗑️', label: t.justDelete, desc: t.justDeleteDesc }] : []),
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div>
          <h3 id="action-modal-title" className="font-bold text-lg text-gray-900">
            {isSold ? t.markSoldTitle : t.deleteListingTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{listing.title}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {isSold ? t.howSold : t.howResolved}
          </p>
          {options.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setSoldVia(opt.value as typeof soldVia)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border-2 transition ${
                soldVia === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <span className="text-xl mt-0.5">{opt.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                {opt.desc && <p className="text-xs text-gray-500">{opt.desc}</p>}
              </div>
              {soldVia === opt.value && <span className="ml-auto text-orange-500 text-lg">✓</span>}
            </button>
          ))}
        </div>

        {soldVia !== 'no_sale' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{t.note} <span className="text-gray-400 font-normal">{t.optional}</span></label>
            <input
              className="input text-sm"
              placeholder={t.notePlaceholder}
              value={soldNote}
              onChange={e => setSoldNote(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={confirm} disabled={saving}
            className={`flex-1 disabled:opacity-50 ${soldVia === 'no_sale' ? 'btn-danger' : 'btn-primary'}`}>
            {saving ? t.saving : soldVia === 'no_sale' ? t.deleteBtn : isSold ? t.confirmSold : t.confirmDelete}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">{t.cancel}</button>
        </div>
      </div>
    </div>
  )
}

function MyListingsContent() {
  const { user, token, loading: authLoading } = useAuth()
  const { lang } = useLang()
  const t = T[lang]
  const router = useRouter()
  const searchParams = useSearchParams()
  const submittedFromUrl = searchParams.get('submitted') === '1'
  const photoWarningFromUrl = searchParams.get('photo_warning') || ''
  const searchParamTab = searchParams.get('tab') as typeof STATUS_TABS[number] | null
  const [tab, setTab] = useState<typeof STATUS_TABS[number]>(submittedFromUrl ? 'pending' : (searchParamTab && STATUS_TABS.includes(searchParamTab as any) ? searchParamTab : 'active'))
  // Captured once at mount so later actions on this page (e.g. deleting the
  // just-submitted listing) don't leave a stale banner tied to the URL forever
  const [showSubmitted, setShowSubmitted] = useState(submittedFromUrl)
  const [photoWarning, setPhotoWarning] = useState(photoWarningFromUrl)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionModal, setActionModal] = useState<{ listing: any; mode: 'sold' | 'delete' } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Clean the ?submitted=1 / ?photo_warning=... params off the URL once shown,
  // so refreshing or navigating back doesn't re-trigger them
  useEffect(() => {
    if (submittedFromUrl) router.replace('/my/listings?tab=pending', { scroll: false })
    else if (photoWarningFromUrl) router.replace(`/my/listings?tab=${tab}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchListings = () => {
    if (!user) return
    setLoading(true)
    fetch(`/api/seller/listings?status=${tab}&per_page=48`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setListings(d.data || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchListings() }, [tab, user, token])

  const pauseResume = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    await fetch(`/api/seller/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
    setListings(ls => ls.filter(l => l.id !== id))
  }


  const submitForReview = async (id: string) => {
    await fetch(`/api/seller/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
      body: JSON.stringify({ status: 'pending' }),
    })
    setListings(ls => ls.filter(l => l.id !== id))
  }

  const deletePermanent = async (id: string) => {
    if (!confirm(t.confirmPermanentDelete)) return
    await fetch(`/api/seller/listings/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
    setListings(ls => ls.filter(l => l.id !== id))
    setShowSubmitted(false)
  }

  if (authLoading) return <div className="text-center py-20 text-gray-500">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showSubmitted && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6 text-sm text-green-800">
          <p className="font-semibold mb-1">{t.submittedTitle}</p>
          <p>{t.submittedBody}</p>
        </div>
      )}

      {photoWarning && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 text-sm text-yellow-800 flex items-start justify-between gap-3">
          <p>⚠️ {photoWarning}</p>
          <button onClick={() => setPhotoWarning('')} className="text-yellow-600 hover:text-yellow-800 flex-shrink-0">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.myAds}</h1>
          <p className="text-gray-500 text-sm">{user?.full_name}</p>
        </div>
        <Link href="/seller/listings/new" className="btn-primary">{t.postNewItem}</Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.tabs[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p className="mb-4">{t.noneOf[tab]}</p>
          {tab === 'active' && <Link href="/seller/listings/new" className="btn-primary">{t.postFirstAd}</Link>}
          {tab === 'draft' && <Link href="/seller/listings/new" className="btn-primary">{t.createListing}</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {l.photos?.[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={l.photos[0].urlThumb} alt="" className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/listings/${l.slug}`} className="font-medium text-gray-900 hover:text-orange-600 line-clamp-1">{l.title}</Link>
                    <p className="text-sm text-gray-500">৳ {parseFloat(l.discountedPrice).toLocaleString('en-BD')} · {l.category?.name} · {l.city}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                    <span>👁 {l.viewCount} {t.views}</span>
                    {tab !== 'draft' && (!l.listingType || l.listingType === 'near_expiry') && (
                      <span className={l.days_remaining != null && l.days_remaining <= 3 ? 'text-red-500 font-medium' : ''}>{daysLeft(l.expiryDate, t)}</span>
                    )}
                    {tab !== 'draft' && l.listingType && l.listingType !== 'near_expiry' && (
                      <span className={`px-1.5 py-0.5 rounded font-medium ${l.listingType === 'new_item' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {l.listingType === 'new_item' ? t.newBadge : t.usedBadge}
                      </span>
                    )}
                    {tab === 'draft' && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">{t.draftBadge}</span>
                    )}
                    {tab === 'pending' && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{t.pendingBadge}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Link href={`/seller/listings/${l.id}/edit`} className="text-xs btn-secondary py-1 px-2">{t.edit}</Link>
                  {tab === 'draft' && (
                    <button onClick={() => submitForReview(l.id)}
                      className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-lg transition">
                      {t.submitForReview}
                    </button>
                  )}
                  {tab === 'pending' && (
                    <span className="text-xs text-blue-600 font-medium py-1 px-2 bg-blue-50 rounded-lg">{t.awaitingApproval}</span>
                  )}
                  {(tab === 'active' || tab === 'paused') && (
                    <>
                      <button onClick={() => pauseResume(l.id, l.status)} className="text-xs btn-secondary py-1 px-2">
                        {l.status === 'active' ? t.pause : t.resume}
                      </button>
                      <button onClick={() => setActionModal({ listing: l, mode: 'sold' })} className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-lg transition">
                        {t.markSold}
                      </button>
                    </>
                  )}
                  {tab !== 'deleted' && (
                    <button onClick={() => setActionModal({ listing: l, mode: 'delete' })} className="text-xs text-red-500 hover:underline py-1">{t.delete}</button>
                  )}
                  {tab === 'deleted' && (
                    <button onClick={() => deletePermanent(l.id)} className="text-xs text-red-600 font-medium hover:underline py-1">{t.removePermanently}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {actionModal && (
        <ActionModal
          listing={actionModal.listing}
          token={token}
          mode={actionModal.mode}
          lang={lang}
          onClose={() => setActionModal(null)}
          onDone={() => {
            setActionModal(null)
            setListings(ls => ls.filter(l => l.id !== actionModal.listing.id))
            setShowSubmitted(false)
          }}
        />
      )}
    </div>
  )
}

export default function MyListingsPage() {
  return (
    <Suspense>
      <MyListingsContent />
    </Suspense>
  )
}
