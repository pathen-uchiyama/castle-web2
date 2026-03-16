import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface SovereignBridgeProps {
  creditsRemaining: number;
  totalCredits: number;
}

/**
 * "The Sovereign Bridge" — upgrade upsell card.
 * Whispers, doesn't shout. Appears when Legacy user exhausts restoration credits.
 * Deep Obsidian button with Gold text, 44px min height for Churro Test.
 */
const SovereignBridge = ({ creditsRemaining, totalCredits }: SovereignBridgeProps) => {
  if (creditsRemaining > 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-lg mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          className="bg-white border border-border p-8 sm:p-12 text-center"
          style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
        >
          {/* Thin gold rule */}
          <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: "#947120" }} />

          <p
            className="text-muted-foreground mb-4 uppercase tracking-[0.2em]"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
          >
            {totalCredits} of {totalCredits} Signature Restorations Used
          </p>

          <h3 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.12] mb-3">
            The Eternal Library Awaits.
          </h3>

          <p
            className="text-muted-foreground max-w-sm mx-auto mb-8"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}
          >
            Unlock unlimited restorations, priority processing, and permanent archival storage for every memory your family creates.
          </p>

          {/* CTA — Deep Obsidian (#1A1A1B) with Gold text, min 44px height */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-0 text-center transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#1A1A1B",
              color: "#C8A84E",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
              minHeight: 44,
              lineHeight: "44px",
            }}
          >
            Upgrade to Sovereign — $29.95/year
          </motion.button>

          <p
            className="text-muted-foreground mt-6"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
          >
            Cancel anytime. Your memories stay forever.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SovereignBridge;
