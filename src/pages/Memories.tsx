import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import CaptureConsentToggle from "@/components/CaptureConsentToggle";
import KeepsakeNudge from "@/components/KeepsakeNudge";
import JoyValueReport from "@/components/JoyValueReport";
import CircleManager from "@/components/CircleManager";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const tabs = [
  { id: "gallery", label: "The Gallery" },
  { id: "recap", label: "Joy Report" },
  { id: "sharing", label: "Keepsake Circle" },
  { id: "capture", label: "Capture" },
];

const Memories = ({ tripMemories }: MemoriesProps) => {
  const [activeTab, setActiveTab] = useState("gallery");
  const [captureConsented, setCaptureConsented] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Show the nudge demo when capture is consented (after a short delay)
  const handleConsent = (agreed: boolean) => {
    setCaptureConsented(agreed);
    if (agreed && !nudgeDismissed) {
      setTimeout(() => setShowNudge(true), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <motion.div {...fade()}>
          <p className="label-text mb-6 tracking-[0.3em]">Memories 📸</p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
            Moments worth keeping.
          </h1>
          <p className="font-editorial text-lg text-muted-foreground max-w-lg">
            Every trip leaves behind a constellation of memories — relive the laughter, the fireworks, and the ice cream faces. ✨
          </p>
        </motion.div>
      </section>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-background px-4 sm:px-8 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto">
          <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ═══ THE GALLERY TAB ═══ */}
      {activeTab === "gallery" && (
        <>
          {/* Vertical timeline */}
          <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 lg:py-24">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-20">
                {tripMemories.map((memory, i) => (
                  <motion.div key={memory.tripId} {...fade(i * 0.1)} className="relative pl-12 sm:pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 sm:left-6.5 top-2 w-3 h-3 rounded-full bg-[hsl(var(--gold))] border-2 border-background" />

                    {/* Date label */}
                    <p className="label-text mb-4" style={{ fontSize: "0.625rem" }}>{memory.date}</p>

                    {/* Memory card */}
                    <Link to={`/memories/${memory.tripId}`} className="group block">
                      <div className="relative overflow-hidden rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                        <div className="relative h-[280px] sm:h-[360px]">
                          <img
                            src={memory.coverImage}
                            alt={memory.tripName}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="font-display text-2xl text-white mb-1 group-hover:text-[hsl(var(--gold-light))] transition-colors duration-500">
                            {memory.tripName}
                          </h3>
                          <p className="font-editorial text-sm text-white/60">
                            {memory.photoCount} photos · {memory.destination}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Highlights */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {memory.highlights.map((h, hi) => {
                        const colors = [
                          "bg-[hsl(var(--coral)/0.08)] text-[hsl(var(--coral))] border-[hsl(var(--coral)/0.2)]",
                          "bg-[hsl(var(--sky)/0.08)] text-[hsl(var(--sky))] border-[hsl(var(--sky)/0.2)]",
                          "bg-[hsl(var(--mint)/0.08)] text-[hsl(var(--mint))] border-[hsl(var(--mint)/0.2)]",
                          "bg-[hsl(var(--lavender)/0.08)] text-[hsl(var(--lavender))] border-[hsl(var(--lavender)/0.2)]",
                          "bg-[hsl(var(--sunshine)/0.1)] text-[hsl(var(--gold-dark))] border-[hsl(var(--sunshine)/0.25)]",
                        ];
                        return (
                          <span key={h} className={`text-[0.625rem] uppercase tracking-[0.15em] px-3 py-1 rounded-md border ${colors[hi % colors.length]}`}>
                            {h}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ JOY REPORT TAB ═══ */}
      {activeTab === "recap" && (
        <section className="px-4 sm:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Joy & Value Report 💛</p>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Your Family's Joy Report</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-xl mb-16">
                A birds-eye view of the happiness your adventures have created — time saved, smiles earned, and memories made.
              </p>
            </motion.div>

            <JoyValueReport tripMemories={tripMemories} />
          </div>
        </section>
      )}

      {/* ═══ KEEPSAKE CIRCLE TAB ═══ */}
      {activeTab === "sharing" && (
        <section className="px-4 sm:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fade()} className="mb-12">
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
                Share the Magic
              </h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-xl">
                Send "Guest Viewer" links to family and friends so they can relive your trip highlights — privately and beautifully. 🎁
              </p>
            </motion.div>

            <CircleManager />
          </div>
        </section>
      )}

      {/* ═══ CAPTURE TAB ═══ */}
      {activeTab === "capture" && (
        <section className="px-4 sm:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fade()} className="mb-12">
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
                Memory Capture
              </h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-xl">
                Discretely capture audio notes and photos during your trip — your personal keepsake journal, powered by AI. 🎙️
              </p>
            </motion.div>

            {/* Consent toggle */}
            <CaptureConsentToggle onConsent={handleConsent} isAgreed={captureConsented} />

            {/* Demo preview of capture features */}
            {captureConsented && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease }}
                className="mt-8 space-y-6"
              >
                <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
                  <p className="font-display text-lg text-foreground mb-2">How It Works ✨</p>
                  <div className="space-y-4 mt-4">
                    {[
                      { step: "1", icon: "📍", title: "Contextual Nudges", desc: "When you're near an attraction or during a wait, you'll get a gentle tap to capture the moment." },
                      { step: "2", icon: "🎙️", title: "One-Tap Capture", desc: "Record a quick audio note or snap a photo — no fumbling with apps. Designed to feel invisible." },
                      { step: "3", icon: "🤖", title: "AI Curation", desc: "After your trip, our AI assembles your captures into a beautiful highlight reel and Joy Report." },
                      { step: "4", icon: "🎁", title: "Share With Family", desc: "Send a Guest Viewer link to grandparents, aunts, uncles — anyone who wants to see the magic." },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--lavender)/0.1)] flex items-center justify-center shrink-0">
                          <span className="text-sm">{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-display text-sm text-foreground mb-0.5">{item.title}</h4>
                          <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo nudge trigger button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowNudge(true); setNudgeDismissed(false); }}
                  className="w-full px-6 py-4 rounded-lg border border-dashed border-[hsl(var(--lavender)/0.3)] bg-[hsl(var(--lavender)/0.04)] text-center hover:border-[hsl(var(--lavender)/0.5)] transition-colors"
                >
                  <p className="font-display text-sm text-foreground mb-1">Preview a Keepsake Nudge 📱</p>
                  <p className="font-editorial text-xs text-muted-foreground">
                    See what a contextual capture prompt looks like during your trip
                  </p>
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>
      )}

      <Footer />

      {/* Keepsake Nudge overlay */}
      {showNudge && (
        <KeepsakeNudge
          trigger="Approaching Space Mountain — 15 min wait"
          onCapture={(type) => {
            console.log("Capture:", type);
            setShowNudge(false);
            setNudgeDismissed(true);
          }}
          onDismiss={() => {
            setShowNudge(false);
            setNudgeDismissed(true);
          }}
        />
      )}
    </div>
  );
};

export default Memories;
