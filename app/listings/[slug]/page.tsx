'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { nanoid } from 'nanoid'

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">Expired</span>
  if (days === 0) return <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">Expires Today!</span>
  if (days <= 3) return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">{days} days left</span>
  if (days <= 7) return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{days} days left</span>
  return <span className="bg-orange-50 text-green-700 px-2 py-0.5 rounded text-xs">{days} days left</span>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })
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
      method: 'POST', credentials: 'include',
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

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-200 rounded aspect-[4/3] animate-pulse" />
          <div className="bg-gray-200 rounded h-8 w-2/3 animate-pulse" />
          <div className="bg-gray-200 rounded h-6 w-1/3 animate-pulse" />
        </div>
        <div className="bg-gray-200 rounded h-64 animate-pulse" />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-xl font-bold mb-2">Listing not found</h1>
      <Link href="/listings" className="btn-primary">Browse Listings</Link>
    </div>
  )

  if (listing.status === 'expired') return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">⏰</p>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p className="text-gray-600 mb-6">This listing has expired.</p>
      <Link href="/listings" className="btn-primary">Browse Active Listings</Link>
    </div>
  )

  const fullLocation = [listing.address, listing.city, listing.region].filter(Boolean).join(', ')

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-orange-600">Listings</Link>
          <span>/</span>
          <Link href={`/listings?category=${listing.category?.slug}`} className="hover:text-orange-600">{listing.category?.name}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]" aria-current="page">{listing.title}</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="grid md:grid-cols-3 gap-5">

          {/* LEFT — photos + details */}
          <div className="md:col-span-2 space-y-4">

            {/* Photos */}
            <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100">
                {listing.photos?.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.photos[activePhoto]?.urlMedium} alt={listing.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl text-gray-200">📦</div>
                )}
                {/* Discount badge */}
                {listing.discountPct && (
                  <span className="absolute top-0 left-0 bg-red-500 text-white text-sm font-bold px-3 py-1">
                    -{Math.round(parseFloat(listing.discountPct))}% OFF
                  </span>
                )}
              </div>
              {listing.photos?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                  {listing.photos.map((p: any, i: number) => (
                    <button key={p.id} onClick={() => setActivePhoto(i)}
                      aria-label={`View photo ${i + 1}`}
                      aria-pressed={i === activePhoto}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition ${i === activePhoto ? 'border-orange-500' : 'border-gray-200'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.urlThumb} alt="" className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
                <button onClick={toggleFav} className="flex-shrink-0 text-2xl"
                  aria-label={isFav ? 'Remove from saved' : 'Save listing'}>
                  {isFav ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-2xl font-bold text-orange-600">৳ {parseFloat(listing.discountedPrice).toLocaleString('en-BD')}</span>
                <span className="text-base text-gray-400 line-through">৳ {parseFloat(listing.originalPrice).toLocaleString('en-BD')}</span>
                <ExpiryBadge days={listing.days_remaining} />
              </div>

              {/* Key details row — Bikroy style */}
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">📦</span>
                  <span>Quantity: <strong>{listing.quantity}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">📅</span>
                  <span>Expires: <strong>{formatDate(listing.expiryDate)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">🏷️</span>
                  <span>Category: <strong>{listing.category?.name}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400">👁</span>
                  <span>{listing.viewCount} views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                  <span className="text-gray-400">🕐</span>
                  <span>Posted: <strong>{formatDate(listing.createdAt)}</strong></span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Description</h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Location — Bikroy style */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Location</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 text-lg">📍</span>
                </div>
                <div>
                  {listing.address && <p className="font-medium text-gray-900 text-sm">{listing.address}</p>}
                  <p className="text-gray-600 text-sm">{listing.city}{listing.region ? `, ${listing.region}` : ''}</p>
                  <p className="text-gray-400 text-xs mt-1">Bangladesh</p>
                </div>
              </div>
              {/* Google Maps link */}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(fullLocation + ', Bangladesh')}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <span className="text-xl">🗺️</span>
                <div>
                  <p className="font-semibold">View on Google Maps</p>
                  <p className="text-xs text-orange-500 truncate">{fullLocation}, Bangladesh</p>
                </div>
                <span className="ml-auto text-orange-400">→</span>
              </a>
            </div>

            {/* Safety tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-xs text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Safety Tips</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Meet in a safe, public place to inspect the product before buying.</li>
                <li>Check expiry date and packaging before purchase.</li>
                <li>ExpiryDeals does not handle payments or delivery.</li>
                <li>Report suspicious listings using the Report button.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT — seller card + contact */}
          <div className="space-y-4">

            {/* Contact card */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4 space-y-3">
              {!contact ? (
                <button onClick={handleContact} disabled={contactLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded text-base transition">
                  {contactLoading ? 'Loading...' : '📞 Show Phone Number'}
                </button>
              ) : (
                <div className="space-y-2">
                  <a href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded text-base transition">
                    📞 {contact.phone}
                  </a>
                  {contact.whatsapp_link && (
                    <a href={contact.whatsapp_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20b558] text-white font-semibold py-2.5 px-4 rounded transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
              {!user && (
                <p className="text-xs text-center text-gray-400">
                  <Link href="/login" className="text-orange-600 hover:underline">Log in</Link> to see contact info
                </p>
              )}
              <button onClick={() => setReportOpen(true)} className="w-full text-xs text-gray-400 hover:text-red-500 py-1 flex items-center justify-center gap-1">
                🚩 Report this ad
              </button>
            </div>

            {/* Seller card — Bikroy style */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seller Information</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">
                  {(listing.seller?.business_name || listing.seller?.full_name || 'S')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 text-sm">{listing.seller?.business_name || listing.seller?.full_name || 'Seller'}</p>
                    {listing.seller?.is_verified_seller && (
                      <span title="Verified Seller" className="text-orange-500 text-sm">✓</span>
                    )}
                  </div>
                  {listing.seller?.is_verified_seller && (
                    <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">Verified Seller</span>
                  )}
                  <p className="text-xs text-gray-500">Member since {new Date(listing.seller?.member_since).getFullYear()}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{listing.seller?.business_city || listing.city}, Bangladesh</span>
                </div>
              </div>
            </div>

            {/* Location map */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location</h3>
              <p className="text-sm text-gray-700 mb-2">📍 {[listing.address, listing.city, listing.region].filter(Boolean).join(', ')}, Bangladesh</p>
              <div className="rounded overflow-hidden border border-gray-100">
                <iframe
                  title="Listing location"
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent([listing.address, listing.city, 'Bangladesh'].filter(Boolean).join(', '))}&output=embed&z=13`}
                />
              </div>
            </div>

            {/* Ad details sidebar */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ad Details</h3>
              <table className="w-full text-xs text-gray-600">
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-1.5 text-gray-400">Ad ID</td><td className="py-1.5 font-mono text-right">{listing.id?.slice(0, 8).toUpperCase()}</td></tr>
                  <tr><td className="py-1.5 text-gray-400">Posted</td><td className="py-1.5 text-right">{formatDate(listing.createdAt)}</td></tr>
                  <tr><td className="py-1.5 text-gray-400">Expiry</td><td className="py-1.5 text-right">{formatDate(listing.expiryDate)}</td></tr>
                  <tr><td className="py-1.5 text-gray-400">Views</td><td className="py-1.5 text-right">{listing.viewCount}</td></tr>
                  <tr><td className="py-1.5 text-gray-400">Location</td><td className="py-1.5 text-right">{listing.city}</td></tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 id="report-dialog-title" className="font-bold text-lg">Report Listing</h3>
            {reportSent ? (
              <p className="text-orange-600">✅ Report submitted. Thank you.</p>
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
                  <button onClick={submitReport} className="btn-danger flex-1">Submit</button>
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
