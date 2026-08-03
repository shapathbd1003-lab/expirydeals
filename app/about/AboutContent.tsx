'use client'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    title: 'About ExpiryDealsBD', tagline: "Bangladesh's marketplace for near-expiry products.",
    missionTitle: 'Our Mission',
    missionBody: 'Every year, tons of perfectly safe food and consumer products are thrown away simply because their expiry date is approaching. ExpiryDealsBD was built to connect sellers who have surplus near-expiry stock with buyers looking for genuine discounts — reducing waste and saving money at the same time.',
    howItWorksTitle: 'How It Works',
    steps: [
      { n: '1', title: 'Sellers Post Free', desc: 'Businesses and individuals list near-expiry products at discounted prices. No commission, no fees.' },
      { n: '2', title: 'Buyers Browse', desc: 'Browse hundreds of listings by category, city, discount percentage, or expiry date.' },
      { n: '3', title: 'Direct Contact', desc: 'Buyers contact sellers directly via phone or WhatsApp. We facilitate the connection, not the transaction.' },
    ],
    whoWeServeTitle: 'Who We Serve',
    who: [
      { strong: 'Retailers & shops', rest: '— clear near-expiry stock quickly instead of discarding it.' },
      { strong: 'Restaurants & hotels', rest: '— sell surplus ingredients before they expire.' },
      { strong: 'Individuals', rest: '— resell groceries or products bought in bulk.' },
      { strong: 'Budget-conscious buyers', rest: '— access quality products at 20–80% discounts.' },
    ],
    disclaimerTitle: 'Important Disclaimer',
    disclaimerBody: 'ExpiryDealsBD does not verify product safety or quality. Always inspect expiry dates and product condition before purchasing. ExpiryDealsBD is not responsible for transactions between buyers and sellers. Use good judgment and meet in public places.',
    browseListings: 'Browse Listings', contactUs: 'Contact Us',
  },
  bn: {
    title: 'ExpiryDealsBD সম্পর্কে', tagline: 'বাংলাদেশের মেয়াদ শেষ হওয়ার কাছাকাছি পণ্যের মার্কেটপ্লেস।',
    missionTitle: 'আমাদের লক্ষ্য',
    missionBody: 'প্রতি বছর, শুধুমাত্র মেয়াদ শেষ হওয়ার কাছাকাছি হওয়ার কারণে সম্পূর্ণ নিরাপদ খাদ্য ও ভোগ্যপণ্য টন টন ফেলে দেওয়া হয়। ExpiryDealsBD তৈরি করা হয়েছে সেই বিক্রেতাদের সাথে ক্রেতাদের সংযুক্ত করতে যারা প্রকৃত ছাড় খুঁজছেন — একই সাথে অপচয় কমানো এবং টাকা সাশ্রয় করা।',
    howItWorksTitle: 'কীভাবে কাজ করে',
    steps: [
      { n: '1', title: 'বিক্রেতারা বিনামূল্যে পোস্ট করেন', desc: 'ব্যবসা প্রতিষ্ঠান ও ব্যক্তিরা ছাড়ের মূল্যে মেয়াদ শেষ হওয়ার কাছাকাছি পণ্য তালিকাভুক্ত করেন। কোনো কমিশন নেই, কোনো ফি নেই।' },
      { n: '2', title: 'ক্রেতারা খুঁজে দেখেন', desc: 'ক্যাটাগরি, শহর, ছাড়ের শতাংশ, বা মেয়াদ অনুযায়ী শত শত বিজ্ঞাপন দেখুন।' },
      { n: '3', title: 'সরাসরি যোগাযোগ', desc: 'ক্রেতারা সরাসরি ফোন বা হোয়াটসঅ্যাপে বিক্রেতার সাথে যোগাযোগ করেন। আমরা সংযোগ সহজ করি, লেনদেন নয়।' },
    ],
    whoWeServeTitle: 'আমরা কাদের সেবা দিই',
    who: [
      { strong: 'খুচরা বিক্রেতা ও দোকান', rest: '— ফেলে দেওয়ার বদলে মেয়াদ শেষ হওয়ার কাছাকাছি স্টক দ্রুত সাফ করুন।' },
      { strong: 'রেস্তোরাঁ ও হোটেল', rest: '— মেয়াদ শেষ হওয়ার আগে অতিরিক্ত উপকরণ বিক্রি করুন।' },
      { strong: 'ব্যক্তিগত বিক্রেতা', rest: '— বাল্কে কেনা মুদিপণ্য বা পণ্য পুনরায় বিক্রি করুন।' },
      { strong: 'বাজেট-সচেতন ক্রেতা', rest: '— ২০–৮০% ছাড়ে মানসম্পন্ন পণ্য পান।' },
    ],
    disclaimerTitle: 'গুরুত্বপূর্ণ দাবিত্যাগ',
    disclaimerBody: 'ExpiryDealsBD পণ্যের নিরাপত্তা বা গুণমান যাচাই করে না। কেনার আগে সবসময় মেয়াদ ও পণ্যের অবস্থা পরীক্ষা করুন। ক্রেতা ও বিক্রেতার মধ্যে লেনদেনের জন্য ExpiryDealsBD দায়ী নয়। সঠিক বিচার-বুদ্ধি ব্যবহার করুন এবং পাবলিক জায়গায় দেখা করুন।',
    browseListings: 'বিজ্ঞাপন দেখুন', contactUs: 'যোগাযোগ করুন',
  },
}

export default function AboutContent() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-orange-600 font-medium mb-8">{t.tagline}</p>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.missionTitle}</h2>
          <p>{t.missionBody}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.howItWorksTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {t.steps.map((step) => (
              <div key={step.n} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">{step.n}</div>
                <p className="font-semibold text-gray-900 mb-1 text-sm">{step.title}</p>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t.whoWeServeTitle}</h2>
          <ul className="space-y-2 text-sm list-disc list-inside">
            {t.who.map((w) => (
              <li key={w.strong}><strong>{w.strong}</strong> {w.rest}</li>
            ))}
          </ul>
        </section>

        <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">
          <p className="font-semibold mb-1">{t.disclaimerTitle}</p>
          <p>{t.disclaimerBody}</p>
        </section>

        <div className="flex gap-3">
          <Link href="/listings" className="btn-primary">{t.browseListings}</Link>
          <Link href="/contact" className="btn-secondary">{t.contactUs}</Link>
        </div>
      </div>
    </div>
  )
}
