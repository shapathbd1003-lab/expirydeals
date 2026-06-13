export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By using ExpiryDeals, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Platform Description</h2>
          <p>ExpiryDeals is a marketplace connecting sellers with buyers for products approaching their expiry dates. We facilitate listings and connections but do not handle payments or deliveries.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Seller Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All listed products must be genuine and accurately described.</li>
            <li>Expiry dates must be correct and truthful.</li>
            <li>Sellers are responsible for the quality and safety of their products.</li>
            <li>Sellers must honor agreed prices and quantities with buyers.</li>
            <li>Listing expired or unsafe products is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Buyer Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Buyers must verify product condition before purchase.</li>
            <li>ExpiryDeals is not liable for products purchased through the platform.</li>
            <li>Buyers must inspect expiry dates before consuming any product.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Prohibited Content</h2>
          <p>Users may not list counterfeit, hazardous, recalled, or illegal products. ExpiryDeals reserves the right to remove any listing and suspend any account violating these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. No Payment or Delivery Services</h2>
          <p>ExpiryDeals does not process payments or provide delivery services. All transactions and logistics are arranged directly between buyers and sellers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>ExpiryDeals provides the platform "as is" and is not responsible for disputes, product quality, or transactions between users. Use the platform at your own risk.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Account Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Changes to Terms</h2>
          <p>We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Contact</h2>
          <p>For questions about these terms, contact us at support@expirydeals.com.</p>
        </section>
      </div>
    </div>
  )
}
