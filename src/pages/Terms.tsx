import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <main className="max-w-3xl mx-auto px-8 pt-32 pb-20">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">Terms of Use</h1>
      <p className="font-editorial text-sm text-muted-foreground mb-12">Last updated: March 1, 2026</p>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">1. Acceptance of Terms</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          By downloading, installing, or using the Castle Companion mobile application ("App"), website, or any related services (collectively, the "Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, please do not use the Service. Castle Companion, LLC ("Company," "we," "us," or "our") reserves the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">2. Description of Service &amp; Non-Affiliation</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion is an independent, third-party planning and real-time guidance tool designed to enhance your experience at theme parks. The Service provides personalized itineraries, wait-time monitoring, contextual notifications, and related planning features.
        </p>
        <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
          IMPORTANT DISCLAIMER: Castle Companion, LLC is <strong>not</strong> affiliated with, endorsed by, sponsored by, licensed by, or in any way associated with The Walt Disney Company, Walt Disney World Resort, Disneyland Resort, Disney Enterprises, Inc., or any of their parent companies, subsidiaries, affiliates, successors, or assigns (collectively, "Disney"). Castle Companion is also not affiliated with Universal Destinations &amp; Experiences, SeaWorld Parks &amp; Entertainment, or any other theme park owner or operator. All theme park names, attraction names, character names, and related intellectual property referenced within the Service are the trademarks and property of their respective owners. Any references to theme park attractions, locations, or experiences are used solely for descriptive and informational purposes and do not imply any endorsement, sponsorship, or affiliation.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">3. Eligibility</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          You must be at least 18 years of age to create an account or license a plan. By using the Service, you represent and warrant that you have the legal capacity to enter into a binding agreement. If you are using the Service on behalf of a group or family, you represent that you have the authority to bind all group members to these Terms.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">4. Account Registration</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">4.1 AI Recommendations and Shared Responsibility (AB 316)</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion, LLC accepts responsibility for the integrity of its AI outputs pursuant to CA AB 316. However, you acknowledge that all "Active Automation" nudges and recommendations are advisory tools. By using the Service, you agree to a <strong className="text-foreground">Shared Responsibility Model</strong>: while we automate logistics, you remain the final "human-in-the-loop" and are solely responsible for your family's physical safety and compliance with all theme park rules. Liability for automation outcomes shall be apportioned based on principles of comparative fault and foreseeability. Castle Companion, LLC is not liable for intentional misconduct, knowing violations of law by the user, or user actions that override or disregard the Service's recommendations.
        </p>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          To maintain transparency, the Service incorporates periodic notifications and UI badges (e.g., <strong className="text-foreground">"AI Help"</strong>) to remind users of the automated nature of the guidance. You acknowledge that these periodic reminders are a core component of our deception prevention protocols.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">5. Plans &amp; Payment</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion offers tiered plans available as digital licenses. All prices are listed in U.S. dollars and are subject to change. Payment is processed at the time of licensing through our PCI DSS-compliant third-party payment processor. By licensing a plan, you authorize us to charge the payment method you provide.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">5.1 Credit Card &amp; Payment Authorization</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          When you provide credit or debit card information, it is transmitted directly to and stored in encrypted form (AES-256) by our third-party payment processor. <strong className="text-foreground">Castle Companion does not store, access, or retain your full card number, CVV, expiration date, or any sensitive cardholder data on our servers, databases, or within the App.</strong> By providing your payment credentials, you authorize us and our payment processor to: (a) charge the applicable plan fees; and (b) use your stored, encrypted payment method on your behalf to secure dining reservations, experience bookings, and other concierge services you request through the Service. You may add, update, or remove your stored payment method at any time through your account settings.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">5.2 Plan Details</h3>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-1">
          <li><strong className="text-foreground">Activation:</strong> Plans are activated on the date of your park visit, as specified during licensing.</li>
          <li><strong className="text-foreground">Group Size:</strong> Each plan supports up to 12 guests. Larger parties may license additional plans.</li>
          <li><strong className="text-foreground">Non-Transferable:</strong> Plans are tied to your account and cannot be transferred or resold.</li>
        </ul>
        <h3 className="font-display text-base text-foreground mt-6">5.3 Digital Goods Licensing (AB 2426)</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          The Intelligent Blueprint and Active Automation are provided as <strong className="text-foreground">revocable digital licenses, not permanent purchases</strong>. Access is subject to technical availability and the operational state of third-party park systems. This license may be modified or revoked if third-party systems undergo material changes that render the current content obsolete. You will be notified of any material changes to your licensed content through the Service.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">6. Refund Policy</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Plans are non-refundable once activated. If your plan has not been activated and your park visit date has not passed, you may request a refund by contacting our support team at <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">support@castlecompanion.com</a> at least 48 hours prior to your visit date. Refund requests are processed within 5–10 business days.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">6.4 Pricing and Platform Convenience Fees (SB 53)</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Pricing for the Service varies by platform. Purchases made via third-party App Stores include a <strong className="text-foreground">"Platform Convenience Fee"</strong> to cover store-mandated transaction costs. <strong className="text-foreground">"Direct-to-Sovereign" discounted rates are available exclusively via our web portal at www.castlecompanion.com.</strong>
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">7. Acceptable Use</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">You agree not to:</p>
        <ul className="font-editorial text-sm text-muted-foreground leading-relaxed list-disc pl-6 space-y-1">
          <li>Use the Service for any unlawful or unauthorized purpose.</li>
          <li>Reverse-engineer, decompile, or disassemble any portion of the App or Service.</li>
          <li>Attempt to gain unauthorized access to our systems, servers, or databases.</li>
          <li>Use automated tools (bots, scrapers, etc.) to access or collect data from the Service.</li>
          <li>Resell, redistribute, or commercially exploit the Service or any data obtained through it.</li>
          <li>Misrepresent your identity or affiliation with any person or entity.</li>
        </ul>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">8. Intellectual Property</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          All content, features, functionality, trademarks, and trade dress of the Service — including but not limited to text, graphics, logos, icons, and software — are the exclusive property of Castle Companion, LLC or its licensors and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the Service without our prior written consent.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">9. Third-Party Services &amp; Data</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          The Service may integrate with or reference data from third-party sources, including theme park wait times, weather services, and mapping providers. We do not guarantee the accuracy, completeness, or timeliness of third-party data. Your use of any third-party service is subject to that service's own terms and privacy policy.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">10. Disclaimer of Warranties</h2>
        <p className="font-editorial text-xs text-muted-foreground leading-relaxed uppercase tracking-wide">
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE MAKE NO REPRESENTATIONS OR GUARANTEES REGARDING RIDE AVAILABILITY, WAIT-TIME ACCURACY, PARK OPERATING HOURS, DINING AVAILABILITY, OR ANY OTHER THEME PARK CONDITIONS.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">11. Limitation of Liability</h2>
        <p className="font-editorial text-xs text-muted-foreground leading-relaxed uppercase tracking-wide">
          TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CASTLE COMPANION, LLC AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, CONTRACTORS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES — INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, USE, OR OTHER INTANGIBLE LOSSES — ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE LESSER OF (A) THE AMOUNT YOU PAID IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100.00).
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">12. Assumption of Risk</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          You acknowledge and agree that visiting theme parks involves inherent risks. Castle Companion provides planning and informational guidance only and is <strong className="text-foreground">not responsible for your safety, physical well-being, or any personal injury, property damage, or loss</strong> that may occur during your visit. You assume all risk associated with your use of the Service and your attendance at any theme park, dining venue, or event.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">12.1 Corporate Identity</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          This Agreement is solely between the user and Castle Companion, LLC, a California limited liability company. Castle Companion, LLC is a wholly-owned subsidiary of Ennov8 Enterprises, LLC. All services are provided by Castle Companion, LLC, though certain technical development is performed by its parent under an Intercompany Services Agreement. Any legal claim arising from the Service is limited to the assets of Castle Companion, LLC and shall not extend to its parent entity or individual officers, except as required by applicable law.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">13. No Responsibility for Theme Park Operations</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion has no control over and assumes no responsibility for the policies, practices, operations, pricing, or conditions of any theme park, restaurant, hotel, or third-party venue. This includes ride closures, schedule changes, capacity restrictions, ticket pricing, park entry requirements, weather-related closures, health and safety protocols, food quality or allergen management, and any actions or omissions by park employees or agents.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">14. Indemnification</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          You agree to indemnify, defend, and hold harmless Castle Companion, LLC, its affiliates, and their respective officers, directors, employees, agents, contractors, licensors, and successors from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law; (d) your violation of any rights of a third party; or (e) any content you submit through the Service.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">14.3 AI Transparency (AB 2013)</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Pursuant to CA AB 2013, we disclose that our "Quiet Companion" ecosystem utilizes third-party large language models grounded in proprietary RAG databases. <strong className="text-foreground">Your data is used for real-time inference only and is not utilized by Castle Companion, LLC or its third-party providers for model training or improvement.</strong>
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">15. Privacy</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Your use of the Service is also governed by our <Link to="/privacy" className="text-[hsl(var(--lavender))] hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information, including credit card data and mobile phone numbers.
        </p>
        <h3 className="font-display text-base text-foreground mt-6">15.1 Precise Geolocation Data</h3>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Use of Active Automation requires the collection of <strong className="text-foreground">Precise Geolocation Data</strong>. This data is classified as Sensitive Personal Information (SPI) and is used exclusively for real-time park logistics. Precise Geolocation Data is deleted or anonymized within 24 hours of your park visit. You may limit our use of SPI through your device settings or via the <Link to="/privacy-ca" className="text-[hsl(var(--lavender))] hover:underline">California Privacy Notice</Link>.
        </p>
      </section>

      {/* SMS / Text Message Terms — Twilio Toll-Free Compliance */}
      <section id="sms" className="mb-12 rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg">📱</span>
          <h2 className="font-display text-xl text-foreground">16. SMS / Text Message Terms</h2>
        </div>
        <div className="space-y-4">
          <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
            By providing your mobile number and opting in, you consent to receive recurring automated marketing and concierge alerts from Castle Companion, LLC. Consent is not a condition of purchase. Msg &amp; data rates may apply. Reply STOP to unsubscribe at any time. Reply HELP for help. Message frequency varies; during an active park day you may receive up to 15 messages.
          </p>
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">✅</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Consent:</strong> By opting in to SMS notifications, you expressly consent to receive automated and non-automated text messages at the mobile phone number you provide. Consent is not a condition of purchase.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">🚫</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Opt-Out:</strong> You may opt out at any time by replying STOP to any message, adjusting your preferences in your account settings, or contacting us at <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">support@castlecompanion.com</a>. You will receive a single confirmation message upon opting out.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">📩</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Message Frequency:</strong> Message frequency varies. During an active park day, you may receive up to 15 messages.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">💰</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Rates:</strong> Standard message and data rates imposed by your wireless carrier may apply. Castle Companion is not responsible for any such charges.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">⚖️</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">No Liability:</strong> We and any participating wireless carriers shall not be liable for any delays or failures in the delivery of any SMS messages.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">❓</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Help:</strong> For assistance, reply HELP to any message or contact <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">support@castlecompanion.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">17. Force Majeure</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion shall not be liable for any failure or delay in performing its obligations where such failure or delay results from circumstances beyond our reasonable control, including acts of God, natural disasters, pandemics, government orders, civil unrest, war, terrorism, power outages, internet or telecommunications failures, theme park closures, or cyberattacks.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">18. Class Action Waiver</h2>
        <p className="font-editorial text-xs text-muted-foreground leading-relaxed uppercase tracking-wide">
          TO THE FULLEST EXTENT PERMITTED BY LAW, YOU AND CASTLE COMPANION AGREE THAT ANY DISPUTES SHALL BE RESOLVED ON AN INDIVIDUAL BASIS AND NOT AS PART OF ANY CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU HEREBY WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST CASTLE COMPANION, LLC.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">19. Termination</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Sections that by their nature should survive termination shall survive.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">20. Governing Law &amp; Dispute Resolution</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the <strong className="text-foreground">State of California</strong>, without regard to its conflict-of-law principles. Any disputes arising under these Terms shall be resolved through binding arbitration administered by the American Arbitration Association in <strong className="text-foreground">Los Angeles County, California</strong>. The prevailing party shall be entitled to recover its reasonable attorneys' fees and costs.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">21. Severability</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          If any provision of these Terms is held to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">22. Entire Agreement</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          These Terms, together with the Privacy Policy and any other legal notices published by Castle Companion on the Service, constitute the entire agreement between you and Castle Companion, LLC with respect to your use of the Service, and supersede all prior or contemporaneous communications and understandings, whether oral or written.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">23. Changes to These Terms</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We may revise these Terms from time to time. The most current version will always be available within the App and on our website. If a revision is material, we will provide notice through the Service prior to the change taking effect.
        </p>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="font-display text-xl text-foreground">24. Contact Us</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          If you have any questions about these Terms, please reach out to us:
        </p>
        <div className="font-editorial text-sm text-muted-foreground leading-relaxed">
          <p>Castle Companion, LLC</p>
          <p>3400 Cottage Way, Ste G2 #34293</p>
          <p>Sacramento, CA 95825</p>
          <p className="mt-2">
            <a href="mailto:legal@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">legal@castlecompanion.com</a>
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Terms;
