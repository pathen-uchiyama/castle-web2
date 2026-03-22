import { motion } from "framer-motion";
import { useState } from "react";
import type { TripMemory } from "@/data/types";
import SovereignGate from "@/components/SovereignGate";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface GhostVaultProps {
  tripMemories: TripMemory[];
  onSelectMemory: (tripId: string) => void;
}

/**
 * Asymmetric editorial gallery with "Digital Vellum" overlay.
 * Images are slightly desaturated with a grain texture (Ghost state).
 * On hover the vellum fades to reveal true color (Awakening).
 */
const GhostVault = ({ tripMemories, onSelectMemory }: GhostVaultProps) => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <p
          className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.2em", fontWeight: 400 }}
        >
          The Ghost Vault
        </p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-12">
          Memories in Waiting
        </h2>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-6 gap-3 auto-rows-[220px] sm:auto-rows-[280px]">
          {tripMemories.map((memory, i) => {
            // Asymmetric spans for editorial feel
            const spans = [
              "col-span-4 row-span-2",
              "col-span-2 row-span-1",
              "col-span-2 row-span-1",
              "col-span-3 row-span-1",
              "col-span-3 row-span-1",
              "col-span-6 row-span-1",
            ];
            const span = spans[i % spans.length];

            return (
              <motion.div
                key={memory.tripId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1, delay: i * 0.08, ease }}
                className={`${span} relative cursor-pointer group overflow-hidden`}
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                onClick={() => onSelectMemory(memory.tripId)}
              >
                {/* Image */}
                <img
                  src={memory.coverImage}
                  alt={memory.tripName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />

                {/* Digital Vellum overlay — desaturation + grain */}
                <div
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(249,247,242,0.15) 0%, rgba(249,247,242,0.25) 100%)",
                    mixBlendMode: "saturation",
                  }}
                />
                {/* Grain texture */}
                <div
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"
                  style={{
                    opacity: 0.03,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: "128px 128px",
                  }}
                />
                {/* Desaturation filter layer */}
                <div
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0 pointer-events-none"
                  style={{
                    backgroundColor: "rgba(249,247,242,0.12)",
                    backdropFilter: "saturate(0.55)",
                  }}
                />

                {/* Gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p
                    className="mb-1 uppercase tracking-[0.15em] text-white/50"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "-0.02em" }}
                  >
                    {memory.date} · {memory.destination}
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl text-white leading-tight group-hover:text-[#C8A84E] transition-colors duration-500">
                    {memory.tripName}
                  </h3>
                  <p
                    className="text-white/40 mt-1"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
                  >
                    {memory.photoCount} photos
                  </p>
                </div>

                {/* Ghost badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="px-2 py-1 text-white/40 border border-white/10 bg-black/20 backdrop-blur-sm"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
                  >
                    Ghost
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GhostVault;
