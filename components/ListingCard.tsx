import Link from 'next/link'
import Image from 'next/image'

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
  if (days < 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Expired</span>
  if (days === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Expires today!</span>
  if (days <= 2) return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{days}d left</span>
  if (days <= 7) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{days}d left</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{days}d left</span>
}

export function ListingCard({ listing }: { listing: Listing }) {
  const discount = Math.round(parseFloat(listing.discountPct))

  return (
    <Link href={`/listings/${listing.slug}`} className="card flex flex-col hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {listing.primary_photo ? (
          <Image
            src={listing.primary_photo.urlThumb}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-green-600 font-medium">{listing.category.name}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">{listing.title}</h3>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">
            ${parseFloat(listing.discountedPrice).toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            ${parseFloat(listing.originalPrice).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-gray-500">📍 {listing.city}</span>
          <ExpiryBadge days={listing.days_remaining} />
        </div>
      </div>
    </Link>
  )
}
