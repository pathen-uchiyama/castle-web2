import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, Award } from "lucide-react";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface RestorationViewProps {
  memory: TripMemory;
  onBack: () => void;
}

/**
 * "Ritual of Restoration" detail view.
 * Shows a gold pulse while "hand-polishing", then reveals the master file
 * with an elegant fade-in and golden seal.
 */
const RestorationView = ({ memory, onBack }: RestorationViewProps) => {
  const [phase, setPhase] = useState<"restoring" | "revealed">("restoring");

  useEffect(() => {
    // Simulate restoration time
    const timer = setTimeout(() => setPhase("revealed"), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          onClick={onBack}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Vault
        </motion.button>

        <AnimatePresence mode="wait">
          {phase === "restoring" ? (
            /* ── RESTORATION STATE ── */
            <motion.div
              key="restoring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-32"
            >
              {/* Burnished Gold pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 mb-8 flex items-center justify-center"
                style={{
                  border: "1px solid #947120",
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6"
                  style={{
                    border: "1px solid #947120",
                    borderTopColor: "transparent",
                  }}
                />
              </motion.div>

              <p className="font-display text-lg text-foreground mb-2">
                The Scribe is hand-polishing your memory.
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
              >
                Verifying local mirror checksums…
              </p>
            </motion.div>
          ) : (
            /* ── GOLDEN ARRIVAL ── */
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease }}
            >
              {/* Header */}
              <div className="mb-8">
                <p
                  className="mb-1 text-muted-foreground uppercase tracking-[0.2em]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                >
                  {memory.date} · {memory.destination}
                </p>
                <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08]">
                  {memory.tripName}
                </h2>
              </div>

              {/* Master image with golden seal */}
              <div className="relative overflow-hidden" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
                <motion.img
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease }}
                  src={memory.coverImage}
                  alt={memory.tripName}
                  className="w-full h-[400px] sm:h-[520px] object-cover"
                />

                {/* Golden seal */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease }}
                  className="absolute bottom-5 right-5 w-12 h-12 flex items-center justify-center"
                  style={{
                    backgroundColor: "#947120",
                  }}
                >
                  <Award className="w-5 h-5 text-white" />
                </motion.div>

                {/* Master badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-5 left-5"
                >
                  <span
                    className="px-3 py-1.5 bg-[#947120] text-white"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
                  >
                    Master
                  </span>
                </motion.div>
              </div>

              {/* Highlights */}
              <div className="mt-8 flex flex-wrap gap-2">
                {memory.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 border border-border bg-white text-muted-foreground"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Photos", value: String(memory.photoCount) },
                  { label: "Audio Echoes", value: "4" },
                  { label: "Status", value: "Restored" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white border border-border p-5 text-center"
                    style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                  >
                    <p
                      className="text-muted-foreground mb-1 uppercase tracking-[0.15em]"
                      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                    >
                      {stat.label}
                    </p>
                    <p className="font-display text-2xl text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RestorationView;
