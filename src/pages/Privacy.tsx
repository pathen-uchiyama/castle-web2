import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <main className="max-w-3xl mx-auto px-8 pt-32 pb-20">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">Privacy Policy</h1>
      <p className="font-editorial text-sm text-muted-foreground mb-12">
        Last updated: March 17, 2026
      </p>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">1. Information We Collect</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion, LLC ("Castle Companion," "we," "us," or "our") collects information you provide directly — including your name, email address, mobile phone number, birthdate, and trip preferences — as well as information generated through your use of the Service, such as itinerary data, memory captures, and device identifiers.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">2. How We Use Your Information</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We use collected information to provide, maintain, and improve the Service; personalize your experience; send transactional and marketing communications (including SMS/text messages where you have opted in); and comply with legal obligations.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">3. Sharing of Information</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We do not sell your personal information. We may share data with service providers who assist in operating the Service, or as required by law.
        </p>
      </section>

      {/* Non-negotiable Twilio compliance clause */}
      <section id="mobile-information" className="mb-16 rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg">🔒</span>
          <h2 className="font-display text-xl text-foreground">4. Mobile Information &amp; SMS Data</h2>
        </div>

        <div className="space-y-4">
          <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
            Mobile information will not be shared with third parties/affiliates for marketing or promotional purposes.
          </p>
          <p className="font-editorial text-sm text-foreground leading-relaxed font-medium">
            All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
          </p>
          <p className="font-editorial text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border">
            When you opt in to receive SMS/text messages from Castle Companion, your mobile number and opt-in consent are collected solely for the purpose of delivering the messages you requested. This data is stored securely and is never sold, leased, or shared with any third party for their own marketing purposes. You may revoke consent at any time by texting STOP.
          </p>
        </div>
      </section>

      <section id="cookies" className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">5. Cookies &amp; Tracking</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We use cookies and similar technologies to recognize your browser, remember preferences, and analyze usage patterns. You may disable cookies through your browser settings, though some features may not function properly.
        </p>
      </section>

      <section id="ccpa" className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">6. Your California Privacy Rights (CCPA/CPRA)</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          If you are a California resident, you have the right to know what personal information we collect, request its deletion, and opt out of any sale of personal information. Castle Companion does not sell personal information. To exercise your rights, contact us at{" "}
          <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">
            support@castlecompanion.com
          </a>.
        </p>
      </section>

      <section id="do-not-sell" className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">7. Do Not Sell My Personal Information</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion, LLC does not sell your personal information to third parties. If you wish to make a verifiable consumer request, please contact{" "}
          <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">
            support@castlecompanion.com
          </a>.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">8. Data Retention &amp; Security</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          We retain personal information for as long as your account is active or as needed to provide the Service. We employ industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">9. Contact</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Questions about this Privacy Policy? Contact us at{" "}
          <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">
            support@castlecompanion.com
          </a>{" "}
          or write to Castle Companion, LLC, 3400 Cottage Way, Ste G2 #34293, Sacramento, CA 95825.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default Privacy;
