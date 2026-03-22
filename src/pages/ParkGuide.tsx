import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { CalendarIcon, Lock, Crown, ChevronLeft, ChevronRight, Search, AlertTriangle, Construction, Sparkles, Ban, Paintbrush, Wrench, Calendar as CalendarIconLucide } from "lucide-react";
import Footer from "@/components/Footer";
import ParkCategoryBrowser from "@/components/ParkCategoryBrowser";
import SectionNav from "@/components/SectionNav";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ParkGuide, ParkDaySchedule, ParkHours } from "@/data/types";
import { mockData } from "@/data/mockData";
import { wdwParks, type ParkOverview, type ParkAttraction, type AttractionWarning, type ResortRestaurant, wdwRestaurants } from "@/data/resortEncyclopedia";
import { dlrParks, dlrRestaurants } from "@/data/dlrEncyclopedia";
import { wdwEncyclopediaAttractions, dlrEncyclopediaAttractions } from "@/data/encyclopediaAttractions";
import { parkNewsItems, type ParkNewsItem, type ParkNewsCategory } from "@/data/parkNewsData";
import { UtensilsCrossed } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

interface ParkGuidePageProps {
  parkGuides: ParkGuide[];
}

const tabs = [
  { id: "intel", label: "Park Intel" },
  { id: "pulse", label: "The Pulse" },
];

const crowdColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "low": return "hsl(var(--gold))";
    case "moderate": return "hsl(var(--gold-dark))";
    case "high": return "hsl(var(--destructive))";
    default: return "hsl(var(--muted-foreground))";
  }
};

const HoursDisplay = ({ hours, label }: { hours: ParkHours; label?: string }) => (
  <div>
    {label && <p className="label-text mb-3">{label}</p>}
    <div className="space-y-3">
      <div>
        <p className="label-text mb-1">Park Hours</p>
        <p className="font-display text-lg text-foreground">{hours.regular}</p>
      </div>
      {hours.earlyEntry && (
        <div>
          <p className="label-text mb-1">Early Entry</p>
          <p className="font-display text-base text-foreground">{hours.earlyEntry}</p>
          <p className="font-editorial text-xs text-muted-foreground/60 italic mt-0.5">Disney Resort guests</p>
        </div>
      )}
      {hours.extendedEvening && (
        <div>
          <p className="label-text mb-1">Extended Evening</p>
          <p className="font-display text-base text-foreground">{hours.extendedEvening}</p>
          <p className="font-editorial text-xs text-muted-foreground/60 italic mt-0.5">Deluxe Resort guests</p>
        </div>
      )}
    </div>
  </div>
);

const useSubscription = () => {
  const [isPaid, setIsPaid] = useState(false);
  return { isPaid, togglePaid: () => setIsPaid((p) => !p) };
};

const typicalCrowdsByDay: Record<string, { level: string; score: number; tip: string }> = {
  Sunday: { level: "Moderate", score: 5, tip: "Arrives heavy mid-morning, thins after 4 PM." },
  Monday: { level: "Low", score: 3, tip: "One of the quietest days — rope drop is golden." },
  Tuesday: { level: "Low", score: 3, tip: "Great for character meets and walk-on rides." },
  Wednesday: { level: "Moderate", score: 5, tip: "Mid-week bump from resort check-ins." },
  Thursday: { level: "Moderate", score: 6, tip: "Builds toward the weekend; arrive early." },
  Friday: { level: "High", score: 8, tip: "Weekend warriors arrive — use Lightning Lane." },
  Saturday: { level: "High", score: 9, tip: "Peak day. Prioritize rope drop and late evening." },
};

const generateProjections = (baseDate: Date, parkSchedule: ParkDaySchedule[]) => {
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  const days = eachDayOfInterval({ start, end });
  return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const existing = parkSchedule.find((s) => s.date === dateStr);
    if (existing) return { date: day, ...existing };
    const dayName = format(day, "EEEE");
    const typical = typicalCrowdsByDay[dayName];
    const variance = Math.random() > 0.7 ? 1 : 0;
    return {
      date: day,
      crowdLevel: typical.level,
      crowdScore: Math.min(10, Math.max(1, typical.score + variance)),
      weather: "Projected",
      hours: { regular: "9:00 AM – 10:00 PM" } as ParkHours,
    };
  });
};

// ── Warning badge helpers ──
const WARNING_LABELS: Record<AttractionWarning, { label: string; icon: string; color: string }> = {
  "loud-noises": { label: "Loud", icon: "🔊", color: "hsl(var(--destructive))" },
  "strobes": { label: "Strobes", icon: "⚡", color: "hsl(var(--destructive))" },
  "dark-ride": { label: "Dark", icon: "🌑", color: "hsl(var(--muted-foreground))" },
  "sudden-drops": { label: "Drops", icon: "⬇️", color: "hsl(var(--gold-dark))" },
  "spinning": { label: "Spinning", icon: "🌀", color: "hsl(var(--gold-dark))" },
  "motion-sickness": { label: "Motion", icon: "🎬", color: "hsl(var(--gold-dark))" },
  "confined-spaces": { label: "Confined", icon: "📦", color: "hsl(var(--muted-foreground))" },
  "heights": { label: "Heights", icon: "🏔️", color: "hsl(var(--gold-dark))" },
  "water-spray": { label: "Water", icon: "💦", color: "hsl(142, 60%, 38%)" },
  "pyrotechnics": { label: "Pyro", icon: "🔥", color: "hsl(var(--destructive))" },
  "intense-scenes": { label: "Intense", icon: "😱", color: "hsl(var(--destructive))" },
};

const thrillColors: Record<string, string> = {
  gentle: "hsl(142, 60%, 38%)",
  moderate: "hsl(var(--gold-dark))",
  thrilling: "hsl(25, 85%, 50%)",
  intense: "hsl(var(--destructive))",
};

const envLabels: Record<string, string> = {
  indoor: "🏠 Indoor",
  outdoor: "☀️ Outdoor",
  "indoor-outdoor": "🔄 Indoor/Outdoor",
};

const newsIcons: Record<ParkNewsCategory, typeof Wrench> = {
  refurbishment: Wrench,
  "closing-permanently": Ban,
  "re-theming": Paintbrush,
  "opening-soon": Sparkles,
  "under-construction": Construction,
  "seasonal-closure": CalendarIconLucide,
};

const newsColors: Record<ParkNewsCategory, string> = {
  refurbishment: "hsl(var(--gold-dark))",
  "closing-permanently": "hsl(var(--destructive))",
  "re-theming": "hsl(280, 50%, 55%)",
  "opening-soon": "hsl(142, 60%, 38%)",
  "under-construction": "hsl(210, 60%, 50%)",
  "seasonal-closure": "hsl(var(--muted-foreground))",
};

const newsLabels: Record<ParkNewsCategory, string> = {
  refurbishment: "Refurbishment",
  "closing-permanently": "Closing Permanently",
  "re-theming": "Re-Theming",
  "opening-soon": "Opening Soon",
  "under-construction": "Under Construction",
  "seasonal-closure": "Seasonal",
};

// ── Attraction Card Component ──
const AttractionCard = ({ a, compact }: { a: ParkAttraction; compact?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const typeIcons: Record<string, string> = { ride: "🎢", show: "🎭", "meet-and-greet": "✨", experience: "🌟", parade: "🎊", fireworks: "🎆", "play-area": "🎪", "water-ride": "💦" };

  return (
    <motion.div
      layout
      className={cn(
        "border bg-card rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 cursor-pointer group overflow-hidden",
        a.status === "refurbishment" ? "border-[hsl(var(--gold))]/40" :
        a.status === "closing-permanently" ? "border-destructive/30" :
        "border-border"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-lg">{typeIcons[a.type] || "🎢"}</span>
              <h3 className="font-display text-lg text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{a.name}</h3>
              {a.mustDo && <span className="text-[hsl(var(--gold))] text-sm">★</span>}
              {a.status && a.status !== "operating" && (
                <span className="text-xs uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border" style={{ color: newsColors[a.status as ParkNewsCategory] || "hsl(var(--muted-foreground))", borderColor: `${newsColors[a.status as ParkNewsCategory] || "hsl(var(--muted-foreground))"}40` }}>
                  {a.statusNote ? a.statusNote.split("—")[0].trim() : a.status}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{a.land} · {a.duration}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {a.heightRequirement && (
              <span className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.08em] bg-muted text-muted-foreground border border-border">↕ {a.heightRequirement}</span>
            )}
            <span className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.08em] border border-border font-medium" style={{ color: thrillColors[a.thrillLevel] || "hsl(var(--foreground))" }}>
              {a.thrillLevel}
            </span>
            {a.environment && (
              <span className="px-2 py-1 rounded-lg text-xs bg-muted text-muted-foreground border border-border">
                {envLabels[a.environment] || a.environment}
              </span>
            )}
          </div>
        </div>

        {/* Warnings */}
        {a.warnings && a.warnings.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {a.warnings.map((w) => {
              const info = WARNING_LABELS[w];
              return (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                  style={{ color: info.color, borderColor: `${info.color}30`, backgroundColor: `${info.color}08` }}
                >
                  <span className="text-[0.65rem]">{info.icon}</span>
                  {info.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Description */}
        <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-3">{a.description}</p>

        {/* Quick stats row */}
        <div className="flex flex-wrap gap-3 items-end">
          {a.avgWaitMinutes.typical > 0 && (
            <div>
              <p className="text-[0.625rem] uppercase tracking-[0.1em] text-muted-foreground mb-1">Avg Wait</p>
              <div className="flex gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(142,60%,45%,0.1)] text-[hsl(142,60%,35%)] border border-[hsl(142,60%,45%,0.2)]">{a.avgWaitMinutes.low}m</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">{a.avgWaitMinutes.typical}m</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--destructive)/0.08)] text-destructive border border-[hsl(var(--destructive)/0.15)]">{a.avgWaitMinutes.peak}m</span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 items-end">
            {a.lightningLane && (
              <span className="text-xs uppercase tracking-[0.08em] px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)] rounded-lg">
                ⚡ {a.lightningLaneType === "individual" ? "Individual LL" : "Multi Pass"}
              </span>
            )}
            {a.singleRider && <span className="text-xs uppercase tracking-[0.08em] px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-lg">🧍 Single Rider</span>}
            {a.riderSwitch && <span className="text-xs uppercase tracking-[0.08em] px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-lg">👶 Rider Switch</span>}
          </div>
        </div>
      </div>

      {/* Expanded tip */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/50">
              <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
                <p className="font-editorial text-sm text-muted-foreground italic">💡 {a.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── News Card Component ──
const NewsCard = ({ item }: { item: ParkNewsItem }) => {
  const Icon = newsIcons[item.category] || Construction;
  const color = newsColors[item.category];
  return (
    <div className="border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]" style={{ borderColor: `${color}30` }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}12` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-full border" style={{ color, borderColor: `${color}30` }}>
              {newsLabels[item.category]}
            </span>
            {item.dateLabel && (
              <span className="text-xs text-muted-foreground">{item.dateLabel}</span>
            )}
          </div>
          <h4 className="font-display text-base text-foreground mb-1">{item.title}</h4>
          <p className="font-editorial text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      </div>
    </div>
  );
};

// ── Dining Card Component ──
const DiningCard = ({ restaurant: r }: { restaurant: ResortRestaurant }) => {
  const [expanded, setExpanded] = useState(false);
  const serviceIcons: Record<string, string> = {
    "table-service": "🍽️", "quick-service": "🥡", "signature": "✨", "character-dining": "👸",
    "snack": "🍿", "lounge": "🍸", "buffet": "🍛", "dinner-show": "🎭", "food-truck": "🚚",
    "kiosk": "☕", "prix-fixe": "🎩",
  };
  const difficultyColors: Record<string, string> = {
    easy: "hsl(142, 60%, 38%)", moderate: "hsl(var(--gold-dark))", hard: "hsl(25, 85%, 50%)", legendary: "hsl(var(--destructive))",
  };

  return (
    <div
      className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 cursor-pointer group overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-lg">{serviceIcons[r.serviceType] || "🍽️"}</span>
              <h3 className="font-display text-lg text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{r.name}</h3>
              {r.characterDining && <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">👸 Character Dining</span>}
            </div>
            <p className="text-sm text-muted-foreground">{r.locationArea} · {r.cuisine}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span className="px-2 py-1 rounded-lg text-sm font-display text-[hsl(var(--gold-dark))]">{r.priceRange}</span>
            {r.requiresReservation && (
              <span className="px-2 py-1 rounded-lg text-xs uppercase tracking-[0.08em] border border-border font-medium" style={{ color: difficultyColors[r.reservationDifficulty] }}>
                {r.reservationDifficulty}
              </span>
            )}
          </div>
        </div>

        {/* Dietary accommodations */}
        {r.dietaryAccommodations.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {r.dietaryAccommodations.map((d) => (
              <span key={d} className="inline-flex items-center text-xs px-2 py-0.5 rounded-full border border-[hsl(142,60%,45%,0.25)] bg-[hsl(142,60%,45%,0.06)] text-[hsl(142,60%,35%)]">
                🥬 {d}
              </span>
            ))}
          </div>
        )}

        <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-3">{r.description}</p>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">{r.mealPeriods.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(" · ")}</span>
          {r.rating > 0 && (
            <span className="text-xs text-[hsl(var(--gold-dark))]">★ {r.rating} ({r.reviewCount.toLocaleString()})</span>
          )}
          {r.kidFriendly && <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-lg">👶 Kid-Friendly</span>}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/50 space-y-3">
              {r.signatureItems.length > 0 && (
                <div>
                  <p className="label-text mb-1.5">Signature Items</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.signatureItems.map((item) => (
                      <span key={item} className="text-xs px-2.5 py-1 bg-[hsl(var(--gold)/0.06)] text-foreground border border-[hsl(var(--gold)/0.15)] rounded-lg">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
                <p className="font-editorial text-sm text-muted-foreground italic">💡 {r.insiderTip}</p>
              </div>
              {r.priceNote && <p className="font-editorial text-xs text-muted-foreground">{r.priceNote}</p>}
              {r.dressCode && <p className="font-editorial text-xs text-muted-foreground">👔 {r.dressCode}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ParkGuidePage = ({ parkGuides }: ParkGuidePageProps) => {
  const { parkId } = useParams();
  const [activeTab, setActiveTab] = useState("intel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { isPaid, togglePaid } = useSubscription();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [attractionFilter, setAttractionFilter] = useState<string>("all");

  const park = parkGuides.find((p) => p.parkId === parkId) || parkGuides[0];
  const sameParkGuides = parkGuides.filter((p) => p?.resort === park?.resort);

  // Encyclopedia data
  const allEncyclopediaParks = [...wdwParks, ...dlrParks];
  const encyclopediaPark: ParkOverview | undefined = allEncyclopediaParks.find((p) => p.parkId === park?.parkId);
  const allEncyclopediaAttractions = [...wdwEncyclopediaAttractions, ...dlrEncyclopediaAttractions];
  const encyclopediaAttractions: ParkAttraction[] = park ? allEncyclopediaAttractions.filter((a) => a.parkId === park.parkId) : [];

  // Park news
  const parkNews = park ? parkNewsItems.filter((n) => n.parkId === park.parkId) : [];
  const closures = parkNews.filter((n) => n.category === "refurbishment" || n.category === "seasonal-closure");
  const permanentChanges = parkNews.filter((n) => n.category === "closing-permanently" || n.category === "re-theming");
  const newOpenings = parkNews.filter((n) => n.category === "opening-soon");
  const underConstruction = parkNews.filter((n) => n.category === "under-construction");

  // Restaurant data — map parkId to locationName used in restaurant data
  const parkIdToLocationName: Record<string, string[]> = {
    mk: ["Magic Kingdom"],
    epcot: ["EPCOT"],
    hs: ["Hollywood Studios"],
    ak: ["Animal Kingdom"],
    dl: ["Disneyland"],
    dca: ["Disney California Adventure", "California Adventure"],
  };
  const allRestaurants = [...wdwRestaurants, ...dlrRestaurants];
  const parkRestaurants: ResortRestaurant[] = useMemo(() => {
    if (!park) return [];
    const locationNames = parkIdToLocationName[park.parkId] || [];
    return allRestaurants.filter((r) =>
      locationNames.some((name) => r.locationName.includes(name))
    );
  }, [park]);

  // Attraction type filters
  const attractionTypes = useMemo(() => {
    const types = new Set(encyclopediaAttractions.map((a) => a.type));
    return ["all", ...Array.from(types)];
  }, [encyclopediaAttractions]);

  const typeLabels: Record<string, string> = {
    all: "All",
    ride: "🎢 Rides",
    show: "🎭 Shows",
    fireworks: "🎆 Nighttime",
    "meet-and-greet": "✨ Characters",
    experience: "🌟 Experiences",
    "water-ride": "💦 Water Rides",
    "play-area": "🎪 Play Areas",
    parade: "🎊 Parades",
  };

  const filteredAttractions = useMemo(() => {
    let list = encyclopediaAttractions;
    if (attractionFilter !== "all") {
      list = list.filter((a) => a.type === attractionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.land.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [encyclopediaAttractions, attractionFilter, searchQuery]);

  // Projections
  const projections = useMemo(() => {
    if (!park) return [];
    return generateProjections(calendarMonth, park.schedule);
  }, [calendarMonth, park]);

  const selectedSchedule: ParkDaySchedule | undefined = useMemo(() => {
    if (!selectedDate || !park) return undefined;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return park.schedule.find((s) => s.date === dateStr);
  }, [selectedDate, park]);

  const displayHours = selectedSchedule?.hours ?? park?.operatingHours;
  const displayWeather = selectedSchedule?.weather ?? park?.todayWeather;
  const displayCrowd = selectedSchedule?.crowdLevel ?? park?.todayCrowdLevel;

  const scheduleDates = useMemo(() => {
    if (!park) return [];
    return park.schedule.map((s) => parseISO(s.date));
  }, [park]);

  if (!park) return null;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[45vh] overflow-hidden">
        <img src={park.heroImage} alt={park.parkName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-10">
          <motion.div {...fade()}>
            <p className="label-text !text-white/60 mb-3 tracking-[0.3em]">{park.resortName}</p>
            <h1 className="font-display text-white text-4xl sm:text-6xl leading-[1.02]">{park.parkName}</h1>
          </motion.div>
        </div>
      </section>

      {/* Park Selector pills */}
      <div className="bg-[hsl(var(--warm))] px-8 lg:px-16 py-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {sameParkGuides.map((p) => (
            <Link
              key={p.parkId}
              to={`/parks/${p.parkId}`}
              className="shrink-0 px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
                background: p.parkId === park.parkId ? "hsl(var(--foreground))" : "transparent",
                color: p.parkId === park.parkId ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                border: `1px solid ${p.parkId === park.parkId ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
              }}
            >
              {p.parkName}
            </Link>
          ))}
          {parkGuides.filter((p) => p.resort !== park.resort).length > 0 && (
            <>
              <div className="w-px bg-border mx-2 shrink-0" />
              {parkGuides.filter((p) => p.resort !== park.resort).slice(0, 1).map((other) => (
                <Link
                  key={other.parkId}
                  to={`/parks/${other.parkId}`}
                  className="shrink-0 px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  → {other.resortName}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-background px-8 lg:px-16 sticky top-16 z-30">
        <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ═══ PARK INTEL TAB ═══ */}
      {activeTab === "intel" && (
        <>
          {/* ═══ PARK OVERVIEW ═══ */}
          {encyclopediaPark && (
            <section className="px-8 lg:px-16 py-12 lg:py-16 border-b border-border">
              <motion.div {...fade()}>
                <p className="label-text mb-2 tracking-[0.25em]">Park Overview</p>
                <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.08] mb-4">{encyclopediaPark.tagline}</h2>
                <p className="font-editorial text-lg text-muted-foreground leading-relaxed mb-10 max-w-3xl">
                  {encyclopediaPark.description}
                </p>
              </motion.div>

              {/* Quick facts grid */}
              <motion.div {...fade(0.05)} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Opened</p>
                  <p className="font-display text-lg text-foreground">{encyclopediaPark.opened}</p>
                </div>
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Size</p>
                  <p className="font-display text-lg text-foreground">{encyclopediaPark.size}</p>
                </div>
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Attractions</p>
                  <p className="font-display text-lg text-foreground">{encyclopediaPark.attractionCount}</p>
                </div>
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Dining</p>
                  <p className="font-display text-lg text-foreground">{encyclopediaPark.diningCount}+ venues</p>
                </div>
              </motion.div>

              {/* Known For */}
              <motion.div {...fade(0.1)} className="mb-10">
                <p className="label-text mb-4">Known For</p>
                <div className="flex flex-wrap gap-2">
                  {encyclopediaPark.knownFor.map((item) => (
                    <span key={item} className="px-4 py-2 rounded-lg text-sm font-editorial text-foreground bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.15)]">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Operating Hours + Benefits */}
              <motion.div {...fade(0.15)}>
                <p className="label-text mb-4 tracking-[0.2em]">Hours & Guest Benefits</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-xl">⚡</span>
                      <h4 className="font-display text-base text-foreground">Operating Hours</h4>
                    </div>
                    <p className="font-display text-lg text-foreground">{displayHours.regular}</p>
                  </div>
                  <div className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] rounded-lg p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-xl">✨</span>
                      <h4 className="font-display text-base text-foreground">Early Theme Park Entry</h4>
                    </div>
                    <p className="font-editorial text-sm text-muted-foreground leading-relaxed mb-2">30 minutes before opening for resort guests.</p>
                    {displayHours.earlyEntry && (
                      <p className="font-display text-sm text-[hsl(var(--gold-dark))]">🕐 {displayHours.earlyEntry}</p>
                    )}
                  </div>
                  <div className="border border-[hsl(280,30%,55%,0.25)] bg-[hsl(280,30%,55%,0.03)] rounded-lg p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-xl">🌙</span>
                      <h4 className="font-display text-base text-foreground">Extended Evening Hours</h4>
                    </div>
                    <p className="font-editorial text-sm text-muted-foreground leading-relaxed mb-2">2 extra hours for Deluxe Resort guests.</p>
                    {displayHours.extendedEvening && (
                      <p className="font-display text-sm text-[hsl(280,30%,45%)]">🕐 {displayHours.extendedEvening}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* ═══ THEMED LANDS — with attraction listings ═══ */}
          {encyclopediaPark && (
            <section className="px-8 lg:px-16 py-12 lg:py-16 border-b border-border bg-[hsl(var(--warm))]">
              <motion.div {...fade()}>
                <p className="label-text mb-2 tracking-[0.25em]">Explore the Park</p>
                <h2 className="font-display text-3xl text-foreground leading-[1.08] mb-4">Themed Lands</h2>
                <p className="font-editorial text-muted-foreground mb-8 max-w-2xl">
                  {park.parkName} is divided into {encyclopediaPark.lands.length} immersive themed lands, each with its own rides, dining, and atmosphere.
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {encyclopediaPark.lands.map((land, i) => {
                  const landAttractions = encyclopediaAttractions.filter(
                    (a) => a.land.includes(land.name) || land.name.includes(a.land.split(" —")[0])
                  );
                  return (
                    <motion.div key={land.name} {...fade(i * 0.04)} className="flex">
                      <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] overflow-hidden flex flex-col w-full">
                        <div className="p-5 flex-1">
                          <h4 className="font-display text-base text-foreground mb-1">{land.name}</h4>
                          <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-2">{land.description}</p>
                          {land.iconicAttraction && (
                            <p className="text-xs text-[hsl(var(--gold-dark))] font-medium">⭐ {land.iconicAttraction}</p>
                          )}
                        </div>
                        {landAttractions.length > 0 && (
                          <div className="border-t border-border/50 bg-muted/20 px-5 py-3">
                            <p className="label-text mb-2 text-[0.5rem]">{landAttractions.length} Experience{landAttractions.length > 1 ? "s" : ""}</p>
                            <div className="space-y-1">
                              {landAttractions.map((a) => {
                                const typeIcons: Record<string, string> = { ride: "🎢", show: "🎭", "meet-and-greet": "✨", experience: "🌟", parade: "🎊", fireworks: "🎆", "play-area": "🎪", "water-ride": "💦" };
                                return (
                                  <div key={a.attractionId} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-border/40 text-xs">
                                    <span className="text-[0.6rem]">{typeIcons[a.type] || "🎢"}</span>
                                    <span className="font-editorial text-foreground truncate flex-1">{a.name}</span>
                                    <span className="text-[0.5rem] uppercase tracking-wider shrink-0" style={{ color: thrillColors[a.thrillLevel] || "hsl(var(--foreground))" }}>
                                      {a.thrillLevel}
                                    </span>
                                    {a.warnings && a.warnings.length > 0 && (
                                      <span className="text-[0.5rem] text-destructive shrink-0" title={a.warnings.map(w => WARNING_LABELS[w]?.label).join(", ")}>⚠</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ 3-COLUMN: Must-Do · Insider Tips · What's Changing ═══ */}
          {encyclopediaPark && (
            <section className="px-8 lg:px-16 py-12 lg:py-16 border-b border-border">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Must-Do Experiences */}
                <motion.div {...fade()} className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] flex flex-col">
                  <div className="p-6 pb-4 border-b border-border/50">
                    <p className="label-text tracking-[0.2em]">Must-Do Experiences ⭐</p>
                  </div>
                  <div className="p-6 pt-4 space-y-2 flex-1">
                    {encyclopediaPark.mustDo.map((item) => (
                      <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--gold)/0.04)] border border-[hsl(var(--gold)/0.15)]">
                        <span className="text-[hsl(var(--gold))] text-sm shrink-0">★</span>
                        <span className="font-editorial text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Insider Tips */}
                <motion.div {...fade(0.05)} className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] flex flex-col">
                  <div className="p-6 pb-4 border-b border-border/50">
                    <p className="label-text tracking-[0.2em]">Insider Tips 💡</p>
                  </div>
                  <div className="p-6 pt-4 space-y-2 flex-1">
                    {encyclopediaPark.tips.map((tip) => (
                      <div key={tip} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-xs mt-0.5 shrink-0">💡</span>
                        <span className="font-editorial text-sm text-muted-foreground leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* What's Changing */}
                <motion.div {...fade(0.1)} className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] flex flex-col">
                  <div className="p-6 pb-4 border-b border-border/50">
                    <p className="label-text tracking-[0.2em]">What's Changing 🔄</p>
                  </div>
                  <div className="p-6 pt-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                    {parkNews.length === 0 ? (
                      <p className="font-editorial text-sm text-muted-foreground italic">No current changes announced.</p>
                    ) : (
                      parkNews.map((item) => {
                        const Icon = newsIcons[item.category] || Construction;
                        const color = newsColors[item.category];
                        return (
                          <div key={item.id} className="flex items-start gap-3 px-4 py-3 rounded-lg border" style={{ borderColor: `${color}25`, backgroundColor: `${color}04` }}>
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}12` }}>
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-[0.6rem] uppercase tracking-[0.08em] font-medium" style={{ color }}>{newsLabels[item.category]}</span>
                                {item.dateLabel && <span className="text-[0.6rem] text-muted-foreground">· {item.dateLabel}</span>}
                              </div>
                              <p className="font-display text-sm text-foreground leading-snug">{item.title}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* ═══ FULL ATTRACTION DIRECTORY ═══ */}
          <section className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
            <motion.div {...fade()}>
              <p className="label-text mb-2 tracking-[0.25em]">Complete Directory</p>
              <h2 className="font-display text-3xl text-foreground leading-[1.08] mb-4">Every Experience</h2>
              <p className="font-editorial text-muted-foreground mb-8 max-w-2xl">
                Every ride, show, experience, and entertainment at {park.parkName} — with wait times, warnings, insider tips, and ride details.
              </p>
            </motion.div>

            {/* Search + Filters */}
            <motion.div {...fade(0.05)} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attractions, lands, tags..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="font-display text-foreground">{filteredAttractions.length}</span> of {encyclopediaAttractions.length} attractions
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {attractionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setAttractionFilter(type)}
                    className={cn(
                      "shrink-0 px-4 py-2 rounded-lg text-sm transition-all duration-300 cursor-pointer border",
                      attractionFilter === type
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted-foreground border-border hover:border-[hsl(var(--gold))]/50"
                    )}
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {typeLabels[type] || type}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Attraction cards */}
            <div className="space-y-3">
              {filteredAttractions.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-lg">
                  <p className="font-editorial text-muted-foreground">No attractions found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredAttractions.map((a, i) => (
                  <motion.div key={a.attractionId} {...fade(Math.min(i * 0.02, 0.3))}>
                    <AttractionCard a={a} />
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Crowd Calendar */}
          <section className="max-w-5xl mx-auto px-8 py-16 lg:py-24 border-t border-border">
            <motion.div {...fade()} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="label-text mb-2">Crowd Calendar</p>
                  <h2 className="font-display text-3xl text-foreground leading-[1.08]">When to Go</h2>
                </div>
                <button
                  onClick={togglePaid}
                  className="px-4 py-2 text-[0.625rem] uppercase tracking-[0.15em] rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isPaid ? "👑 Paid Tier" : "🆓 Free Tier"}
                </button>
              </div>
              <p className="font-editorial text-base text-muted-foreground leading-relaxed max-w-2xl">
                {park.crowdCalendarSummary}
              </p>
            </motion.div>

            {/* FREE TIER: Typical by day */}
            <motion.div {...fade(0.1)}>
              <p className="label-text mb-6 tracking-[0.2em]">Typical Crowd Levels by Day</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
                {Object.entries(typicalCrowdsByDay).map(([day, data]) => (
                  <div key={day} className="border border-border bg-card rounded-lg p-4 shadow-[var(--shadow-soft)]">
                    <p className="font-display text-sm text-foreground mb-2">{day.slice(0, 3)}</p>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-1 h-3 rounded-sm transition-colors" style={{ background: i < data.score ? crowdColor(data.level) : "hsl(var(--border))" }} />
                      ))}
                    </div>
                    <p className="text-[0.5625rem] uppercase tracking-[0.1em] font-medium mb-1" style={{ color: crowdColor(data.level) }}>{data.level}</p>
                    <p className="font-editorial text-[0.625rem] text-muted-foreground leading-snug">{data.tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* PAID TIER: Projection calendar */}
            <motion.div {...fade(0.2)}>
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-4 h-4 text-[hsl(var(--gold))]" />
                <p className="label-text tracking-[0.2em]">Crowd Projection Calendar</p>
              </div>

              {isPaid ? (
                <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="font-display text-xl text-foreground">{format(calendarMonth, "MMMM yyyy")}</p>
                    <button onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center"><p className="label-text text-[0.5625rem]">{d}</p></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getDay(startOfMonth(calendarMonth)) }).map((_, i) => <div key={`empty-${i}`} />)}
                    {projections.map((day) => {
                      const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day.date, "yyyy-MM-dd");
                      const isToday = format(day.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      return (
                        <motion.button
                          key={format(day.date, "yyyy-MM-dd")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedDate(day.date instanceof Date ? day.date : new Date(day.date))}
                          className={cn(
                            "relative p-2 rounded-lg text-left transition-all duration-300 min-h-[72px]",
                            isSelected ? "border-2 border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)]" : "border border-border hover:border-[hsl(var(--gold))]/50",
                            isToday && !isSelected && "ring-1 ring-[hsl(var(--gold))]/30"
                          )}
                        >
                          <p className={cn("font-display text-xs mb-1", isToday ? "text-[hsl(var(--gold-dark))]" : "text-foreground")}>{format(day.date, "d")}</p>
                          <div className="flex gap-px mb-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="w-[3px] h-2 rounded-[1px]" style={{ background: i < day.crowdScore ? crowdColor(day.crowdLevel) : "hsl(var(--border))" }} />
                            ))}
                          </div>
                          <p className="text-[0.5rem] uppercase tracking-[0.05em] font-medium" style={{ color: crowdColor(day.crowdLevel) }}>{day.crowdLevel}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-display text-lg text-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                            <button onClick={() => setSelectedDate(undefined)} className="label-text text-muted-foreground hover:text-foreground transition-colors">✕ Clear</button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="label-text mb-1">Projected Crowd</p>
                              <p className="font-display text-lg" style={{ color: crowdColor(displayCrowd) }}>{displayCrowd}</p>
                            </div>
                            <div>
                              <p className="label-text mb-1">Weather</p>
                              <p className="font-display text-lg text-foreground">{displayWeather}</p>
                            </div>
                            <div>
                              <p className="label-text mb-1">Hours</p>
                              <p className="font-display text-sm text-foreground">{displayHours.regular}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-6">
                    {[{ label: "Low", level: "Low" }, { label: "Moderate", level: "Moderate" }, { label: "High", level: "High" }].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: crowdColor(item.level) }} />
                        <span className="label-text text-[0.5625rem]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] overflow-hidden">
                  <div className="p-6 sm:p-8 blur-[3px] opacity-50 pointer-events-none select-none">
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="p-2 rounded-lg border border-border min-h-[60px]">
                          <p className="font-display text-xs text-muted-foreground">{(i % 28) + 1}</p>
                          <div className="flex gap-px mt-1">
                            {Array.from({ length: 10 }).map((_, j) => (
                              <div key={j} className="w-[3px] h-2 rounded-[1px]" style={{ background: j < (3 + (i % 7)) ? "hsl(var(--gold))" : "hsl(var(--border))" }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center max-w-sm px-6">
                      <div className="w-12 h-12 rounded-lg bg-[hsl(var(--gold)/0.12)] flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-5 h-5 text-[hsl(var(--gold-dark))]" />
                      </div>
                      <p className="font-display text-xl text-foreground mb-2">Unlock Crowd Projections</p>
                      <p className="font-editorial text-sm text-muted-foreground mb-6 leading-relaxed">See daily crowd projections up to 6 months out.</p>
                      <button onClick={togglePaid} className="px-8 py-3 rounded-lg text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity">Upgrade to unlock</button>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </section>
        </>
      )}

      {/* ═══ THE PULSE TAB ═══ */}
      {activeTab === "pulse" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Crowd Compass</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">The Pulse</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-16">
              Live conditions, wait times, and crowd-flow tracking for {park.parkName}.
            </p>
          </motion.div>

          {/* Today's Conditions — moved here from Intel */}
          <motion.div {...fade(0.05)} className="mb-16">
            <p className="label-text mb-6 tracking-[0.2em]">Today's Conditions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-3">Crowd Level</p>
                <p className="font-display text-4xl text-foreground mb-2">{park.todayCrowdLevel}</p>
                <p className="font-editorial text-xs text-muted-foreground">Based on real-time wait data</p>
              </div>
              <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-3">Weather Now</p>
                <p className="font-display text-2xl text-foreground mb-2">{park.todayWeather}</p>
                <p className="font-editorial text-xs text-muted-foreground">Updated every 30 minutes</p>
              </div>
              <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)] sm:col-span-2">
                <HoursDisplay hours={park.operatingHours} label="Park Hours" />
              </div>
            </div>
          </motion.div>

          {/* Date picker for specific day conditions */}
          <motion.div {...fade(0.1)} className="mb-16">
            <p className="label-text mb-4 tracking-[0.2em]">Check a Specific Date</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn("inline-flex items-center gap-3 px-5 py-3 rounded-lg text-sm bg-card border border-border transition-colors duration-300 hover:border-[hsl(var(--gold))]", !selectedDate && "text-muted-foreground")} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{ hasData: scheduleDates }}
                    modifiersStyles={{ hasData: { fontWeight: 700, textDecoration: "underline", textDecorationColor: "hsl(var(--gold))", textUnderlineOffset: "4px" } }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <button onClick={() => setSelectedDate(undefined)} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>✕ Clear date</button>
              )}
            </div>
            {selectedDate && selectedSchedule && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">{format(selectedDate, "MMM d")} Weather</p>
                  <p className="font-display text-lg text-foreground">{selectedSchedule.weather}</p>
                </div>
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Crowd Level</p>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-lg text-foreground">{selectedSchedule.crowdLevel}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-4 transition-colors duration-300" style={{ background: i < selectedSchedule.crowdScore ? crowdColor(selectedSchedule.crowdLevel) : "hsl(var(--border))" }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">Hours</p>
                  <p className="font-display text-base text-foreground">{selectedSchedule.hours.regular}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Week at a Glance */}
          {park.schedule.length > 0 && (
            <motion.div {...fade(0.15)} className="mb-16">
              <p className="label-text mb-6 tracking-[0.2em]">Week at a Glance</p>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {park.schedule.slice(0, 7).map((day) => {
                  const d = parseISO(day.date);
                  return (
                    <button key={day.date} onClick={() => setSelectedDate(d)} className="shrink-0 w-[140px] border border-border bg-card rounded-lg p-4 text-left hover:border-[hsl(var(--gold))] transition-colors duration-300 shadow-[var(--shadow-soft)]">
                      <p className="label-text mb-1">{format(d, "EEE")}</p>
                      <p className="font-display text-sm text-foreground mb-2">{format(d, "MMM d")}</p>
                      <p className="font-editorial text-xs text-muted-foreground mb-1">{day.weather}</p>
                      <p className="text-[0.625rem] uppercase tracking-[0.1em] font-medium" style={{ color: crowdColor(day.crowdLevel) }}>{day.crowdLevel}</p>
                      <p className="font-editorial text-[0.625rem] text-muted-foreground/50 mt-1">{day.hours.regular}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Wait times placeholder */}
          <motion.div {...fade(0.2)} className="border border-dashed border-border rounded-lg py-20 text-center mb-16">
            <p className="font-display text-2xl text-muted-foreground/40 mb-3">Live Wait Times</p>
            <p className="font-editorial text-sm text-muted-foreground/30 max-w-md mx-auto">
              Real-time attraction wait times with historical trending, crowd predictions, and optimal ride sequencing will appear here.
            </p>
          </motion.div>

          {/* Crowd flow placeholder */}
          <motion.div {...fade(0.3)}>
            <p className="label-text mb-6">Crowd Flow Map</p>
            <div className="border border-dashed border-border rounded-lg py-16 text-center">
              <p className="font-display text-xl text-muted-foreground/40 mb-2">Heat Map Coming Soon</p>
              <p className="font-editorial text-sm text-muted-foreground/30">Visual crowd density by park area with movement predictions.</p>
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ParkGuidePage;
