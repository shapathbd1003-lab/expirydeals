import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ExpiryDeals collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. What We Collect</h2>
          <p>When you register, we collect your name, email address, and optional phone number. When you post a listing, we collect the product details and photos you provide. We also collect usage data such as listing views and contact clicks.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To operate your account and allow you to post and browse listings.</li>
            <li>To send transactional emails (email verification, password reset).</li>
            <li>To prevent fraud, spam, and abuse of the platform.</li>
            <li>To improve platform performance and user experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. What We Do Not Do</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not sell your personal information to third parties.</li>
            <li>We do not send marketing emails without your consent.</li>
            <li>We do not share your phone number publicly — it is only revealed to logged-in buyers who click &ldquo;Show Phone Number.&rdquo;</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Data Storage</h2>
          <p>Your data is stored securely on servers provided by Neon (PostgreSQL database) and Vercel (hosting), both based in the United States. Passwords are stored as cryptographic hashes — we cannot see your actual password.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Cookies</h2>
          <p>We use an HTTP-only refresh token cookie for keeping you logged in. This cookie is not accessible to JavaScript and cannot be stolen via XSS. We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Your Rights</h2>
          <p>You may delete your account and listings at any time from your account settings. To request a full data export or deletion, contact us at support@expirydeals.com.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Children</h2>
          <p>ExpiryDeals is not intended for children under 13. We do not knowingly collect data from minors.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
          <p>We may update this policy. We will notify registered users of significant changes via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Contact</h2>
          <p>For privacy inquiries, email us at <a href="mailto:support@expirydeals.com" className="text-orange-600 hover:underline">support@expirydeals.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
