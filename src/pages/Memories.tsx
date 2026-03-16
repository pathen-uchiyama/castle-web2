import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.6, delay, ease },
});

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const tabs = [
  { id: "gallery", label: "The Gallery" },
  { id: "recap", label: "Joy Recap" },
];

const Memories = ({ tripMemories }: MemoriesProps) => {
  const [activeTab, setActiveTab] = useState("gallery");
  const totalPhotos = tripMemories.reduce((sum, m) => sum + m.photoCount, 0);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <motion.div {...fade()}>
          <p className="label-text mb-6 tracking-[0.3em]">Memories</p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
            Moments worth keeping.
          </h1>
          <p className="font-editorial text-lg text-muted-foreground max-w-lg">
            Every trip leaves behind a constellation of memories. Yours are here.
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
                    <div className="absolute left-2.5 sm:left-6.5 top-2 w-3 h-3 bg-[hsl(var(--gold))] border-2 border-background" />

                    {/* Date label */}
                    <p className="label-text mb-4" style={{ fontSize: "0.625rem" }}>{memory.date}</p>

                    {/* Memory card */}
                    <Link to={`/memories/${memory.tripId}`} className="group block">
                      <div className="relative overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                        <div className="relative h-[280px] sm:h-[360px]">
                          <img
                            src={memory.coverImage}
                            alt={memory.tripName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
                      {memory.highlights.map((h) => (
                        <span key={h} className="text-[0.625rem] uppercase tracking-[0.15em] px-3 py-1 bg-[hsl(var(--warm))] text-muted-foreground border border-border">
                          {h}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ JOY RECAP TAB ═══ */}
      {activeTab === "recap" && (
        <section className="px-4 sm:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Smiles & Sunshine</p>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Joy Recap</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-xl mb-16">
                A birds-eye view of the happiness your adventures have created — time saved, memories made, miles walked.
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div {...fade(0.1)} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
              {[
                { label: "Total Adventures", value: String(tripMemories.length) },
                { label: "Photos Captured", value: totalPhotos.toLocaleString() },
                { label: "Time Saved", value: "18h 42m" },
                { label: "Parks Visited", value: "6" },
              ].map((stat) => (
                <div key={stat.label} className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">{stat.label}</p>
                  <p className="font-display text-3xl text-foreground">{stat.value}</p>
                </div>
              ))}
            </motion.div>

            {/* Sentiment placeholder */}
            <motion.div {...fade(0.2)} className="mb-16">
              <p className="label-text mb-6">Sentiment Map</p>
               <div className="border border-dashed border-border rounded-lg py-16 text-center">
                <p className="font-display text-2xl text-muted-foreground/40 mb-3">Happiness Timeline</p>
                <p className="font-editorial text-sm text-muted-foreground/30 max-w-md mx-auto">
                  A visual timeline of your family's trip ratings, favorite moments, and most-loved experiences across all adventures.
                </p>
              </div>
            </motion.div>

            {/* Time saved breakdown */}
            <motion.div {...fade(0.3)}>
              <p className="label-text mb-6">Time Saved Breakdown</p>
              <div className="border border-dashed border-border rounded-lg py-16 text-center">
                <p className="font-display text-2xl text-muted-foreground/40 mb-3">Efficiency Metrics</p>
                <p className="font-editorial text-sm text-muted-foreground/30 max-w-md mx-auto">
                  Cumulative wait time saved, Lightning Lane efficiency, and optimal ride sequencing stats will appear here.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Memories;
