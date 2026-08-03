'use client'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    title: 'Contact Us',
    subtitle: "We'd love to hear from you. Reach out for support, partnership, or any questions about ExpiryDealsBD.",
    emailSupport: 'Email Support', respondTime: 'We typically respond within 24 hours.',
    location: 'Location', locationCity: 'Dhaka, Bangladesh', locationDesc: 'Serving buyers and sellers across Bangladesh.',
    reportListing: 'Report a Listing',
    reportDesc: 'Use the "Report this ad" button on any listing page to flag inappropriate content.',
    partnerships: 'Business & Partnerships', partnershipsDesc: 'Bulk listings, advertising, or API access inquiries.',
    needHelp: 'Need help fast?',
    helpText1: 'Browse our', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy',
    helpText2: 'for common questions about how ExpiryDealsBD works.',
  },
  bn: {
    title: 'যোগাযোগ করুন',
    subtitle: 'আমরা আপনার কাছ থেকে শুনতে চাই। সহায়তা, অংশীদারিত্ব, অথবা ExpiryDealsBD সম্পর্কে যেকোনো প্রশ্নের জন্য যোগাযোগ করুন।',
    emailSupport: 'ইমেইল সহায়তা', respondTime: 'আমরা সাধারণত ২৪ ঘণ্টার মধ্যে সাড়া দিই।',
    location: 'অবস্থান', locationCity: 'ঢাকা, বাংলাদেশ', locationDesc: 'সারা বাংলাদেশে ক্রেতা ও বিক্রেতাদের সেবা প্রদান করছি।',
    reportListing: 'বিজ্ঞাপন রিপোর্ট করুন',
    reportDesc: 'অনুপযুক্ত কন্টেন্ট চিহ্নিত করতে যেকোনো বিজ্ঞাপন পাতায় "রিপোর্ট করুন" বাটন ব্যবহার করুন।',
    partnerships: 'ব্যবসা ও অংশীদারিত্ব', partnershipsDesc: 'বাল্ক বিজ্ঞাপন, বিজ্ঞাপন, বা এপিআই অ্যাক্সেস সংক্রান্ত জিজ্ঞাসা।',
    needHelp: 'দ্রুত সহায়তা প্রয়োজন?',
    helpText1: 'দেখুন আমাদের', terms: 'সেবার শর্তাবলী', and: 'এবং', privacy: 'গোপনীয়তা নীতি',
    helpText2: 'ExpiryDealsBD কীভাবে কাজ করে তা নিয়ে সাধারণ প্রশ্নের জন্য।',
  },
}

export default function ContactContent() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.subtitle}</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">✉️</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">{t.emailSupport}</p>
            <a href="mailto:support@expirydealsbd.com" className="text-orange-600 hover:underline text-sm">
              support@expirydealsbd.com
            </a>
            <p className="text-xs text-gray-500 mt-1">{t.respondTime}</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">📍</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">{t.location}</p>
            <p className="text-gray-600 text-sm">{t.locationCity}</p>
            <p className="text-xs text-gray-500 mt-1">{t.locationDesc}</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🚩</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">{t.reportListing}</p>
            <p className="text-gray-600 text-sm">{t.reportDesc}</p>
          </div>
        </div>

        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 text-xl">🤝</div>
          <div>
            <p className="font-semibold text-gray-900 mb-0.5">{t.partnerships}</p>
            <a href="mailto:hello@expirydealsbd.com" className="text-orange-600 hover:underline text-sm">
              hello@expirydealsbd.com
            </a>
            <p className="text-xs text-gray-500 mt-1">{t.partnershipsDesc}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-orange-50 border border-orange-100 rounded-xl p-5 text-sm text-orange-800">
        <p className="font-semibold mb-1">{t.needHelp}</p>
        <p>{t.helpText1} <a href="/terms" className="underline hover:text-orange-900">{t.terms}</a> {t.and} <a href="/privacy" className="underline hover:text-orange-900">{t.privacy}</a> {t.helpText2}</p>
      </div>
    </div>
  )
}
