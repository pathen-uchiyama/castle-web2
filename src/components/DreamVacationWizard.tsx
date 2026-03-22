import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, Check, Users, Baby, Plus, Minus,
  Compass, BellRing, Calendar as CalendarIcon, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import SparkleField from "@/components/SparkleField";

const TOTAL = 5;

/* ─── Data ─── */
const VIBES = [
  { id: "rides", label: "Ride Everything", emoji: "🎢" },
  { id: "easy", label: "Take It Easy", emoji: "☕" },
  { id: "food", label: "Foodie Adventure", emoji: "🍽️" },
  { id: "characters", label: "Character Meets", emoji: "🏰" },
  { id: "shows", label: "Shows & Parades", emoji: "🎆" },
  { id: "mix", label: "Mix of Everything", emoji: "✨" },
];

const getCrowdLevel = (start?: Date, end?: Date) => {
  if (!start || !end) return null;
  const day = start.getDay();
  if (day === 0 || day === 6)
    return { label: "High Crowd", color: "text-[hsl(var(--coral))]", bg: "bg-[hsl(var(--coral-light))]" };
  if (day === 1 || day === 4)
    return { label: "Low Crowd", color: "text-[hsl(var(--mint))]", bg: "bg-[hsl(var(--mint-light))]" };
  return { label: "Moderate Crowd", color: "text-[hsl(var(--sunshine))]", bg: "bg-[hsl(var(--sunshine-light))]" };
};

/* ─── Slide animation ─── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

/* ─── Counter ─── */
const Counter = ({
  label, icon, value, onChange, min = 0, max = 12,
}: {
  label: string; icon: React.ReactNode; value: number;
  onChange: (v: number) => void; min?: number; max?: number;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gold)/.08)] flex items-center justify-center text-[hsl(var(--gold-dark))]">
        {icon}
      </div>
      <span className="font-display text-lg text-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-[hsl(var(--gold)/.08)] disabled:opacity-30 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-display-bold text-xl w-8 text-center text-foreground">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-[hsl(var(--gold)/.08)] disabled:opacity-30 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* ─── Main Wizard ─── */
interface DreamVacationWizardProps {
  open: boolean;
  onClose: () => void;
}

const DreamVacationWizard = ({ open, onClose }: DreamVacationWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // State
  const [destination, setDestination] = useState<"wdw" | "dlr" | null>(null);
  const [arrival, setArrival] = useState<Date | undefined>();
  const [departure, setDeparture] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [stroller, setStroller] = useState(false);
  const [ecv, setEcv] = useState(false);
  const [vibes, setVibes] = useState<string[]>([]);
  const [planStyle, setPlanStyle] = useState<"a" | "b" | null>(null);
  const [generating, setGenerating] = useState(false);

  const updateChildren = (count: number) => {
    setChildren(count);
    setChildAges((prev) =>
      count > prev.length
        ? [...prev, ...Array(count - prev.length).fill(5)]
        : prev.slice(0, count),
    );
  };

  const toggleVibe = (id: string) =>
    setVibes((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const next = () => {
    if (step < TOTAL) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      // Generate
      setGenerating(true);
      setTimeout(() => {
        navigate("/trip/dream-generated", {
          state: {
            generated: true,
            destination,
            arrival,
            departure,
            adults,
            children,
            childAges,
            stroller,
            ecv,
            vibes,
            planStyle,
          },
        });
      }, 3000);
    }
  };

  const back = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!destination;
      case 2: return !!arrival && !!departure;
      case 3: return adults >= 1;
      case 4: return vibes.length > 0;
      case 5: return !!planStyle;
      default: return false;
    }
  };

  const crowd = getCrowdLevel(arrival, departure);

  if (!open) return null;

  /* ─── Generating overlay ─── */
  if (generating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-[hsl(var(--ink))] flex flex-col items-center justify-center"
      >
        <SparkleField count={20} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-[hsl(var(--gold)/.2)] border-t-[hsl(var(--gold))] mb-8"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display-bold text-2xl text-white mb-3 text-center px-6"
        >
          Your Concierge is drafting your perfect day…
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-editorial text-white/50 text-sm"
        >
          Matching {vibes.length} preferences across {destination === "wdw" ? "4 parks" : "2 parks"}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[hsl(var(--warm))] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <button onClick={step > 1 ? back : onClose} className="label-text text-muted-foreground hover:text-foreground transition-colors">
          {step > 1 ? "← Back" : "Cancel"}
        </button>
        <span className="label-text text-[hsl(var(--gold-dark))]">Step {step} of {TOTAL}</span>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[hsl(var(--gold)/.08)]">
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold-light)))" }}
          animate={{ width: `${(step / TOTAL) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ─── Step 1: Destination ─── */}
            {step === 1 && (
              <motion.div
                key="s1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="font-display-bold text-2xl md:text-3xl text-foreground mb-2 text-center">
                  Where are you going?
                </h2>
                <p className="font-editorial text-muted-foreground text-center mb-8">
                  Choose your Disney destination.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      id: "wdw" as const,
                      name: "Walt Disney World",
                      location: "Orlando, Florida",
                      parks: "4 theme parks · 2 water parks",
                      emoji: "🏰",
                    },
                    {
                      id: "dlr" as const,
                      name: "Disneyland Resort",
                      location: "Anaheim, California",
                      parks: "2 theme parks",
                      emoji: "🏰",
                    },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDestination(d.id)}
                      className={cn(
                        "relative rounded-xl border-2 p-6 text-left transition-all duration-300 bg-card shadow-[var(--shadow-soft)]",
                        destination === d.id
                          ? "border-[hsl(var(--gold))] scale-[1.03] shadow-[0_0_0_1px_hsl(var(--gold)/.3)]"
                          : "border-border hover:border-[hsl(var(--gold)/.3)] hover:scale-[1.01]",
                      )}
                    >
                      <div className="text-4xl mb-4">{d.emoji}</div>
                      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-[hsl(var(--lapis)/.08)] to-[hsl(var(--gold)/.05)] mb-4 flex items-center justify-center">
                        <span className="label-text text-[hsl(var(--gold-dark))]">{d.location}</span>
                      </div>
                      <p className="font-display-bold text-lg text-foreground mb-1">{d.name}</p>
                      <p className="font-editorial text-xs text-muted-foreground">{d.parks}</p>
                      {destination === d.id && (
                        <motion.div
                          layoutId="dest-check"
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── Step 2: Dates ─── */}
            {step === 2 && (
              <motion.div
                key="s2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="font-display-bold text-2xl md:text-3xl text-foreground mb-2 text-center">
                  When are you going?
                </h2>
                <p className="font-editorial text-muted-foreground text-center mb-8">
                  Select your arrival and departure dates.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <span className="label-text text-[hsl(var(--gold-dark))] block mb-3">Arrival</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-editorial">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {arrival ? format(arrival, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={arrival}
                          onSelect={setArrival}
                          disabled={(d) => d < new Date()}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <span className="label-text text-[hsl(var(--gold-dark))] block mb-3">Departure</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-editorial">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {departure ? format(departure, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={departure}
                          onSelect={setDeparture}
                          disabled={(d) => d < (arrival || new Date())}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {crowd && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-2"
                  >
                    <Badge variant="outline" className={cn("font-editorial text-xs px-3 py-1", crowd.color, crowd.bg, "border-0")}>
                      {crowd.label}
                    </Badge>
                    <span className="font-editorial text-xs text-muted-foreground">
                      These dates are {crowd.label.toLowerCase()} — {crowd.label.includes("Low") ? "great choice!" : crowd.label.includes("High") ? "consider adjusting if flexible." : "a solid pick."}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── Step 3: Party ─── */}
            {step === 3 && (
              <motion.div
                key="s3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="font-display-bold text-2xl md:text-3xl text-foreground mb-2 text-center">
                  Who's coming?
                </h2>
                <p className="font-editorial text-muted-foreground text-center mb-8">
                  We'll optimize ride suggestions, walking routes, and dining for your group.
                </p>

                <div className="space-y-4">
                  <Counter label="Adults" icon={<Users className="w-5 h-5" />} value={adults} onChange={setAdults} min={1} max={12} />
                  <Counter label="Children" icon={<Baby className="w-5 h-5" />} value={children} onChange={updateChildren} min={0} max={10} />

                  {children > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                    >
                      <p className="label-text text-[hsl(var(--gold-dark))] mb-3">Child ages</p>
                      <div className="space-y-3">
                        {childAges.map((age, i) => (
                          <div key={i} className="flex items-center gap-2 flex-wrap">
                            <span className="font-editorial text-sm text-muted-foreground w-16 shrink-0">Child {i + 1}:</span>
                            <div className="flex gap-1 flex-wrap">
                              {Array.from({ length: 17 }, (_, a) => a + 1).map((a) => (
                                <button
                                  key={a}
                                  onClick={() => {
                                    const next = [...childAges];
                                    next[i] = a;
                                    setChildAges(next);
                                  }}
                                  className={cn(
                                    "w-7 h-7 rounded-md text-xs font-medium transition-colors",
                                    age === a
                                      ? "bg-[hsl(var(--gold))] text-white"
                                      : "bg-secondary text-foreground hover:bg-[hsl(var(--gold)/.15)]",
                                  )}
                                >
                                  {a}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🚼</span>
                        <span className="font-display text-base text-foreground">Stroller</span>
                      </div>
                      <Switch checked={stroller} onCheckedChange={setStroller} />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">♿</span>
                        <span className="font-display text-base text-foreground">ECV</span>
                      </div>
                      <Switch checked={ecv} onCheckedChange={setEcv} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Step 4: Vibes ─── */}
            {step === 4 && (
              <motion.div
                key="s4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="font-display-bold text-2xl md:text-3xl text-foreground mb-2 text-center">
                  What matters most?
                </h2>
                <p className="font-editorial text-muted-foreground text-center mb-8">
                  Select all that speak to you. We'll balance your days.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VIBES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => toggleVibe(v.id)}
                      className={cn(
                        "relative rounded-xl border-2 p-5 text-center transition-all duration-300 bg-card shadow-[var(--shadow-soft)]",
                        vibes.includes(v.id)
                          ? "border-[hsl(var(--gold))] scale-[1.03]"
                          : "border-border hover:border-[hsl(var(--gold)/.3)]",
                      )}
                    >
                      <div className="text-3xl mb-3">{v.emoji}</div>
                      <p className="font-display text-sm text-foreground">{v.label}</p>
                      {vibes.includes(v.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── Step 5: Plan Style ─── */}
            {step === 5 && (
              <motion.div
                key="s5"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
              >
                <h2 className="font-display-bold text-2xl md:text-3xl text-foreground mb-2 text-center">
                  How much help do you want?
                </h2>
                <p className="font-editorial text-muted-foreground text-center mb-8">
                  You can always change this later.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      id: "a" as const,
                      title: "I'll Drive",
                      desc: "Show me the data and tools. I'll build my own plan.",
                      icon: <Compass className="w-8 h-8" />,
                    },
                    {
                      id: "b" as const,
                      title: "You Drive",
                      desc: "Just tell me what to do. I trust the Concierge.",
                      icon: <BellRing className="w-8 h-8" />,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPlanStyle(opt.id)}
                      className={cn(
                        "relative rounded-xl border-2 p-6 text-left transition-all duration-300 bg-card shadow-[var(--shadow-soft)]",
                        planStyle === opt.id
                          ? "border-[hsl(var(--gold))] scale-[1.03] shadow-[0_0_0_1px_hsl(var(--gold)/.3)]"
                          : "border-border hover:border-[hsl(var(--gold)/.3)] hover:scale-[1.01]",
                      )}
                    >
                      <div className="text-[hsl(var(--gold-dark))] mb-4">{opt.icon}</div>
                      <p className="font-display-bold text-lg text-foreground mb-2">{opt.title}</p>
                      <p className="font-editorial text-sm text-muted-foreground leading-relaxed">{opt.desc}</p>
                      {planStyle === opt.id && (
                        <motion.div
                          layoutId="style-check"
                          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with dots + CTA */}
      <div className="border-t border-border/50 px-6 py-5 flex items-center justify-between">
        {/* Progress dots */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i + 1 === step
                  ? "bg-[hsl(var(--gold))] w-6"
                  : i + 1 < step
                    ? "bg-[hsl(var(--gold)/.5)]"
                    : "bg-[hsl(var(--gold)/.15)]",
              )}
            />
          ))}
        </div>

        <Button
          onClick={next}
          disabled={!canProceed()}
          className="bg-[hsl(var(--ink))] text-white font-display px-7 py-5 text-sm rounded-xl disabled:opacity-40 hover:bg-[hsl(var(--ink))]/90"
        >
          {step === TOTAL ? (
            <>Build My Plan <Sparkles className="w-4 h-4 ml-1" /></>
          ) : (
            <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default DreamVacationWizard;
