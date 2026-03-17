import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PrivacyCa = () => (
  <div className="min-h-screen bg-background">
    <main className="max-w-3xl mx-auto px-8 pt-32 pb-20">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">California Privacy Notice</h1>
      <p className="font-editorial text-sm text-muted-foreground mb-12">Last updated: March 14, 2026</p>

      {/* SPI Table */}
      <section className="mb-12 rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl text-foreground mb-4">Notice at Collection of Sensitive Personal Information</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed mb-4">
          Pursuant to the CPRA, the following categories of <strong className="text-foreground">Sensitive Personal Information (SPI)</strong> are collected by Castle Companion, LLC:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full font-editorial text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-foreground font-medium">SPI Category</th>
                <th className="text-left py-3 pr-4 text-foreground font-medium">Purpose</th>
                <th className="text-left py-3 text-foreground font-medium">Retention</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 pr-4">Precise Geolocation (GPS)</td>
                <td className="py-3 pr-4">In-Park Active Automation: real-time routing, contextual nudges, wait-time optimization</td>
                <td className="py-3 font-medium text-foreground">Deleted 24 hours after park exit</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 pr-4">Minor's Data (under 16)</td>
                <td className="py-3 pr-4">Group planning profiles (names, ages, ride preferences) — collected from and controlled by adult account holder</td>
                <td className="py-3">Duration of account; deleted within 30 days of account deletion</td>
              </tr>
              <tr>
                <td className="py-3 pr-4">Account Credentials</td>
                <td className="py-3 pr-4">Authentication and account security</td>
                <td className="py-3">Duration of account</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-editorial text-xs text-muted-foreground leading-relaxed mt-4">
          SPI is used only for purposes necessary to perform the Service. It is not used for cross-context behavioral advertising or profiling.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">Limit the Use of My Sensitive Personal Information</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Under the CPRA, you have the right to limit our use of your Sensitive Personal Information to purposes necessary to perform the Service. If you limit SPI, high-precision geolocation tracking will be disabled. Basic app functionality (itinerary viewing, manual planning) will remain available.
        </p>
      </section>

      {/* Notice at Collection */}
      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">Notice at Collection (CPRA / AB 2013)</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          This Notice is provided pursuant to the CCPA, the CPRA, and California AB 2013. It is intended for California residents and supplements our general <Link to="/privacy" className="text-[hsl(var(--lavender))] hover:underline">Privacy Policy</Link>. Castle Companion, LLC collects the following categories at or before the point of collection:
        </p>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">Identifiers:</strong> Name, email address, mobile phone number, unique device identifiers, IP address.</li>
          <li><strong className="text-foreground">Commercial Information:</strong> Records of plans purchased, transaction history, payment method metadata.</li>
          <li><strong className="text-foreground">Internet/Electronic Activity:</strong> Browsing history within the Service, feature usage, session data.</li>
          <li><strong className="text-foreground">Precise Geolocation Data (SPI):</strong> GPS coordinates collected with your permission. <strong className="text-foreground">Deleted 24 hours after park exit.</strong></li>
          <li><strong className="text-foreground">Profile &amp; Group Data:</strong> Guest names, ages, ride preferences, dietary restrictions, accessibility needs.</li>
          <li><strong className="text-foreground">AI Inference Data:</strong> Inferences generated by our "Quiet Companion" RAG system for real-time inference. Not shared with third-party data brokers.</li>
          <li><strong className="text-foreground">Local Vision State:</strong> Transient image data processed via local Vision AI. Not biometric data collection. Deleted immediately upon completion of each verification event.</li>
        </ul>
        <p className="font-editorial text-sm text-foreground leading-relaxed mt-4 font-medium">
          Castle Companion, LLC does not use your personal data to train global or third-party AI models. Your data is used for immediate inference only and remains sovereign.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">1. Your Rights Under the CCPA/CPRA</h2>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-2">
          <li><strong className="text-foreground">Right to Know:</strong> Request that we disclose the categories and specific pieces of personal information collected, sources, purposes, and third parties shared with.</li>
          <li><strong className="text-foreground">Right to Delete:</strong> Request that we delete personal information collected from you, subject to certain exceptions.</li>
          <li><strong className="text-foreground">Right to Correct:</strong> Request that we correct inaccurate personal information.</li>
          <li><strong className="text-foreground">Right to Opt Out of Sale/Sharing:</strong> <strong className="text-foreground">Castle Companion does not sell or share your personal information</strong> as defined by the CCPA/CPRA.</li>
          <li><strong className="text-foreground">Right to Limit Use of SPI:</strong> Limit our use of Sensitive Personal Information to purposes necessary to perform the Service.</li>
          <li><strong className="text-foreground">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your rights.</li>
        </ul>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">2. How We Use Your Information</h2>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-1">
          <li>Providing, personalizing, and improving the Service.</li>
          <li>Creating and managing your account.</li>
          <li>Generating personalized itineraries and real-time park recommendations.</li>
          <li>Processing payments and managing your plan.</li>
          <li>Sending contextual, in-park notifications and service-related SMS communications.</li>
          <li>Performing Active Automation logistics.</li>
          <li>Performing Mini Memory Maker verification via local Vision AI.</li>
          <li>Detecting and preventing fraud, abuse, and security issues.</li>
          <li>Complying with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">3. Sale &amp; Sharing of Personal Information</h2>
        <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
          Castle Companion does not sell your personal information. We do not share your personal information for cross-context behavioral advertising. We do not have actual knowledge that we sell or share the personal information of consumers under 16 years of age.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">4. Retention</h2>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-1">
          <li><strong className="text-foreground">Precise Geolocation Data:</strong> Deleted or anonymized within 24 hours of park exit.</li>
          <li><strong className="text-foreground">AI Inference Data:</strong> Retained for the duration of your account and deleted within 30 days of account deletion.</li>
          <li><strong className="text-foreground">Local Vision State:</strong> Deleted immediately upon completion of each verification event.</li>
        </ul>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">5. AB 2013 Generative AI Transparency</h2>
        <h3 className="font-display text-base text-foreground mt-6">5.1 Model &amp; Data Sourcing Disclosure</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion utilizes third-party models (OpenAI/Gemini) for real-time inference. <strong className="text-foreground">We do not use your personal data to train these models.</strong> Our RAG system is grounded in publicly available theme park data and proprietary logistical logic. Governed by Enterprise-grade API agreements.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">5.2 Local Vision AI</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Mini Memory Maker verification runs locally on the user's device. In the event of a system failover, data is transmitted using AES-256 encryption and deleted upon completion.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">5.3 No-Training Guarantee</h3>
        <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
          We do not use user-provided trip data, "Mini Memory Maker" photos, or interaction history to train or modify our underlying models or those of our third-party providers. No personal trip data, photos, child-related information, or consumer behavioral data is used as training input for any large language model or generative AI system.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">6. Shared Responsibility &amp; Automation Disclosure (AB 316)</h2>
        <h3 className="font-display text-base text-foreground mt-6">6.1 Human-in-the-Loop Model</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion, LLC accepts responsibility for the integrity of its AI outputs. All automated nudges and recommendations are advisory. The user remains the final human-in-the-loop and maintains full responsibility for their physical safety and compliance with theme park rules.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">6.2 AI Interaction Notice</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          During active park days, users receive a recurring disclosure notice every 3 hours identifying the system as an artificial intelligence. This notice cannot be disabled as it is required for regulatory compliance.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">7. Pricing Transparency &amp; Financial Incentive Disclosure (SB 53)</h2>
        <h3 className="font-display text-base text-foreground mt-6">7.1 Direct-to-Sovereign Discount</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Prices for plans purchased through the Castle Companion web application are $10–$20 lower than those offered through third-party App Stores. This pricing differential is a "Platform Tax Offset" reflecting reduced administrative costs. <strong className="text-foreground">This discount is not a payment or financial incentive for the sale, sharing, or disclosure of personal information.</strong>
        </p>
        <h3 className="font-display text-base text-foreground mt-6">7.2 Non-Discrimination</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Users who purchase through the higher-priced App Store channel receive the same privacy protections, service quality, features, and data rights as web purchasers.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">8. Notice to Minors — Children's Data Protection (SB 243 / AB 316)</h2>
        <h3 className="font-display text-base text-foreground mt-6">8.1 Users Under 16</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          If a group profile includes a guest identified as under 16 years of age, <strong className="text-foreground">that minor's data is automatically opted out of any "selling" or "sharing"</strong> as defined by the CCPA/CPRA. This opt-out is applied by default and cannot be overridden.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">8.2 Users Under 13</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion does not knowingly collect personal information directly from children under 13. Group planning features allow adults to include children's names and preferences; this information is collected from and controlled by the adult account holder.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">8.3 Local Vision AI &amp; Minors</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Photos used for the "Mini Memory Maker" feature are processed locally on the user's device. These images are <strong className="text-foreground">never uploaded to a persistent cloud database</strong> and are never used for facial recognition training or biometric profiling.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">9. How to Exercise Your Rights</h2>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-1">
          <li>Email us at <a href="mailto:privacy@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">privacy@castlecompanion.com</a></li>
          <li>Use the "Privacy Settings" section within your account in the App</li>
          <li>Visit our <Link to="/do-not-sell" className="text-[hsl(var(--lavender))] hover:underline">Do Not Sell or Share My Personal Information</Link> page</li>
        </ul>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed mt-4">
          We will verify your identity before processing any request. We will respond to verifiable consumer requests within 45 days, as required by law.
        </p>
        <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
          Confirmation of Opt-Out (2026 DROP Mandate): When you exercise any privacy right, you will receive an immediate on-screen confirmation and a confirmation email within 24 hours.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">10. Contact Us</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          If you have any questions about this California Privacy Notice or your rights, please contact us:
        </p>
        <div className="font-editorial text-sm text-muted-foreground leading-relaxed">
          <p>Castle Companion, LLC</p>
          <p>3400 Cottage Way, Ste G2 #34293</p>
          <p>Sacramento, CA 95825</p>
          <p className="mt-2">
            <a href="mailto:privacy@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">privacy@castlecompanion.com</a>
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default PrivacyCa;
