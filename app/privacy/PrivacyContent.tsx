'use client'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    title: 'Privacy Policy', updated: 'Last updated: June 2025',
    sections: [
      { h: '1. What We Collect', p: 'When you register, we collect your name, email address, and optional phone number. When you post a listing, we collect the product details and photos you provide. We also collect usage data such as listing views and contact clicks.' },
      { h: '2. How We Use Your Data', list: [
        'To operate your account and allow you to post and browse listings.',
        'To send transactional emails (email verification, password reset).',
        'To prevent fraud, spam, and abuse of the platform.',
        'To improve platform performance and user experience.',
      ] },
      { h: '3. What We Do Not Do', list: [
        'We do not sell your personal information to third parties.',
        'We do not send marketing emails without your consent.',
        'We do not share your phone number publicly — it is only revealed to logged-in buyers who click "Show Phone Number."',
      ] },
      { h: '4. Data Storage', p: 'Your data is stored securely on servers provided by Neon (PostgreSQL database) and Vercel (hosting), both based in the United States. Passwords are stored as cryptographic hashes — we cannot see your actual password.' },
      { h: '5. Cookies', p: 'We use an HTTP-only refresh token cookie for keeping you logged in. This cookie is not accessible to JavaScript and cannot be stolen via XSS. We do not use advertising or tracking cookies.' },
      { h: '6. Your Rights', p: 'You may delete your account and listings at any time from your account settings. To request a full data export or deletion, contact us at support@expirydealsbd.com.' },
      { h: '7. Children', p: 'ExpiryDealsBD is not intended for children under 13. We do not knowingly collect data from minors.' },
      { h: '8. Changes to This Policy', p: 'We may update this policy. We will notify registered users of significant changes via email.' },
      { h: '9. Contact', pHtml: true },
    ],
    contactPrefix: 'For privacy inquiries, email us at',
  },
  bn: {
    title: 'গোপনীয়তা নীতি', updated: 'সর্বশেষ হালনাগাদ: জুন ২০২৫',
    sections: [
      { h: '১. আমরা কী সংগ্রহ করি', p: 'নিবন্ধনের সময়, আমরা আপনার নাম, ইমেইল ঠিকানা এবং ঐচ্ছিক ফোন নম্বর সংগ্রহ করি। বিজ্ঞাপন পোস্ট করার সময়, আপনার দেওয়া পণ্যের বিবরণ ও ছবি সংগ্রহ করি। আমরা ব্যবহারের তথ্যও সংগ্রহ করি, যেমন বিজ্ঞাপন ভিউ ও যোগাযোগ ক্লিক।' },
      { h: '২. আমরা কীভাবে আপনার তথ্য ব্যবহার করি', list: [
        'আপনার অ্যাকাউন্ট পরিচালনা করতে এবং বিজ্ঞাপন পোস্ট ও ব্রাউজ করতে সাহায্য করতে।',
        'লেনদেনমূলক ইমেইল পাঠাতে (ইমেইল যাচাইকরণ, পাসওয়ার্ড রিসেট)।',
        'জালিয়াতি, স্প্যাম, এবং প্ল্যাটফর্মের অপব্যবহার প্রতিরোধ করতে।',
        'প্ল্যাটফর্মের কর্মক্ষমতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে।',
      ] },
      { h: '৩. আমরা যা করি না', list: [
        'আমরা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।',
        'আপনার সম্মতি ছাড়া আমরা মার্কেটিং ইমেইল পাঠাই না।',
        'আমরা আপনার ফোন নম্বর প্রকাশ্যে শেয়ার করি না — এটি শুধুমাত্র লগ ইন করা ক্রেতাদের কাছে প্রকাশ করা হয় যারা "ফোন নম্বর দেখুন" ক্লিক করেন।',
      ] },
      { h: '৪. তথ্য সংরক্ষণ', p: 'আপনার তথ্য নিরাপদে Neon (PostgreSQL ডাটাবেস) এবং Vercel (হোস্টিং) প্রদত্ত সার্ভারে সংরক্ষণ করা হয়, উভয়ই যুক্তরাষ্ট্রে অবস্থিত। পাসওয়ার্ড ক্রিপ্টোগ্রাফিক হ্যাশ হিসেবে সংরক্ষণ করা হয় — আমরা আপনার প্রকৃত পাসওয়ার্ড দেখতে পাই না।' },
      { h: '৫. কুকিজ', p: 'আপনাকে লগ ইন রাখতে আমরা একটি HTTP-only রিফ্রেশ টোকেন কুকি ব্যবহার করি। এই কুকিটি জাভাস্ক্রিপ্ট দ্বারা অ্যাক্সেসযোগ্য নয় এবং XSS এর মাধ্যমে চুরি করা যায় না। আমরা বিজ্ঞাপন বা ট্র্যাকিং কুকি ব্যবহার করি না।' },
      { h: '৬. আপনার অধিকার', p: 'আপনি যেকোনো সময় আপনার অ্যাকাউন্ট সেটিংস থেকে আপনার অ্যাকাউন্ট ও বিজ্ঞাপন মুছে ফেলতে পারেন। সম্পূর্ণ ডেটা এক্সপোর্ট বা মুছে ফেলার অনুরোধের জন্য, support@expirydealsbd.com এ যোগাযোগ করুন।' },
      { h: '৭. শিশু', p: 'ExpiryDealsBD ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা জেনেশুনে নাবালকদের কাছ থেকে তথ্য সংগ্রহ করি না।' },
      { h: '৮. এই নীতিতে পরিবর্তন', p: 'আমরা এই নীতি হালনাগাদ করতে পারি। উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে আমরা নিবন্ধিত ব্যবহারকারীদের ইমেইলের মাধ্যমে জানাব।' },
      { h: '৯. যোগাযোগ', pHtml: true },
    ],
    contactPrefix: 'গোপনীয়তা সংক্রান্ত জিজ্ঞাসার জন্য, আমাদের ইমেইল করুন',
  },
}

export default function PrivacyContent() {
  const { lang } = useLang()
  const t = T[lang]
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{t.updated}</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        {t.sections.map((s: any) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.list && (
              <ul className="list-disc pl-5 space-y-1">
                {s.list.map((item: string) => <li key={item}>{item}</li>)}
              </ul>
            )}
            {s.pHtml && (
              <p>{t.contactPrefix} <a href="mailto:support@expirydealsbd.com" className="text-orange-600 hover:underline">support@expirydealsbd.com</a>.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
