import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

/* ── Crowd level types & colors ── */
type CrowdLevel = "low" | "moderate" | "high" | "very-high";

const crowdMeta: Record<CrowdLevel, { label: string; bg: string; text: string; border: string }> = {
  low:        { label: "Low",       bg: "hsl(142, 60%, 90%)", text: "hsl(142, 60%, 28%)", border: "hsl(142, 60%, 75%)" },
  moderate:   { label: "Moderate",  bg: "hsl(43, 80%, 88%)",  text: "hsl(43, 69%, 30%)",  border: "hsl(43, 69%, 65%)" },
  high:       { label: "High",      bg: "hsl(25, 85%, 88%)",  text: "hsl(25, 85%, 35%)",  border: "hsl(25, 85%, 65%)" },
  "very-high":{ label: "Very High", bg: "hsl(0, 70%, 90%)",   text: "hsl(0, 70%, 35%)",   border: "hsl(0, 70%, 70%)" },
};

/* ── Mock crowd data generator for MK ── */
const generateCrowdData = (year: number, month: number): Map<string, CrowdLevel> => {
  const start = new Date(year, month, 1);
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  const data = new Map<string, CrowdLevel>();

  days.forEach((day) => {
    const key = format(day, "yyyy-MM-dd");
    const dow = getDay(day); // 0=Sun
    const dom = day.getDate();
    const m = day.getMonth(); // 0-indexed

    // Spring break: March 14-28
    const isSpringBreak = m === 2 && dom >= 14 && dom <= 28;

    // Seed pseudo-random variation
    const hash = (dom * 7 + m * 31 + year) % 10;

    let level: CrowdLevel;

    if (isSpringBreak) {
      level = dow === 0 || dow === 6 ? "very-high" : (hash < 3 ? "moderate" : "high");
    } else if (dow === 0 || dow === 6) {
      level = hash < 2 ? "moderate" : "high";
    } else {
      level = hash < 5 ? "low" : "moderate";
    }

    data.set(key, level);
  });

  return data;
};

/* ── Mock booked trip dates ── */
const bookedDates = new Set([
  "2026-03-22", "2026-03-23", "2026-03-24", "2026-03-25", "2026-03-26", "2026-03-27",
]);

/* ── Park options ── */
const parks = [
  { id: "mk", name: "Magic Kingdom" },
  { id: "epcot", name: "EPCOT" },
  { id: "hs", name: "Hollywood Studios" },
  { id: "ak", name: "Animal Kingdom" },
];

interface CrowdCalendarProps {
  parkId?: string;
}

const CrowdCalendar = ({ parkId: initialPark = "mk" }: CrowdCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedPark, setSelectedPark] = useState(initialPark);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const crowdData = useMemo(
    () => generateCrowdData(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const emptySlots = getDay(startOfMonth(currentMonth));

  // Best days = 3 lowest-crowd days
  const bestDays = useMemo(() => {
    const order: Record<CrowdLevel, number> = { low: 0, moderate: 1, high: 2, "very-high": 3 };
    return [...crowdData.entries()]
      .sort((a, b) => order[a[1]] - order[b[1]])
      .slice(0, 3)
      .map(([date, level]) => ({ date, level }));
  }, [crowdData]);

  const canGoBack = currentMonth.getMonth() >= 2 && currentMonth.getFullYear() === 2026;
  const canGoForward = currentMonth.getMonth() <= 3 && currentMonth.getFullYear() === 2026;

  return (
    <section className="px-8 lg:px-16 py-16 lg:py-24 border-b border-border bg-[hsl(var(--warm))]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease }}
        >
          <p className="label-text mb-2 tracking-[0.25em]">Crowd Intelligence</p>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.08] mb-4">
            Crowd Calendar
          </h2>
          <p className="font-editorial text-muted-foreground mb-8 max-w-2xl">
            Plan around the crowds. Color-coded daily projections help you pick the perfect days for each park.
          </p>
        </motion.div>

        {/* Park selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {parks.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPark(p.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-lg text-xs uppercase tracking-[0.12em] transition-all duration-300 border font-medium",
                selectedPark === p.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-[hsl(var(--gold))]/50"
              )}
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <button
              onClick={() => canGoBack && setCurrentMonth((m) => subMonths(m, 1))}
              disabled={!canGoBack}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="font-display text-xl text-foreground">{format(currentMonth, "MMMM yyyy")}</p>
            <button
              onClick={() => canGoForward && setCurrentMonth((m) => addMonths(m, 1))}
              disabled={!canGoForward}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center">
                <p className="label-text text-[0.5625rem]">{d}</p>
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-px bg-border/30 p-px">
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`e-${i}`} className="bg-card min-h-[72px] sm:min-h-[80px]" />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const level = crowdData.get(key) || "moderate";
              const meta = crowdMeta[level];
              const isBooked = bookedDates.has(key);
              const isSelected = selectedDate === key;
              const isToday = key === format(new Date(), "yyyy-MM-dd");

              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={cn(
                    "relative min-h-[72px] sm:min-h-[80px] p-2 text-left transition-all duration-200 flex flex-col",
                    isSelected ? "ring-2 ring-[hsl(var(--gold))] z-10" : ""
                  )}
                  style={{ backgroundColor: meta.bg }}
                >
                  {/* Date number */}
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "font-display text-sm leading-none",
                        isToday && "w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs"
                      )}
                      style={!isToday ? { color: meta.text } : undefined}
                    >
                      {format(day, "d")}
                    </span>
                    {isBooked && (
                      <span className="w-2 h-2 rounded-full bg-[hsl(210,80%,55%)] shrink-0" title="Trip booked" />
                    )}
                  </div>

                  {/* Crowd label */}
                  <span
                    className="mt-auto text-[0.5rem] uppercase tracking-[0.08em] font-medium leading-none"
                    style={{ color: meta.text }}
                  >
                    {meta.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 p-4 border-t border-border/50">
            {(Object.entries(crowdMeta) as [CrowdLevel, typeof crowdMeta["low"]][]).map(([, m]) => (
              <div key={m.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.bg, border: `1px solid ${m.border}` }} />
                <span className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>{m.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[hsl(210,80%,55%)]" />
              <span className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}>Your trip</span>
            </div>
          </div>

          {/* Selected date detail */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg text-foreground">
                        {format(new Date(selectedDate + "T12:00:00"), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm font-editorial text-muted-foreground mt-1">
                        Projected:{" "}
                        <span className="font-medium" style={{ color: crowdMeta[crowdData.get(selectedDate) || "moderate"].text }}>
                          {crowdMeta[crowdData.get(selectedDate) || "moderate"].label} Crowds
                        </span>
                        {bookedDates.has(selectedDate) && (
                          <span className="ml-2 text-[hsl(210,80%,55%)]">· Part of your trip</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDate(null); }}
                      className="label-text text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Best Days to Visit ── */}
        <div className="mt-10">
          <p className="label-text mb-4 tracking-[0.2em]">Best Days to Visit This Month</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bestDays.map((bd, i) => {
              const d = new Date(bd.date + "T12:00:00");
              const meta = crowdMeta[bd.level];
              return (
                <motion.div
                  key={bd.date}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                  className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display text-lg text-foreground">{format(d, "EEEE")}</p>
                      <p className="font-editorial text-sm text-muted-foreground">{format(d, "MMMM d, yyyy")}</p>
                    </div>
                    <span
                      className="text-xs uppercase tracking-[0.08em] font-medium px-2.5 py-1 rounded-lg"
                      style={{ color: meta.text, backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                    Expected low wait times across {parks.find((p) => p.id === selectedPark)?.name || "the park"}. Great day for headliners.
                  </p>
                  <button
                    onClick={() => toast.success(`📅 ${format(d, "MMM d")} added to your planner`)}
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs uppercase tracking-[0.12em] font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 40 }}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Plan this day
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CrowdCalendar;
