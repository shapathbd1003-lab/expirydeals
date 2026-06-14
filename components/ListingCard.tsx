import Link from 'next/link'

interface Listing {
  id: string
  slug: string
  title: string
  originalPrice: string
  discountedPrice: string
  discountPct: string
  days_remaining: number
  city: string
  region?: string
  category: { name: string; slug: string }
  primary_photo?: { urlThumb: string } | null
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">Expired</span>
  if (days === 0) return <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white font-medium">Today!</span>
  if (days <= 2) return <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">{days}d left</span>
  return <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{days}d left</span>
}

export function ListingCard({ listing }: { listing: Listing }) {
  const discount = Math.round(parseFloat(listing.discountPct))
  const price = parseFloat(listing.discountedPrice).toLocaleString('en-BD')
  const original = parseFloat(listing.originalPrice).toLocaleString('en-BD')

  return (
    <Link href={`/listings/${listing.slug}`}
      className="bg-white border border-gray-200 rounded hover:shadow-md hover:border-orange-200 transition-shadow group block">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded-t">
        {listing.primary_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.primary_photo.urlThumb}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">📦</div>
        )}
        {/* Discount badge — Bikroy style top-left */}
        {discount > 0 && (
          <span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug mb-1.5 min-h-[2.5rem]">
          {listing.title}
        </h3>

        {/* Price — Bikroy style: big bold price */}
        <p className="text-base font-bold text-gray-900">৳ {price}</p>
        <p className="text-xs text-gray-400 line-through">৳ {original}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 truncate">{listing.city}</span>
          <ExpiryBadge days={listing.days_remaining} />
        </div>
      </div>
    </Link>
  )
}
