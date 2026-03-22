import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SovereignBridge from "./SovereignBridge";
import SparkleField from "@/components/SparkleField";
import headerMemories from "@/assets/header-memories.jpg";

import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface MemoriesHubProps {
  tripMemories: TripMemory[];
  creditsRemaining: number;
  totalCredits: number;
  onSelectTrip: (tripId: string) => void;
}

/**
 * Memories Hub — the "cover page" portfolio of all trips.
 * Shows consent gate on first visit, then an editorial grid of trip collections.
 */
const MemoriesHub = ({
  tripMemories,
  creditsRemaining,
  totalCredits,
  onSelectTrip,
}: MemoriesHubProps) => {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[25vh] min-h-[160px] overflow-hidden">
        <img src={headerMemories} alt="Memories" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={6} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
            className="label-text !text-white/60 mb-2 tracking-[0.3em]"
          >
            Memories ✨
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease }}
            className="font-display text-white text-3xl sm:text-5xl leading-[1.02]"
          >
            Your Adventures.
          </motion.h1>
        </div>
      </section>


      {/* Trip Collection Grid */}
      <section className="py-8 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.2em", fontWeight: 400 }}
          >
            Your Collection
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-12">
            Adventures in Waiting
          </h2>

          {/* Asymmetric editorial grid */}
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 auto-rows-[220px] sm:auto-rows-[280px]">
            {tripMemories.map((memory, i) => {
              const spans = [
                "col-span-4 row-span-2",
                "col-span-2 row-span-1",
                "col-span-2 row-span-1",
                "col-span-3 row-span-1",
                "col-span-3 row-span-1",
                "col-span-6 row-span-1",
              ];
              const span = `col-span-1 sm:${spans[i % spans.length]}`;

              return (
                <motion.div
                  key={memory.tripId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 1, delay: i * 0.08, ease }}
                  className={`${span} relative cursor-pointer group overflow-hidden`}
                  style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                  onClick={() => onSelectTrip(memory.tripId)}
                >
                  {/* Image */}
                  <img
                    src={memory.coverImage}
                    alt={memory.tripName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Digital Vellum overlay */}
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
                  {/* Desaturation filter */}
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
                    <div className="flex items-center gap-3 mt-2">
                      <p
                        className="text-white/40"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
                      >
                        {memory.photoCount} photos
                      </p>
                      <span className="flex items-center gap-1 text-white/30 group-hover:text-[#C8A84E]/70 transition-colors duration-500">
                        <span
                          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                        >
                          Explore
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
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

      {/* Sovereign Bridge — appears at hub level when credits exhausted */}
      <SovereignBridge creditsRemaining={creditsRemaining} totalCredits={totalCredits} />
    </>
  );
};

export default MemoriesHub;
