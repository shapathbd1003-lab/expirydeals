'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { nanoid } from 'nanoid'

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">Expired</span>
  if (days === 0) return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">⚠️ Expires today!</span>
  if (days <= 3) return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">{days} days left</span>
  return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{days} days left</span>
}

export default function ListingDetailPage() {
  const { slug } = useParams() as { slug: string }
  const { user, token } = useAuth()
  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [contact, setContact] = useState<any>(null)
  const [contactLoading, setContactLoading] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportNote, setReportNote] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const viewTracked = useRef(false)

  useEffect(() => {
    fetch(`/api/listings/${slug}`)
      .then(r => r.json())
      .then(d => { setListing(d.data); setLoading(false) })
  }, [slug])

  // Track view
  useEffect(() => {
    if (!listing || viewTracked.current) return
    viewTracked.current = true
    let sid = sessionStorage.getItem('ed_sid')
    if (!sid) { sid = nanoid(16); sessionStorage.setItem('ed_sid', sid) }
    fetch(`/api/listings/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sid }),
      credentials: 'include',
    })
  }, [listing, slug])

  const handleContact = async () => {
    if (!user) { window.location.href = '/login'; return }
    setContactLoading(true)
    const res = await fetch(`/api/listings/${slug}/contact`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()
    setContactLoading(false)
    if (res.ok) setContact(data.data)
  }

  const toggleFav = async () => {
    if (!user) { window.location.href = '/login'; return }
    const method = isFav ? 'DELETE' : 'POST'
    await fetch(`/api/buyer/favorites/${listing.id}`, {
      method, credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    setIsFav(!isFav)
  }

  const submitReport = async () => {
    await fetch(`/api/listings/${slug}/report`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ reason: reportReason, note: reportNote }),
    })
    setReportSent(true)
    setTimeout(() => setReportOpen(false), 1500)
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>
  if (!listing) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Listing not found.</div>
  if (listing.status === 'expired') return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">⏰</p>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p className="text-gray-600 mb-6">This listing has expired.</p>
      <Link href="/listings" className="btn-primary">Browse Active Listings</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Photos */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {listing.photos?.length > 0 ? (
              <Image
                src={listing.photos[activePhoto]?.urlMedium}
                alt={listing.title}
                fill className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📦</div>
            )}
          </div>
          {listing.photos?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {listing.photos.map((p: any, i: number) => (
                <button
                  key={p.id}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    i === activePhoto ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <Image src={p.urlThumb} alt="" width={56} height={56} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-green-600 font-medium">{listing.category?.name}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{listing.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ৳ {parseFloat(listing.discountedPrice).toLocaleString('en-BD')}
            </span>
            <span className="text-lg text-gray-400 line-through">
              ৳ {parseFloat(listing.originalPrice).toLocaleString('en-BD')}
            </span>
            <span className="bg-red-100 text-red-700 font-bold text-sm px-2 py-0.5 rounded">
              -{Math.round(parseFloat(listing.discountPct))}% OFF
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <ExpiryBadge days={listing.days_remaining} />
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
              📦 {listing.quantity} available
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
              📍 {listing.city}{listing.region ? `, ${listing.region}` : ''}
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>

          <div className="text-xs text-gray-500">
            Expires: <strong>{new Date(listing.expiryDate).toLocaleDateString()}</strong>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            {!contact ? (
              <button onClick={handleContact} disabled={contactLoading} className="btn-primary w-full py-3 text-base">
                {contactLoading ? 'Loading...' : '📞 Contact Seller'}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-gray-900">📞 {contact.phone || 'No phone number'}</p>
                {contact.whatsapp_link && (
                  <a href={contact.whatsapp_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">
                    💬 Message on WhatsApp
                  </a>
                )}
                <p className="text-xs text-gray-500">Contact the seller directly. ExpiryDeals doesn&apos;t handle payments.</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={toggleFav}
                className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${isFav ? 'text-red-500 border-red-200' : ''}`}>
                {isFav ? '❤️ Saved' : '🤍 Save'}
              </button>
              <button onClick={() => setReportOpen(true)} className="flex-1 btn-secondary text-gray-400">
                🚩 Report
              </button>
            </div>
          </div>

          {/* Seller info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Seller</p>
            <p className="font-semibold text-gray-900">{listing.seller?.business_name || 'Unknown Seller'}</p>
            <p className="text-sm text-gray-500">📍 {listing.seller?.business_city}</p>
            <p className="text-xs text-gray-400">Member since {new Date(listing.seller?.member_since).getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-lg">Report Listing</h3>
            {reportSent ? (
              <p className="text-green-600">✅ Report submitted. Thank you.</p>
            ) : (
              <>
                <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value="spam">Spam</option>
                  <option value="wrong_info">Wrong information</option>
                  <option value="illegal_item">Illegal item</option>
                  <option value="other">Other</option>
                </select>
                <textarea className="input resize-none" rows={3} placeholder="Optional note..."
                  value={reportNote} onChange={(e) => setReportNote(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={submitReport} className="btn-danger flex-1">Submit Report</button>
                  <button onClick={() => setReportOpen(false)} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
