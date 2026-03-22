import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Clock, TrendingUp, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

/* ── Drill-down mock data ── */
const joyMoments = [
  { time: "8:15 AM", emoji: "😊", description: "First glimpse of Cinderella Castle from Main Street", joy: 9.8 },
  { time: "10:42 AM", emoji: "😂", description: "Jack's terrified-then-thrilled face on Space Mountain", joy: 9.5 },
  { time: "2:30 PM", emoji: "🥲", description: "Emma's quiet 'I love you' during the Carousel of Progress", joy: 9.2 },
  { time: "9:00 PM", emoji: "😊", description: "Entire family singing along to Happily Ever After", joy: 9.7 },
];

const joySparkline = [7.2, 8.1, 9.8, 8.5, 7.9, 9.5, 8.0, 7.5, 8.8, 9.2, 8.3, 9.7];

const efficiencyBars = [
  { hour: "8–9", rides: 3, avg: 1.5 },
  { hour: "9–10", rides: 2, avg: 1.8 },
  { hour: "10–11", rides: 2, avg: 1.2 },
  { hour: "11–12", rides: 1, avg: 0.8 },
  { hour: "12–1", rides: 0, avg: 0.5 },
  { hour: "1–2", rides: 2, avg: 1.0 },
  { hour: "2–3", rides: 2, avg: 1.2 },
  { hour: "3–4", rides: 1, avg: 0.9 },
  { hour: "4–5", rides: 0, avg: 0.6 },
  { hour: "5–6", rides: 2, avg: 1.1 },
  { hour: "6–7", rides: 3, avg: 1.4 },
  { hour: "7–8", rides: 2, avg: 1.0 },
  { hour: "8–9p", rides: 1, avg: 0.7 },
];

const memoryTimeline = [
  { time: "8:12 AM", type: "📸", label: "Photo", title: "Castle arrival selfie", thumb: "🏰" },
  { time: "8:15 AM", type: "🎤", label: "Voice Memo", title: "First gasp at the castle", thumb: "🎙️" },
  { time: "9:30 AM", type: "📝", label: "Ghost Note", title: "Jack wants to ride Space Mountain first", thumb: "✍️" },
  { time: "10:42 AM", type: "📸", label: "Photo", title: "Post-Space Mountain celebration", thumb: "🎢" },
  { time: "11:15 AM", type: "🎤", label: "Voice Memo", title: "Emma's Fantasyland review", thumb: "🎙️" },
  { time: "12:30 PM", type: "📸", label: "Photo", title: "Dole Whip group shot", thumb: "🍦" },
  { time: "1:45 PM", type: "📝", label: "Ghost Note", title: "Need to rest — kids getting tired", thumb: "✍️" },
  { time: "3:00 PM", type: "📸", label: "Photo", title: "Pirates queue details", thumb: "🏴‍☠️" },
  { time: "5:20 PM", type: "📸", label: "Photo", title: "Golden hour on Main Street", thumb: "🌅" },
  { time: "7:00 PM", type: "🎤", label: "Voice Memo", title: "Pre-fireworks excitement", thumb: "🎙️" },
  { time: "9:05 PM", type: "📸", label: "Photo", title: "Fireworks finale", thumb: "🎆" },
  { time: "9:48 PM", type: "🎤", label: "Voice Memo", title: "Post-fireworks family debrief", thumb: "🎙️" },
];

type MetricId = "joy" | "efficiency" | "memory";

/* ── Mini Sparkline SVG ── */
const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 300;
  const h = 48;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * (h - 8) - 4} r="3" fill="hsl(var(--gold))" />
      ))}
    </svg>
  );
};

interface JoyBlueprintProps {
  tripMemories: TripMemory[];
}

const JoyBlueprint = ({ tripMemories }: JoyBlueprintProps) => {
  const totalPhotos = tripMemories.reduce((sum, m) => sum + m.photoCount, 0);
  const [expanded, setExpanded] = useState<MetricId | null>(null);

  const toggle = (id: MetricId) => setExpanded((prev) => (prev === id ? null : id));

  const metrics = [
    { id: "joy" as MetricId, icon: <TrendingUp className="w-5 h-5 text-[hsl(var(--gold-dark))]" />, label: "Joy Index", value: "8.7 / 10", sub: "family average" },
    { id: "efficiency" as MetricId, icon: <Zap className="w-5 h-5 text-[hsl(var(--gold-dark))]" />, label: "Efficiency Score", value: "92%", sub: "optimal ride routing" },
    { id: "memory" as MetricId, icon: <Clock className="w-5 h-5 text-[hsl(var(--gold-dark))]" />, label: "Memory Density", value: "47", sub: "captured moments" },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-12">
        <motion.div {...fade()}>
          <p className="mb-2 uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}>
            Joy vs. Value Blueprint
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Your Family's Report</h2>
          <p className="text-muted-foreground max-w-xl" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em" }}>
            A birds-eye view of the happiness your adventures have created — time saved, smiles earned, and memories made. Tap any metric to drill down.
          </p>
        </motion.div>

        {/* ── INTERACTIVE METRIC CARDS ── */}
        <motion.div {...fade(0.05)}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics.map((stat) => (
              <div key={stat.id}>
                <button
                  onClick={() => toggle(stat.id)}
                  className={cn(
                    "w-full text-left bg-card border p-6 transition-all duration-300 cursor-pointer group rounded-lg",
                    expanded === stat.id
                      ? "border-[hsl(var(--gold))] shadow-[var(--shadow-hover)]"
                      : "border-border shadow-[var(--shadow-soft)] hover:border-[hsl(var(--gold))]/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    {stat.icon}
                    <motion.div animate={{ rotate: expanded === stat.id ? 180 : 0 }} transition={{ duration: 0.3, ease }}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors" />
                    </motion.div>
                  </div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
                    {stat.label}
                  </p>
                  <p className="font-display text-3xl text-foreground mb-1">{stat.value}</p>
                  <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "-0.02em" }}>
                    {stat.sub}
                  </p>
                </button>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {expanded === stat.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                        {stat.id === "joy" && <JoyDrillDown />}
                        {stat.id === "efficiency" && <EfficiencyDrillDown />}
                        {stat.id === "memory" && <MemoryDrillDown />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── JOY HEATMAP ── */}
        <motion.div {...fade(0.1)}>
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-[var(--shadow-soft)]">
            <p className="font-display text-lg text-foreground mb-1">Sentiment Timeline</p>
            <p className="text-muted-foreground mb-8" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em" }}>
              How your family felt each day — mapped in Royal Thistle.
            </p>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {tripTimeline.map((day, i) => (
                <motion.div key={day.day} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08, ease }} className="shrink-0 w-[120px] sm:w-[140px] text-center">
                  <div className="border border-border rounded-lg p-4 mb-2" style={{ backgroundColor: `hsl(var(--gold) / ${day.score / 500})` }}>
                    <span className="text-3xl block mb-2">{day.emoji}</span>
                    <p className="font-display text-sm text-foreground mb-0.5">{day.label}</p>
                    <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>{day.day}</p>
                  </div>
                  <p className="text-muted-foreground leading-snug px-1" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}>{day.highlight}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>Overall Trip Joy</p>
                <p className="font-display text-sm text-foreground">83.2 / 100</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "83.2%" }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.3, ease }} className="h-full rounded-full bg-[hsl(var(--gold))]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── HIGHLIGHT REEL ── */}
        <motion.div {...fade(0.15)}>
          <p className="mb-2 uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}>Highlight Reel</p>
          <p className="text-muted-foreground mb-6 max-w-lg" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em" }}>
            AI-curated moments from your audio echoes, photos, and trip data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiHighlights.map((item, i) => (
              <motion.div key={item.title} {...fade(0.2 + i * 0.05)} className="bg-card border border-border rounded-lg p-5 group shadow-[var(--shadow-soft)]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <h4 className="font-display text-base text-foreground mb-1 group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{item.title}</h4>
                    <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}>{item.note}</p>
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
              <div key={stat.label} className="bg-card border border-border rounded-lg p-5 shadow-[var(--shadow-soft)]">
                <span className="text-xl mb-2 block">{stat.icon}</span>
                <p className="text-muted-foreground mb-1 uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>{stat.label}</p>
                <p className="font-display text-2xl text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══ JOY DRILL-DOWN ═══ */
const JoyDrillDown = () => (
  <div>
    <p className="font-display text-sm text-foreground mb-4">Your highest joy moments:</p>
    <div className="space-y-2 mb-5">
      {joyMoments.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease }}
          className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--warm))] border border-border/50"
        >
          <span className="text-xl shrink-0">{m.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-editorial text-sm text-foreground leading-snug">{m.description}</p>
            <p className="text-muted-foreground mt-0.5" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>
              {m.time} · Joy Score: {m.joy}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
    <p className="text-muted-foreground mb-2 uppercase tracking-[0.12em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
      Joy across the day
    </p>
    <Sparkline data={joySparkline} />
    <div className="flex justify-between mt-1">
      <span className="text-muted-foreground" style={{ fontSize: "0.5rem" }}>8 AM</span>
      <span className="text-muted-foreground" style={{ fontSize: "0.5rem" }}>9 PM</span>
    </div>
  </div>
);

/* ═══ EFFICIENCY DRILL-DOWN ═══ */
const EfficiencyDrillDown = () => {
  const maxRides = Math.max(...efficiencyBars.map((b) => Math.max(b.rides, b.avg)));
  return (
    <div>
      <p className="font-display text-sm text-foreground mb-1">Rides completed vs. time spent</p>
      <p className="text-muted-foreground mb-4" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem" }}>
        Your family vs. average family at Magic Kingdom
      </p>
      <div className="space-y-1.5">
        {efficiencyBars.map((b, i) => (
          <motion.div
            key={b.hour}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="flex items-center gap-3"
          >
            <span className="w-12 text-right text-muted-foreground shrink-0" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>
              {b.hour}
            </span>
            <div className="flex-1 flex gap-1 items-end h-5">
              {/* Your family */}
              <div className="h-full flex items-end flex-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.rides / maxRides) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.03, ease }}
                  className="h-3 rounded-sm bg-[hsl(var(--gold))]"
                  style={{ minWidth: b.rides > 0 ? 4 : 0 }}
                />
              </div>
              {/* Average */}
              <div className="h-full flex items-end flex-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.avg / maxRides) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.03 + 0.1, ease }}
                  className="h-3 rounded-sm bg-border"
                  style={{ minWidth: b.avg > 0 ? 4 : 0 }}
                />
              </div>
            </div>
            <span className="w-6 text-foreground font-display text-xs text-right">{b.rides}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-6 mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[hsl(var(--gold))]" />
          <span className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>Your family</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-border" />
          <span className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>Park average</span>
        </div>
      </div>
    </div>
  );
};

/* ═══ MEMORY DENSITY DRILL-DOWN ═══ */
const MemoryDrillDown = () => (
  <div>
    <p className="font-display text-sm text-foreground mb-1">Every captured moment</p>
    <p className="text-muted-foreground mb-4" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem" }}>
      47 moments across photos, voice memos, and ghost notes
    </p>
    <div className="relative pl-6 border-l-2 border-[hsl(var(--gold)/0.2)] space-y-2">
      {memoryTimeline.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03, ease }}
          className="relative flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--warm))] border border-border/50"
        >
          {/* Timeline dot */}
          <div className="absolute -left-[1.9rem] w-3 h-3 rounded-full border-2 border-[hsl(var(--gold))] bg-card" />
          <span className="text-lg shrink-0">{m.thumb}</span>
          <div className="flex-1 min-w-0">
            <p className="font-editorial text-sm text-foreground truncate">{m.title}</p>
            <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
              {m.time} · {m.label}
            </p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{m.type}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

export default JoyBlueprint;
