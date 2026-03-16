import { motion } from "framer-motion";
import { useState } from "react";
import { Lock } from "lucide-react";
import FloatingAnchor from "@/components/FloatingAnchor";
import Footer from "@/components/Footer";
import TripWizard from "@/components/TripWizard";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

const teaserCards = [
  {
    label: "The Blueprint",
    description: "A strategic master plan tailored to your family's pace.",
    icon: "📐",
  },
  {
    label: "The Magic Window",
    description: "Predictive crowd modeling for effortless entry.",
    icon: "🔮",
  },
  {
    label: "The Keepsake",
    description: "A digital gallery of the moments that last forever.",
    icon: "📷",
  },
];

const DayZeroIndex = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "hsl(30, 33%, 96%)" }}>

      {/* ═══ HERO — "The Blank Page" ═══ */}
      <header className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.4, ease }}
          className="text-center max-w-3xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="label-text mb-8 tracking-[0.35em]"
            style={{ color: "hsl(222, 20%, 45%)" }}
          >
            Castle Companion
          </motion.p>

          <h1
            className="leading-[0.95] mb-8"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "hsl(222, 47%, 21%)",
              fontSize: "clamp(3rem, 8vw, 7rem)",
            }}
          >
            Your Story<br />
            <em style={{ fontWeight: 400, fontStyle: "italic" }}>Awaits.</em>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2, ease }}
            className="mx-auto w-12 h-px origin-center mb-8"
            style={{ background: "hsl(43, 69%, 52%)" }}
          />

          <p
            className="text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-16"
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              color: "hsl(222, 20%, 45%)",
            }}
          >
            Logic over luck begins with a single step. Let us architect your perfect park day.
          </p>

          {/* ═══ PRIMARY CTA — "Sovereign" Button ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6, ease }}
          >
            <button
              onClick={() => setWizardOpen(true)}
              className="group relative inline-flex items-center justify-center px-10 py-4 rounded-lg text-sm tracking-[0.15em] uppercase transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: "hsl(222, 47%, 21%)",
                color: "hsl(30, 33%, 96%)",
                border: "1px solid hsl(43, 65%, 42%)",
                boxShadow: "0 8px 32px -4px hsla(222, 47%, 21%, 0.25), 0 2px 8px -2px hsla(222, 47%, 21%, 0.15)",
                // Focus ring color via CSS custom property
                // @ts-ignore
                "--tw-ring-color": "hsl(280, 30%, 55%)",
                "--tw-ring-offset-color": "hsl(30, 33%, 96%)",
              } as React.CSSProperties}
            >
              <span className="relative z-10 font-medium" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Initialize Your First Journey
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "hsl(222, 47%, 16%)" }}
              />
            </button>
          </motion.div>
        </motion.div>
      </header>

      {/* ═══ WHIMSICAL TEASERS — Locked editorial cards ═══ */}
      <section className="relative z-10 py-20 sm:py-28 lg:py-36" style={{ background: "hsl(30, 33%, 96%)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <motion.div {...fade()} className="text-center mb-16 sm:mb-20">
            <p
              className="label-text mb-4 tracking-[0.3em]"
              style={{ color: "hsl(222, 20%, 45%)" }}
            >
              What Awaits
            </p>
            <p
              className="text-sm max-w-md mx-auto"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 400,
                color: "hsl(222, 20%, 45%)",
              }}
            >
              Your itinerary is currently a blank scroll. Begin your journey to unlock these chapters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {teaserCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.15 * i, ease }}
                className="relative"
              >
                <div
                  className="relative p-8 sm:p-10 opacity-60 hover:opacity-75 transition-opacity duration-700"
                  style={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(0, 0%, 90%)",
                    boxShadow: "0 8px 32px -4px hsla(222, 47%, 21%, 0.06)",
                  }}
                >
                  {/* Lock badge */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5">
                    <Lock size={11} style={{ color: "hsl(222, 20%, 45%, 0.4)" }} />
                    <span
                      className="uppercase tracking-[0.2em]"
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "0.55rem",
                        color: "hsl(222, 20%, 45%, 0.4)",
                      }}
                    >
                      Locked
                    </span>
                  </div>

                  <span className="text-2xl mb-6 block opacity-40">{card.icon}</span>

                  <p
                    className="mb-3 uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: "0.6875rem",
                      fontWeight: 400,
                      color: "hsl(222, 47%, 21%, 0.7)",
                    }}
                  >
                    {card.label}
                  </p>

                  <div className="w-12 h-px mb-4" style={{ background: "hsl(43, 69%, 52%)" }} />

                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontWeight: 400,
                      color: "hsl(222, 20%, 45%)",
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <FloatingAnchor waiting />

      {/* ═══ TRIP WIZARD — Full-screen concierge ═══ */}
      <TripWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default DayZeroIndex;
