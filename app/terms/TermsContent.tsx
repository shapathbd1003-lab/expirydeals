'use client'
import { useLang } from '@/hooks/useLang'

const T = {
  en: {
    title: 'Terms of Service', updated: 'Last updated: June 2025',
    sections: [
      { h: '1. Acceptance of Terms', p: 'By using ExpiryDealsBD, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.' },
      { h: '2. Platform Description', p: 'ExpiryDealsBD is a marketplace connecting sellers with buyers for products approaching their expiry dates, as well as new and used products. We facilitate listings and connections but do not handle payments or deliveries.' },
      { h: '3. Seller Responsibilities', list: [
        'All listed products must be genuine and accurately described.',
        'Expiry dates must be correct and truthful.',
        'Sellers are responsible for the quality and safety of their products.',
        'Sellers must honor agreed prices and quantities with buyers.',
        'Listing expired or unsafe products is strictly prohibited.',
      ] },
      { h: '4. Buyer Responsibilities', list: [
        'Buyers must verify product condition before purchase.',
        'ExpiryDealsBD is not liable for products purchased through the platform.',
        'Buyers must inspect expiry dates before consuming any product.',
      ] },
      { h: '5. Prohibited Content', p: 'Users may not list counterfeit, hazardous, recalled, or illegal products. ExpiryDealsBD reserves the right to remove any listing and suspend any account violating these terms.' },
      { h: '6. No Payment or Delivery Services', p: 'ExpiryDealsBD does not process payments or provide delivery services. All transactions and logistics are arranged directly between buyers and sellers.' },
      { h: '7. Limitation of Liability', p: 'ExpiryDealsBD provides the platform "as is" and is not responsible for disputes, product quality, or transactions between users. Use the platform at your own risk.' },
      { h: '8. Account Termination', p: 'We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.' },
      { h: '9. Changes to Terms', p: 'We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the new terms.' },
      { h: '10. Contact', p: 'For questions about these terms, contact us at support@expirydealsbd.com.' },
    ],
  },
  bn: {
    title: 'সেবার শর্তাবলী', updated: 'সর্বশেষ হালনাগাদ: জুন ২০২৫',
    sections: [
      { h: '১. শর্তাবলী গ্রহণ', p: 'ExpiryDealsBD ব্যবহার করে, আপনি এই সেবার শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। আপনি যদি সম্মত না হন, তাহলে অনুগ্রহ করে এই প্ল্যাটফর্ম ব্যবহার করবেন না।' },
      { h: '২. প্ল্যাটফর্মের বিবরণ', p: 'ExpiryDealsBD একটি মার্কেটপ্লেস যা মেয়াদ শেষ হওয়ার কাছাকাছি পণ্যের পাশাপাশি নতুন ও ব্যবহৃত পণ্যের জন্য বিক্রেতা ও ক্রেতাদের সংযুক্ত করে। আমরা বিজ্ঞাপন ও সংযোগ সহজ করি কিন্তু পেমেন্ট বা ডেলিভারি পরিচালনা করি না।' },
      { h: '৩. বিক্রেতার দায়িত্ব', list: [
        'তালিকাভুক্ত সকল পণ্য অবশ্যই আসল এবং সঠিকভাবে বর্ণিত হতে হবে।',
        'মেয়াদ শেষের তারিখ অবশ্যই সঠিক ও সত্য হতে হবে।',
        'বিক্রেতারা তাদের পণ্যের গুণমান ও নিরাপত্তার জন্য দায়ী।',
        'বিক্রেতাদের ক্রেতাদের সাথে সম্মত মূল্য ও পরিমাণ বজায় রাখতে হবে।',
        'মেয়াদোত্তীর্ণ বা অনিরাপদ পণ্য তালিকাভুক্ত করা কঠোরভাবে নিষিদ্ধ।',
      ] },
      { h: '৪. ক্রেতার দায়িত্ব', list: [
        'ক্রেতাদের কেনার আগে পণ্যের অবস্থা যাচাই করতে হবে।',
        'প্ল্যাটফর্মের মাধ্যমে কেনা পণ্যের জন্য ExpiryDealsBD দায়ী নয়।',
        'যেকোনো পণ্য ব্যবহারের আগে ক্রেতাদের মেয়াদ শেষের তারিখ পরীক্ষা করতে হবে।',
      ] },
      { h: '৫. নিষিদ্ধ কন্টেন্ট', p: 'ব্যবহারকারীরা নকল, বিপজ্জনক, প্রত্যাহারকৃত, বা অবৈধ পণ্য তালিকাভুক্ত করতে পারবেন না। এই শর্তাবলী লঙ্ঘনকারী যেকোনো বিজ্ঞাপন সরানোর এবং যেকোনো অ্যাকাউন্ট স্থগিত করার অধিকার ExpiryDealsBD সংরক্ষণ করে।' },
      { h: '৬. কোনো পেমেন্ট বা ডেলিভারি সেবা নেই', p: 'ExpiryDealsBD পেমেন্ট প্রক্রিয়া করে না বা ডেলিভারি সেবা প্রদান করে না। সকল লেনদেন ও লজিস্টিক সরাসরি ক্রেতা ও বিক্রেতার মধ্যে ব্যবস্থা করা হয়।' },
      { h: '৭. দায়বদ্ধতার সীমাবদ্ধতা', p: 'ExpiryDealsBD প্ল্যাটফর্মটি "যেমন আছে" সরবরাহ করে এবং ব্যবহারকারীদের মধ্যে বিরোধ, পণ্যের গুণমান, বা লেনদেনের জন্য দায়ী নয়। নিজ দায়িত্বে প্ল্যাটফর্ম ব্যবহার করুন।' },
      { h: '৮. অ্যাকাউন্ট বাতিলকরণ', p: 'এই শর্তাবলী লঙ্ঘন করে বা জালিয়াতিমূলক কার্যকলাপে জড়িত অ্যাকাউন্ট স্থগিত বা বাতিল করার অধিকার আমরা সংরক্ষণ করি।' },
      { h: '৯. শর্তাবলীতে পরিবর্তন', p: 'আমরা পর্যায়ক্রমে এই শর্তাবলী হালনাগাদ করতে পারি। পরিবর্তনের পরেও প্ল্যাটফর্মের ব্যবহার চালিয়ে যাওয়া মানে নতুন শর্তাবলী গ্রহণ করা।' },
      { h: '১০. যোগাযোগ', p: 'এই শর্তাবলী সম্পর্কে প্রশ্নের জন্য, আমাদের সাথে যোগাযোগ করুন support@expirydealsbd.com এ।' },
    ],
  },
}

export default function TermsContent() {
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
          </section>
        ))}
      </div>
    </div>
  )
}
