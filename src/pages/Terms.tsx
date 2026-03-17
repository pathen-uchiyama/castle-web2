import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <main className="max-w-3xl mx-auto px-8 pt-32 pb-20">
      <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">Terms of Use</h1>
      <p className="font-editorial text-sm text-muted-foreground mb-12">
        Last updated: March 17, 2026
      </p>

      {/* General Terms */}
      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">1. Agreement to Terms</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          By accessing or using the Castle Companion, LLC ("Castle Companion," "we," "us," or "our") website and mobile application (collectively, the "Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, do not access or use the Service.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">2. Use of the Service</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion provides trip-planning tools, itinerary management, and memory-keeping features for theme park visitors. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">3. Intellectual Property</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          All content, features, and functionality of the Service — including text, graphics, logos, and software — are the property of Castle Companion, LLC and are protected by copyright, trademark, and other intellectual property laws.
        </p>
      </section>

      {/* SMS / Text Messaging — Twilio Toll-Free Compliance */}
      <section className="mb-16 rounded-lg border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg">📱</span>
          <h2 className="font-display text-xl text-foreground">4. SMS / Text Messaging Terms</h2>
        </div>

        <div className="space-y-4">
          <p className="font-editorial text-sm text-foreground leading-relaxed">
            By providing your mobile number and opting in, you consent to receive recurring automated marketing and concierge alerts from Castle Companion, LLC. Consent is not a condition of purchase. Msg &amp; data rates may apply. Reply STOP to unsubscribe at any time.
          </p>

          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">📩</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Message Frequency:</strong> Message frequency varies based on your trip activity and preferences. You may receive up to 10 messages per month.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">💰</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Costs:</strong> Standard message and data rates from your wireless carrier may apply.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">🚫</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Opt-Out:</strong> You may opt out at any time by texting STOP. After opting out, you will receive a confirmation message. You will no longer receive text messages unless you re-subscribe.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">❓</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Help:</strong> For assistance, text HELP or contact us at{" "}
                <a href="mailto:support@castlecompanion.com" className="text-[hsl(var(--lavender))] hover:underline">
                  support@castlecompanion.com
                </a>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm shrink-0">🔒</span>
              <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Privacy:</strong> Your mobile information is handled in accordance with our{" "}
                <Link to="/privacy" className="text-[hsl(var(--lavender))] hover:underline">
                  Privacy Policy
                </Link>. Mobile information will not be shared with third parties for marketing purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">5. Limitation of Liability</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Castle Companion, LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. The Service is provided "as is" without warranties of any kind.
        </p>
      </section>

      <section className="mb-16 space-y-4">
        <h2 className="font-display text-xl text-foreground">6. Contact</h2>
        <p className="font-editorial text-sm text-muted-foreground leading-relaxed">
          Questions about these Terms? Reach out to us at{" "}
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

export default Terms;
