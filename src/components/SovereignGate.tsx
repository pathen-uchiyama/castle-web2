import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/* ── Mock tier state — flip to true to unlock everything ─────── */
export const isPaidUser = false;

export type GatedTier = "Pixie Dust" | "Glass Slipper";

interface SovereignGateProps {
  children: ReactNode;
  tier?: GatedTier;
  feature: string;
  description: string;
  /** If true, the gate is active (user is free tier). Defaults to !isPaidUser */
  locked?: boolean;
}

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

/**
 * Wraps any feature element. Free-tier users see the content rendered
 * underneath a frosted-glass overlay on click — they can see what they're
 * missing, but tapping the interactive area triggers the gateway.
 */
const SovereignGate = ({
  children,
  tier = "Pixie Dust",
  feature,
  description,
  locked = !isPaidUser,
}: SovereignGateProps) => {
  const [showGateway, setShowGateway] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Content is visible but non-interactive */}
      <div
        className="pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Invisible click interceptor */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => setShowGateway(true)}
      />

      {/* Gateway overlay */}
      <AnimatePresence>
        {showGateway && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="absolute inset-0 z-20 flex items-center justify-center p-6"
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(200, 169, 81, 0.3)",
              borderRadius: "0.75rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              {/* Icon */}
              <div className="relative w-14 h-14 rounded-2xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20 flex items-center justify-center mb-5">
                <Lock className="w-5 h-5 text-[hsl(var(--gold-dark))]" />
                <Sparkles className="w-3 h-3 text-[hsl(var(--gold))] absolute -top-1 -right-1" />
              </div>

              {/* Headline */}
              <h3 className="font-display text-xl text-[hsl(var(--ink))] font-bold leading-tight mb-2">
                This is a {tier} feature
              </h3>

              {/* Description */}
              <p
                className="text-sm text-[hsl(var(--ink-light))] leading-relaxed mb-6 max-w-xs"
                style={{ fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.02em" }}
              >
                {description}
              </p>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`[SovereignGate] Upgrade clicked for: ${feature} (${tier})`);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display text-sm font-medium text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                  boxShadow: "0 4px 16px hsla(42, 64%, 35%, 0.25)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Unlock with {tier}
              </button>

              {/* Secondary link */}
              <Link
                to="/onboarding"
                onClick={(e) => e.stopPropagation()}
                className="mt-3 inline-flex items-center gap-1 text-[0.6875rem] text-[hsl(var(--gold-dark))] hover:text-[hsl(var(--ink))] transition-colors font-medium"
                style={{ letterSpacing: "0.02em" }}
              >
                See all plans <ArrowRight className="w-3 h-3" />
              </Link>

              {/* Dismiss */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowGateway(false); }}
                className="mt-4 text-[0.625rem] text-[hsl(var(--ink-light))]/40 hover:text-[hsl(var(--ink-light))] transition-colors uppercase tracking-[0.12em]"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SovereignGate;
