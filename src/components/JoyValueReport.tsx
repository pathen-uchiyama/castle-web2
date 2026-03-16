import { motion } from "framer-motion";
import { Clock, Smile, Star, TrendingUp, Zap } from "lucide-react";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

// Mock sentiment data for the heatmap
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

interface JoyValueReportProps {
  tripMemories: TripMemory[];
}

const JoyValueReport = ({ tripMemories }: JoyValueReportProps) => {
  const totalPhotos = tripMemories.reduce((sum, m) => sum + m.photoCount, 0);

  return (
    <div className="space-y-12">
      {/* ═══ VALUE GAUGE — Time Saved ═══ */}
      <motion.div {...fade()}>
        <p className="label-text mb-6">Value Gauge ⏱️</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Clock className="w-5 h-5 text-[hsl(var(--sky))]" />,
              label: "Time Saved",
              value: "18h 42m",
              sub: "across all trips",
              color: "sky",
            },
            {
              icon: <Zap className="w-5 h-5 text-[hsl(var(--sunshine))]" />,
              label: "Efficiency Score",
              value: "94%",
              sub: "optimal ride routing",
              color: "sunshine",
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-[hsl(var(--mint))]" />,
              label: "Joy Index",
              value: "8.7/10",
              sub: "family average",
              color: "mint",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3 }}
              className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500"
            >
              <div className={`w-10 h-10 rounded-lg bg-[hsl(var(--${stat.color})/0.1)] flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="label-text mb-1">{stat.label}</p>
              <p className="font-display text-3xl text-foreground mb-1">{stat.value}</p>
              <p className="font-editorial text-xs text-muted-foreground">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ JOY HEATMAP — Sentiment Timeline ═══ */}
      <motion.div {...fade(0.1)}>
        <p className="label-text mb-6">Joy Heatmap 💛</p>
        <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
          <p className="font-display text-lg text-foreground mb-2">Most Recent Trip — Spring Break 2025</p>
          <p className="font-editorial text-sm text-muted-foreground mb-6">
            How your family felt each day, from arrival to that bittersweet goodbye.
          </p>

          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {tripTimeline.map((day, i) => {
              const hue = day.score > 85 ? "mint" : day.score > 70 ? "sky" : day.score > 55 ? "sunshine" : "coral";
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="shrink-0 w-[130px] sm:w-[150px] text-center cursor-pointer"
                >
                  <div className={`rounded-lg border border-[hsl(var(--${hue})/0.2)] bg-[hsl(var(--${hue})/0.06)] p-4 mb-2`}>
                    <span className="text-3xl block mb-2">{day.emoji}</span>
                    <p className="font-display text-sm text-foreground mb-0.5">{day.label}</p>
                    <p className="label-text text-[0.55rem]">{day.day}</p>
                  </div>
                  <p className="font-editorial text-[0.625rem] text-muted-foreground leading-snug px-1">
                    {day.highlight}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Score bar */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="label-text text-[0.55rem]">Overall Trip Joy</p>
              <p className="font-display text-sm text-foreground">83.2 / 100</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "83.2%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3, ease }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--sky)), hsl(var(--mint)), hsl(var(--sunshine)))",
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ HIGHLIGHT REEL — AI-Curated Summaries ═══ */}
      <motion.div {...fade(0.2)}>
        <p className="label-text mb-6">Highlight Reel ✨</p>
        <p className="font-editorial text-sm text-muted-foreground mb-6 max-w-lg">
          AI-curated moments from your audio notes, photos, and trip data — the stories your family will retell for years.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aiHighlights.map((item, i) => (
            <motion.div
              key={item.title}
              {...fade(0.25 + i * 0.06)}
              whileHover={{ y: -3 }}
              className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <div>
                  <h4 className="font-display text-base text-foreground mb-1 group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">
                    {item.title}
                  </h4>
                  <p className="font-editorial text-xs text-muted-foreground leading-relaxed">
                    {item.note}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ TRIP-BY-TRIP STATS ═══ */}
      <motion.div {...fade(0.3)}>
        <p className="label-text mb-6">All Adventures 🗺️</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Adventures", value: String(tripMemories.length), icon: "🏰" },
            { label: "Photos Captured", value: totalPhotos.toLocaleString(), icon: "📸" },
            { label: "Parks Visited", value: "6", icon: "🎢" },
            { label: "Snacks Consumed", value: "47", icon: "🍦" },
          ].map((stat, i) => {
            const colors = ["coral", "sky", "mint", "sunshine"];
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2 }}
                className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]"
              >
                <span className="text-xl mb-2 block">{stat.icon}</span>
                <p className="label-text mb-1">{stat.label}</p>
                <p className={`font-display text-2xl text-foreground`}>{stat.value}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default JoyValueReport;
