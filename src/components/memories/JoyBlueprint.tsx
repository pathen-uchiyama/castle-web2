import { motion } from "framer-motion";
import { Clock, TrendingUp, Zap } from "lucide-react";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

const tripTimeline = [
  { day: "Day 1", emoji: "😍", label: "Magical", score: 95, highlight: "First time seeing the castle" },
  { day: "Day 2", emoji: "🤩", label: "Amazing", score: 90, highlight: "Rode Space Mountain 3x" },
  { day: "Day 3", emoji: "😊", label: "Great", score: 78, highlight: "Character breakfast with Mickey" },
  { day: "Day 4", emoji: "🥵", label: "Tired but fun", score: 65, highlight: "Hot day, lots of water rides" },
  { day: "Day 5", emoji: "😭", label: "Bittersweet", score: 88, highlight: "Last fireworks show" },
];

const aiHighlights = [
  { icon: "🎢", title: "Thrill Champion", note: "Your family rode 23 attractions — 8 more than the average park-goer." },
  { icon: "🍦", title: "Snack Connoisseur", note: "You discovered 12 unique snacks. The Dole Whip was everyone's favorite." },
  { icon: "📸", title: "Memory Maker", note: "247 photos captured, with the castle sunset as the most-loved shot." },
  { icon: "⚡", title: "Wait-Time Wizard", note: "Saved 4h 35m in queue time by following Castle Companion's routing." },
];

interface JoyBlueprintProps {
  tripMemories: TripMemory[];
}

/**
 * "Joy vs. Value Blueprint" — sharp-edged white cards on parchment.
 * Value Gauge, Joy Heatmap, Highlight Reel, Trip Stats.
 */
const JoyBlueprint = ({ tripMemories }: JoyBlueprintProps) => {
  const totalPhotos = tripMemories.reduce((sum, m) => sum + m.photoCount, 0);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        <motion.div {...fade()}>
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            Joy vs. Value Blueprint
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
            Your Family's Report
          </h2>
          <p
            className="text-muted-foreground max-w-xl"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em" }}
          >
            A birds-eye view of the happiness your adventures have created — time saved, smiles earned, and memories made.
          </p>
        </motion.div>

        {/* ── VALUE GAUGE ── */}
        <motion.div {...fade(0.05)}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <Clock className="w-5 h-5" style={{ color: "#947120" }} />, label: "Hours Saved", value: "18h 42m", sub: "Primary ROI across all trips" },
              { icon: <Zap className="w-5 h-5" style={{ color: "#947120" }} />, label: "Efficiency Score", value: "94%", sub: "optimal ride routing" },
              { icon: <TrendingUp className="w-5 h-5" style={{ color: "#947120" }} />, label: "Joy Index", value: "8.7 / 10", sub: "family average" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-border p-6"
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              >
                <div className="mb-4">{stat.icon}</div>
                <p
                  className="text-muted-foreground mb-1 uppercase tracking-[0.15em]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                >
                  {stat.label}
                </p>
                <p className="font-display text-3xl text-foreground mb-1">{stat.value}</p>
                <p
                  className="text-muted-foreground"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "-0.02em" }}
                >
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── JOY HEATMAP ── */}
        <motion.div {...fade(0.1)}>
          <div
            className="bg-white border border-border p-6 sm:p-8"
            style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
          >
            <p className="font-display text-lg text-foreground mb-1">Sentiment Timeline</p>
            <p
              className="text-muted-foreground mb-8"
              style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em" }}
            >
              How your family felt each day — mapped in Royal Thistle.
            </p>

            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {tripTimeline.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  className="shrink-0 w-[120px] sm:w-[140px] text-center"
                >
                  <div
                    className="border border-border p-4 mb-2"
                    style={{
                      backgroundColor: `rgba(148, 113, 32, ${day.score / 500})`,
                    }}
                  >
                    <span className="text-3xl block mb-2">{day.emoji}</span>
                    <p className="font-display text-sm text-foreground mb-0.5">{day.label}</p>
                    <p
                      className="text-muted-foreground"
                      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
                    >
                      {day.day}
                    </p>
                  </div>
                  <p
                    className="text-muted-foreground leading-snug px-1"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
                  >
                    {day.highlight}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Score bar */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-muted-foreground uppercase tracking-[0.15em]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                >
                  Overall Trip Joy
                </p>
                <p className="font-display text-sm text-foreground">83.2 / 100</p>
              </div>
              <div className="h-2 bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "83.2%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease }}
                  className="h-full"
                  style={{ backgroundColor: "#947120" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── HIGHLIGHT REEL ── */}
        <motion.div {...fade(0.15)}>
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            Highlight Reel
          </p>
          <p
            className="text-muted-foreground mb-6 max-w-lg"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em" }}
          >
            AI-curated moments from your audio echoes, photos, and trip data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiHighlights.map((item, i) => (
              <motion.div
                key={item.title}
                {...fade(0.2 + i * 0.05)}
                className="bg-white border border-border p-5 group"
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-display text-base text-foreground mb-1 group-hover:text-[#947120] transition-colors duration-500">
                      {item.title}
                    </h4>
                    <p
                      className="text-muted-foreground leading-relaxed"
                      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
                    >
                      {item.note}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── ALL ADVENTURES ── */}
        <motion.div {...fade(0.25)}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Adventures", value: String(tripMemories.length), icon: "🏰" },
              { label: "Photos Captured", value: totalPhotos.toLocaleString(), icon: "📸" },
              { label: "Parks Visited", value: "6", icon: "🎢" },
              { label: "Snacks Consumed", value: "47", icon: "🍦" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-border p-5"
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              >
                <span className="text-xl mb-2 block">{stat.icon}</span>
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
      </div>
    </section>
  );
};

export default JoyBlueprint;
