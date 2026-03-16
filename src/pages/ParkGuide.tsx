import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { format, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { CalendarIcon, Lock, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ParkGuide, ParkDaySchedule, ParkHours } from "@/data/types";
import { mockData } from "@/data/mockData";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});
const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.4, delay, ease },
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

// Mock subscription state — toggle to test gating
const useSubscription = () => {
  const [isPaid, setIsPaid] = useState(false);
  return { isPaid, togglePaid: () => setIsPaid((p) => !p) };
};

// Typical crowd levels by day of week (free tier data)
const typicalCrowdsByDay: Record<string, { level: string; score: number; tip: string }> = {
  Sunday: { level: "Moderate", score: 5, tip: "Arrives heavy mid-morning, thins after 4 PM." },
  Monday: { level: "Low", score: 3, tip: "One of the quietest days — rope drop is golden." },
  Tuesday: { level: "Low", score: 3, tip: "Great for character meets and walk-on rides." },
  Wednesday: { level: "Moderate", score: 5, tip: "Mid-week bump from resort check-ins." },
  Thursday: { level: "Moderate", score: 6, tip: "Builds toward the weekend; arrive early." },
  Friday: { level: "High", score: 8, tip: "Weekend warriors arrive — use Lightning Lane." },
  Saturday: { level: "High", score: 9, tip: "Peak day. Prioritize rope drop and late evening." },
};

// Generate projected crowd data for a month (paid tier)
const generateProjections = (baseDate: Date, parkSchedule: ParkDaySchedule[]) => {
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  const days = eachDayOfInterval({ start, end });

return days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const existing = parkSchedule.find((s) => s.date === dateStr);
    if (existing) return { date: day, ...existing };
    // Generate projected data based on day-of-week patterns
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

const ParkGuidePage = ({ parkGuides }: ParkGuidePageProps) => {
  const { parkId } = useParams();
  const [activeTab, setActiveTab] = useState("intel");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { isPaid, togglePaid } = useSubscription();
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const park = parkGuides.find((p) => p.parkId === parkId) || parkGuides[0];
  const sameParkGuides = parkGuides.filter((p) => p?.resort === park?.resort);
  const attractions = mockData.partySurvey.attractions.filter((a) => a.parkId === park?.parkId);

  // Projected crowd data for the calendar month (paid)
  const projections = useMemo(() => {
    if (!park) return [];
    return generateProjections(calendarMonth, park.schedule);
  }, [calendarMonth, park]);

  // Find schedule for selected date
  const selectedSchedule: ParkDaySchedule | undefined = useMemo(() => {
    if (!selectedDate || !park) return undefined;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return park.schedule.find((s) => s.date === dateStr);
  }, [selectedDate, park]);

  // Determine which hours/weather/crowd to show
  const displayHours = selectedSchedule?.hours ?? park?.operatingHours;
  const displayWeather = selectedSchedule?.weather ?? park?.todayWeather;
  const displayCrowd = selectedSchedule?.crowdLevel ?? park?.todayCrowdLevel;

  // Dates that have schedule data (for calendar highlighting)
  const scheduleDates = useMemo(() => {
    if (!park) return [];
    return park.schedule.map((s) => parseISO(s.date));
  }, [park]);

  const filteredAttractions = useMemo(() => {
    if (!searchQuery.trim()) return attractions;
    const q = searchQuery.toLowerCase();
    return attractions.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }, [attractions, searchQuery]);

  const categoryIcons: Record<string, string> = { ride: "🎢", show: "🎭", character: "✨", dining: "🍽️" };

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
          {/* Date Filter + Quick Stats */}
          <section className="px-8 lg:px-16 py-12 bg-[hsl(var(--warm))]">
            {/* Date Picker */}
            <motion.div {...fade()} className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <p className="label-text mb-2">View Date</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "inline-flex items-center gap-3 px-5 py-3 rounded-lg text-sm bg-card border border-border transition-colors duration-300 hover:border-[hsl(var(--gold))]",
                          !selectedDate && "text-muted-foreground"
                        )}
                        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                      >
                        <CalendarIcon className="w-4 h-4 opacity-50" />
                        {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Today's conditions"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ hasData: scheduleDates }}
                        modifiersStyles={{
                          hasData: {
                            fontWeight: 700,
                            textDecoration: "underline",
                            textDecorationColor: "hsl(var(--gold))",
                            textUnderlineOffset: "4px",
                          },
                        }}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(undefined)}
                    className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors self-end sm:self-center"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    ✕ Clear date
                  </button>
                )}
                {selectedSchedule?.notes && (
                  <motion.p
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-editorial text-sm text-muted-foreground italic max-w-md self-end sm:self-center"
                  >
                    {selectedSchedule.notes}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div {...fade(0.05)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Weather */}
               <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">{selectedDate ? format(selectedDate, "MMM d") + " Weather" : "Today's Weather"}</p>
                <p className="font-display text-lg text-foreground">{displayWeather}</p>
              </div>
              {/* Crowd Level */}
              <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">Crowd Level</p>
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg text-foreground">{displayCrowd}</p>
                  {selectedSchedule && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-4 transition-colors duration-300"
                          style={{
                            background: i < selectedSchedule.crowdScore
                              ? crowdColor(displayCrowd)
                              : "hsl(var(--border))",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Hours */}
              <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] sm:col-span-2">
                <HoursDisplay hours={displayHours} label={selectedDate ? format(selectedDate, "MMM d") + " Hours" : "Operating Hours"} />
              </div>
            </motion.div>
          </section>

          {/* Week-at-a-Glance (only when no date selected) */}
          {!selectedDate && park.schedule.length > 0 && (
            <section className="px-8 lg:px-16 py-12 border-b border-border">
              <motion.div {...fade()}>
                <p className="label-text mb-6">Week at a Glance</p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {park.schedule.slice(0, 7).map((day) => {
                    const d = parseISO(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(d)}
                        className="shrink-0 w-[140px] border border-border bg-card rounded-lg p-4 text-left hover:border-[hsl(var(--gold))] transition-colors duration-300 shadow-[var(--shadow-soft)]"
                      >
                        <p className="label-text mb-1">{format(d, "EEE")}</p>
                        <p className="font-display text-sm text-foreground mb-2">{format(d, "MMM d")}</p>
                        <p className="font-editorial text-xs text-muted-foreground mb-1">{day.weather}</p>
                        <p
                          className="text-[0.625rem] uppercase tracking-[0.1em] font-medium"
                          style={{ color: crowdColor(day.crowdLevel) }}
                        >
                          {day.crowdLevel}
                        </p>
                        <p className="font-editorial text-[0.625rem] text-muted-foreground/50 mt-1">{day.hours.regular}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </section>
          )}

          {/* Crowd Calendar — Tiered */}
          <section className="max-w-5xl mx-auto px-8 py-16 lg:py-24">
            <motion.div {...fade()} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="label-text mb-2">Crowd Calendar</p>
                  <h2 className="font-display text-3xl text-foreground leading-[1.08]">When to Go</h2>
                </div>
                {/* Dev toggle for testing */}
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

            {/* ── FREE TIER: Typical Crowds by Day ── */}
            <motion.div {...fade(0.1)}>
              <p className="label-text mb-6 tracking-[0.2em]">Typical Crowd Levels by Day</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
                {Object.entries(typicalCrowdsByDay).map(([day, data]) => (
                  <div
                    key={day}
                    className="border border-border bg-card rounded-lg p-4 shadow-[var(--shadow-soft)]"
                  >
                    <p className="font-display text-sm text-foreground mb-2">{day.slice(0, 3)}</p>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-3 rounded-sm transition-colors"
                          style={{
                            background: i < data.score
                              ? crowdColor(data.level)
                              : "hsl(var(--border))",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[0.5625rem] uppercase tracking-[0.1em] font-medium mb-1"
                      style={{ color: crowdColor(data.level) }}
                    >
                      {data.level}
                    </p>
                    <p className="font-editorial text-[0.625rem] text-muted-foreground leading-snug">{data.tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── PAID TIER: Interactive Projection Calendar ── */}
            <motion.div {...fade(0.2)}>
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-4 h-4 text-[hsl(var(--gold))]" />
                <p className="label-text tracking-[0.2em]">Crowd Projection Calendar</p>
              </div>

              {isPaid ? (
                <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] p-6 sm:p-8">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="font-display text-xl text-foreground">{format(calendarMonth, "MMMM yyyy")}</p>
                    <button
                      onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center">
                        <p className="label-text text-[0.5625rem]">{d}</p>
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: getDay(startOfMonth(calendarMonth)) }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {projections.map((day) => {
                      const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(day.date, "yyyy-MM-dd");
                      const isToday = format(day.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      return (
                        <motion.button
                          key={format(day.date, "yyyy-MM-dd")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedDate(day.date)}
                          className={cn(
                            "relative p-2 rounded-lg text-left transition-all duration-300 min-h-[72px]",
                            isSelected
                              ? "border-2 border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)]"
                              : "border border-border hover:border-[hsl(var(--gold))]/50",
                            isToday && !isSelected && "ring-1 ring-[hsl(var(--gold))]/30"
                          )}
                        >
                          <p className={cn(
                            "font-display text-xs mb-1",
                            isToday ? "text-[hsl(var(--gold-dark))]" : "text-foreground"
                          )}>
                            {format(day.date, "d")}
                          </p>
                          <div className="flex gap-px mb-1">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-[3px] h-2 rounded-[1px]"
                                style={{
                                  background: i < day.crowdScore
                                    ? crowdColor(day.crowdLevel)
                                    : "hsl(var(--border))",
                                }}
                              />
                            ))}
                          </div>
                          <p
                            className="text-[0.5rem] uppercase tracking-[0.05em] font-medium"
                            style={{ color: crowdColor(day.crowdLevel) }}
                          >
                            {day.crowdLevel}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Selected date detail */}
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-border">
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-display text-lg text-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
                            <button
                              onClick={() => setSelectedDate(undefined)}
                              className="label-text text-muted-foreground hover:text-foreground transition-colors"
                            >
                              ✕ Clear
                            </button>
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

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-6">
                    {[
                      { label: "Low", level: "Low" },
                      { label: "Moderate", level: "Moderate" },
                      { label: "High", level: "High" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: crowdColor(item.level) }} />
                        <span className="label-text text-[0.5625rem]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── GATED STATE ── */
                <div className="relative border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] overflow-hidden">
                  {/* Blurred preview */}
                  <div className="p-6 sm:p-8 blur-[3px] opacity-50 pointer-events-none select-none">
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="p-2 rounded-lg border border-border min-h-[60px]">
                          <p className="font-display text-xs text-muted-foreground">{(i % 28) + 1}</p>
                          <div className="flex gap-px mt-1">
                            {Array.from({ length: 10 }).map((_, j) => (
                              <div
                                key={j}
                                className="w-[3px] h-2 rounded-[1px]"
                                style={{ background: j < (3 + (i % 7)) ? "hsl(var(--gold))" : "hsl(var(--border))" }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="text-center max-w-sm px-6"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[hsl(var(--gold)/0.12)] flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-5 h-5 text-[hsl(var(--gold-dark))]" />
                      </div>
                      <p className="font-display text-xl text-foreground mb-2">Unlock Crowd Projections</p>
                      <p className="font-editorial text-sm text-muted-foreground mb-6 leading-relaxed">
                        See daily crowd projections up to 6 months out. Pick the perfect dates for your trip.
                      </p>
                      <button
                        onClick={togglePaid}
                        className="px-8 py-3 rounded-lg text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                      >
                        Upgrade to unlock
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Typical Weather + Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16">
              <motion.div {...fade(0.3)}>
                <p className="label-text mb-6">Typical Weather</p>
                <p className="font-editorial text-lg text-foreground">{park.typicalWeather}</p>
              </motion.div>
              <motion.div {...slideRight()} className="space-y-8">
                {park.categories.map((cat, i) => (
                  <motion.div key={cat.label} {...slideRight(i * 0.08)} className="group cursor-pointer">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="font-display text-xl text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{cat.label}</p>
                      <span className="label-text">{cat.itemCount}</span>
                    </div>
                    <p className="font-editorial text-sm text-muted-foreground">{cat.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Searchable Attractions */}
          <section className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Park Wonders 🎢</p>
              <h2 className="font-display text-3xl text-foreground leading-[1.1] mb-4">Insider Tips</h2>
              <p className="font-editorial text-muted-foreground mb-8 max-w-lg">
                Searchable tips, secrets, and family-friendly strategies for every experience at {park.parkName}.
              </p>
            </motion.div>

            <motion.div {...fade(0.1)} className="mb-8 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attractions, shows, dining..."
                className="w-full px-5 py-3 rounded-lg text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              />
            </motion.div>

            <div className="space-y-3">
              {filteredAttractions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-editorial text-muted-foreground">No attractions found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredAttractions.map((a, i) => (
                  <motion.div
                    key={a.attractionId}
                    {...fade(i * 0.03)}
                    className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-lg mt-0.5">{categoryIcons[a.category]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{a.name}</h3>
                          {a.heightRequirement && (
                            <span className="label-text !text-[hsl(var(--gold))]">↕ {a.heightRequirement}</span>
                          )}
                        </div>
                        <p className="font-editorial text-sm text-muted-foreground">{a.description}</p>
                        {a.sensoryTags && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {a.sensoryTags.map((tag) => (
                              <span key={tag} className="text-[0.625rem] uppercase tracking-[0.15em] px-2 py-0.5 bg-secondary text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {attractions.length === 0 && (
               <div className="border border-dashed border-border rounded-lg py-16 text-center">
                <p className="font-display text-xl text-muted-foreground/40 mb-2">Attraction database expanding</p>
                <p className="font-editorial text-sm text-muted-foreground/30">
                  Full attraction details for {park.parkName} will be populated as the database grows.
                </p>
              </div>
            )}
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
              Live wait times and crowd-flow tracking for {park.parkName}. Know where the crowds are — and where they aren't.
            </p>
          </motion.div>

          {/* Current conditions */}
          <motion.div {...fade(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
             <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
              <p className="label-text mb-3">Current Crowd Level</p>
              <p className="font-display text-4xl text-foreground mb-2">{park.todayCrowdLevel}</p>
              <p className="font-editorial text-xs text-muted-foreground">Based on real-time wait data</p>
            </div>
             <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
              <p className="label-text mb-3">Weather Now</p>
              <p className="font-display text-2xl text-foreground mb-2">{park.todayWeather}</p>
              <p className="font-editorial text-xs text-muted-foreground">Updated every 30 minutes</p>
            </div>
            <div className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
              <HoursDisplay hours={park.operatingHours} label="Park Hours" />
            </div>
          </motion.div>

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
              <p className="font-editorial text-sm text-muted-foreground/30">
                Visual crowd density by park area with movement predictions.
              </p>
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ParkGuidePage;
