import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Users, MapPin, Calendar, Utensils, Star, Check, Sun, Moon } from "lucide-react";
import Footer from "@/components/Footer";

/* ── Types ── */
type Step = "welcome" | "who" | "when" | "where" | "vibe" | "dining" | "dreams" | "preview";

interface TravelerInfo {
  adults: number;
  kids: number;
  kidAges: string;
  firstTime: boolean | null;
}

interface TripDates {
  month: string;
  duration: number;
}

interface ParkChoice {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  selected: boolean;
}

interface VibeChoice {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  selected: boolean;
}

interface DiningPref {
  id: string;
  label: string;
  emoji: string;
  selected: boolean;
}

interface DreamItem {
  id: string;
  label: string;
  emoji: string;
  category: string;
  selected: boolean;
}

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const stepOrder: Step[] = ["welcome", "who", "when", "where", "vibe", "dining", "dreams", "preview"];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const durations = [
  { days: 3, label: "Long Weekend", sub: "3 days" },
  { days: 5, label: "Classic Trip", sub: "5 days" },
  { days: 7, label: "Full Week", sub: "7 days" },
  { days: 10, label: "Grand Adventure", sub: "10 days" },
];

const initialParks: ParkChoice[] = [
  { id: "mk", name: "Magic Kingdom", tagline: "The storybook heart of it all", emoji: "🏰", selected: false },
  { id: "epcot", name: "EPCOT", tagline: "Innovation, world culture & festivals", emoji: "🌍", selected: false },
  { id: "hs", name: "Hollywood Studios", tagline: "Star Wars, Toy Story & thrills", emoji: "🎬", selected: false },
  { id: "ak", name: "Animal Kingdom", tagline: "Pandora, safaris & nature", emoji: "🦁", selected: false },
  { id: "dl", name: "Disneyland", tagline: "Walt's original dream", emoji: "✨", selected: false },
  { id: "dca", name: "California Adventure", tagline: "Pixar, Marvel & Radiator Springs", emoji: "🎡", selected: false },
];

const initialVibes: VibeChoice[] = [
  { id: "thrill", label: "Thrill Seekers", emoji: "🎢", desc: "Coasters, drops & adrenaline", selected: false },
  { id: "magic", label: "Classic Magic", emoji: "✨", desc: "Parades, characters & nostalgia", selected: false },
  { id: "foodie", label: "Foodie Adventure", emoji: "🍽️", desc: "Signature dining & snack crawls", selected: false },
  { id: "relaxed", label: "Easy & Relaxed", emoji: "🌿", desc: "Pool days, slow mornings & no rushing", selected: false },
  { id: "littles", label: "Little Ones First", emoji: "👶", desc: "Toddler-friendly, stroller pace", selected: false },
  { id: "photo", label: "Memory Makers", emoji: "📸", desc: "Every photo spot, every angle", selected: false },
];

const initialDining: DiningPref[] = [
  { id: "character", label: "Character Dining", emoji: "🐭", selected: false },
  { id: "signature", label: "Signature / Fine Dining", emoji: "🥂", selected: false },
  { id: "quickservice", label: "Quick Service Only", emoji: "🍔", selected: false },
  { id: "snacks", label: "Snack Crawl", emoji: "🍦", selected: false },
  { id: "fireworks", label: "Fireworks Dining", emoji: "🎆", selected: false },
  { id: "flexible", label: "Mix of Everything", emoji: "🎯", selected: false },
];

const initialDreams: DreamItem[] = [
  { id: "castle-photo", label: "Castle Photo at Sunrise", emoji: "🏰", category: "Moments", selected: false },
  { id: "fireworks", label: "Watch Fireworks from Main Street", emoji: "🎆", category: "Moments", selected: false },
  { id: "space-mountain", label: "Ride Space Mountain", emoji: "🚀", category: "Rides", selected: false },
  { id: "rise-resistance", label: "Star Wars: Rise of the Resistance", emoji: "⚔️", category: "Rides", selected: false },
  { id: "flight-passage", label: "Avatar Flight of Passage", emoji: "🌊", category: "Rides", selected: false },
  { id: "tron", label: "TRON Lightcycle / Run", emoji: "💡", category: "Rides", selected: false },
  { id: "guardians", label: "Guardians of the Galaxy", emoji: "🌌", category: "Rides", selected: false },
  { id: "be-our-guest", label: "Dine at Be Our Guest", emoji: "🥀", category: "Dining", selected: false },
  { id: "ohana", label: "Breakfast at 'Ohana", emoji: "🌺", category: "Dining", selected: false },
  { id: "dole-whip", label: "Get a Dole Whip", emoji: "🍍", category: "Snacks", selected: false },
  { id: "churro", label: "Eat a Churro", emoji: "🍩", category: "Snacks", selected: false },
  { id: "meet-mickey", label: "Meet Mickey Mouse", emoji: "🐭", category: "Characters", selected: false },
  { id: "galaxy-edge", label: "Explore Galaxy's Edge", emoji: "🌟", category: "Lands", selected: false },
  { id: "pandora", label: "Walk Through Pandora at Night", emoji: "🌙", category: "Lands", selected: false },
  { id: "pool-day", label: "Resort Pool Day", emoji: "🏊", category: "Relaxation", selected: false },
  { id: "disney-springs", label: "Disney Springs Shopping", emoji: "🛍️", category: "Extras", selected: false },
];

/* ── Component ── */
const DreamPlanner = () => {
  const [step, setStep] = useState<Step>("welcome");
  const [travelers, setTravelers] = useState<TravelerInfo>({ adults: 2, kids: 0, kidAges: "", firstTime: null });
  const [dates, setDates] = useState<TripDates>({ month: "", duration: 5 });
  const [parks, setParks] = useState<ParkChoice[]>(initialParks);
  const [vibes, setVibes] = useState<VibeChoice[]>(initialVibes);
  const [dining, setDining] = useState<DiningPref[]>(initialDining);
  const [dreams, setDreams] = useState<DreamItem[]>(initialDreams);

  const currentIndex = stepOrder.indexOf(step);
  const progress = ((currentIndex) / (stepOrder.length - 1)) * 100;

  const next = () => {
    const i = stepOrder.indexOf(step);
    if (i < stepOrder.length - 1) setStep(stepOrder[i + 1]);
  };
  const back = () => {
    const i = stepOrder.indexOf(step);
    if (i > 0) setStep(stepOrder[i - 1]);
  };

  const togglePark = (id: string) => setParks(p => p.map(pk => pk.id === id ? { ...pk, selected: !pk.selected } : pk));
  const toggleVibe = (id: string) => setVibes(v => v.map(vb => vb.id === id ? { ...vb, selected: !vb.selected } : vb));
  const toggleDining = (id: string) => setDining(d => d.map(dn => dn.id === id ? { ...dn, selected: !dn.selected } : dn));
  const toggleDream = (id: string) => setDreams(d => d.map(dr => dr.id === id ? { ...dr, selected: !dr.selected } : dr));

  const selectedParks = parks.filter(p => p.selected);
  const selectedVibes = vibes.filter(v => v.selected);
  const selectedDining = dining.filter(d => d.selected);
  const selectedDreams = dreams.filter(d => d.selected);

  const canProceed = () => {
    switch (step) {
      case "welcome": return true;
      case "who": return travelers.adults > 0 && travelers.firstTime !== null;
      case "when": return dates.month !== "" && dates.duration > 0;
      case "where": return selectedParks.length > 0;
      case "vibe": return selectedVibes.length > 0;
      case "dining": return selectedDining.length > 0;
      case "dreams": return true;
      default: return true;
    }
  };

  const stepLabel = () => {
    switch (step) {
      case "welcome": return "";
      case "who": return "Your Party";
      case "when": return "Timing";
      case "where": return "Parks";
      case "vibe": return "Style";
      case "dining": return "Dining";
      case "dreams": return "Dreams";
      case "preview": return "Your Plan";
    }
  };

  /* ── Generate mock day-by-day plan ── */
  const generatePlan = () => {
    const parkPool = selectedParks.length > 0 ? selectedParks : [{ name: "Magic Kingdom", emoji: "🏰" }];
    const days: { day: number; park: string; emoji: string; morning: string; afternoon: string; evening: string }[] = [];
    const dreamPool = [...selectedDreams];

    for (let d = 0; d < dates.duration; d++) {
      const park = parkPool[d % parkPool.length];
      const dayDreams = dreamPool.splice(0, 2);
      const isPoolDay = selectedVibes.some(v => v.id === "relaxed") && d === Math.floor(dates.duration / 2);

      days.push({
        day: d + 1,
        park: isPoolDay ? "Resort Pool Day 🏊" : park.name,
        emoji: isPoolDay ? "🏊" : park.emoji,
        morning: isPoolDay
          ? "Sleep in, resort breakfast"
          : dayDreams[0]?.label || "Rope drop — hit the top rides early",
        afternoon: isPoolDay
          ? "Pool time & relaxation"
          : dayDreams[1]?.label || "Explore the land, grab snacks",
        evening: isPoolDay
          ? "Disney Springs dinner & shopping"
          : selectedDining.length > 0
            ? `${selectedDining[d % selectedDining.length]?.label || "Dinner"} → Fireworks`
            : "Dinner → Stay for fireworks",
      });
    }
    return days;
  };

  const slideAnim = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.5, ease },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      {step !== "welcome" && (
        <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-border">
          <motion.div
            className="h-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-light))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease }}
          />
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 sm:px-8 pt-24 pb-20 min-h-[80vh] flex flex-col">
        {/* Step label */}
        {step !== "welcome" && step !== "preview" && (
          <div className="flex items-center gap-3 mb-2">
            <span className="label-text text-[hsl(var(--gold))]">{stepLabel()}</span>
            <span className="label-text">Step {currentIndex} of {stepOrder.length - 1}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ── WELCOME ── */}
            {step === "welcome" && (
              <motion.div key="welcome" {...slideAnim} className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease }}
                  className="w-20 h-20 rounded-full bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.2)] flex items-center justify-center mx-auto mb-8"
                >
                  <Sparkles className="w-8 h-8 text-[hsl(var(--gold))]" />
                </motion.div>
                <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
                  Let's Plan Your Dream Vacation
                </h1>
                <p className="font-editorial text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-3">
                  No stress. No spreadsheets. Just a few questions about what excites you — and we'll craft a day-by-day plan you'll actually love.
                </p>
                <p className="font-editorial text-sm text-muted-foreground/60 mb-10">
                  Takes about 3 minutes ✨
                </p>
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity"
                >
                  Let's Begin <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── WHO ── */}
            {step === "who" && (
              <motion.div key="who" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">Who's coming along?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">This helps us tailor ride suggestions, dining, and pacing.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-[hsl(var(--lavender))]" />
                      <span className="label-text">Adults</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setTravelers(t => ({ ...t, adults: Math.max(1, t.adults - 1) }))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center font-editorial text-lg hover:bg-muted transition-colors">−</button>
                      <span className="font-display text-2xl text-foreground w-8 text-center">{travelers.adults}</span>
                      <button onClick={() => setTravelers(t => ({ ...t, adults: t.adults + 1 }))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center font-editorial text-lg hover:bg-muted transition-colors">+</button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-[hsl(var(--coral))]" />
                      <span className="label-text">Kids</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setTravelers(t => ({ ...t, kids: Math.max(0, t.kids - 1) }))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center font-editorial text-lg hover:bg-muted transition-colors">−</button>
                      <span className="font-display text-2xl text-foreground w-8 text-center">{travelers.kids}</span>
                      <button onClick={() => setTravelers(t => ({ ...t, kids: t.kids + 1 }))} className="w-9 h-9 rounded-lg border border-border flex items-center justify-center font-editorial text-lg hover:bg-muted transition-colors">+</button>
                    </div>
                  </div>
                </div>

                {travelers.kids > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                    <label className="label-text mb-2 block">Ages of kids (helps with ride eligibility)</label>
                    <input
                      type="text"
                      value={travelers.kidAges}
                      onChange={e => setTravelers(t => ({ ...t, kidAges: e.target.value }))}
                      placeholder="e.g., 4, 7, 12"
                      className="w-full bg-transparent border-b border-border font-editorial text-sm text-foreground py-2 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors placeholder:text-muted-foreground/40"
                    />
                  </motion.div>
                )}

                <div>
                  <p className="font-editorial text-sm text-foreground mb-3">Is this anyone's first Disney trip?</p>
                  <div className="flex gap-3">
                    {[
                      { val: true, label: "Yes! First timers ✨", sub: "We'll make sure you hit the essentials" },
                      { val: false, label: "We've been before", sub: "We'll help you discover something new" },
                    ].map(opt => (
                      <button
                        key={String(opt.val)}
                        onClick={() => setTravelers(t => ({ ...t, firstTime: opt.val }))}
                        className={`flex-1 rounded-lg border p-4 text-left transition-all duration-300 ${travelers.firstTime === opt.val
                          ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                          : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                        }`}
                      >
                        <p className="font-editorial text-sm text-foreground">{opt.label}</p>
                        <p className="font-editorial text-xs text-muted-foreground mt-1">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── WHEN ── */}
            {step === "when" && (
              <motion.div key="when" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">When are you dreaming of going?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">No exact dates needed yet — just a general window.</p>
                </div>

                <div>
                  <p className="label-text mb-3">Month</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {months.map(m => (
                      <button
                        key={m}
                        onClick={() => setDates(d => ({ ...d, month: m }))}
                        className={`rounded-lg border px-3 py-2.5 font-editorial text-sm transition-all duration-300 ${dates.month === m
                          ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] text-foreground shadow-[var(--shadow-soft)]"
                          : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--gold)/0.3)]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-text mb-3">How long?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {durations.map(dur => (
                      <button
                        key={dur.days}
                        onClick={() => setDates(d => ({ ...d, duration: dur.days }))}
                        className={`rounded-lg border p-4 text-left transition-all duration-300 ${dates.duration === dur.days
                          ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                          : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                        }`}
                      >
                        <p className="font-editorial text-sm text-foreground">{dur.label}</p>
                        <p className="font-editorial text-xs text-muted-foreground">{dur.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {dates.month && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-[hsl(var(--sky)/0.06)] border border-[hsl(var(--sky)/0.15)] p-4">
                    <p className="font-editorial text-xs text-[hsl(var(--sky))]">
                      💡 <strong>{dates.month}</strong> is a {["June", "July", "December"].includes(dates.month) ? "peak season — expect higher crowds but longer park hours and special events" : ["January", "February", "September"].includes(dates.month) ? "low season — smaller crowds and shorter wait times" : "moderate season — a solid balance of crowds and weather"}.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── WHERE ── */}
            {step === "where" && (
              <motion.div key="where" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">Which parks are calling you?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">Pick as many as you'd like — we'll help you spread them across your days.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parks.map(park => (
                    <button
                      key={park.id}
                      onClick={() => togglePark(park.id)}
                      className={`rounded-lg border p-5 text-left transition-all duration-300 relative overflow-hidden ${park.selected
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                        : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                      }`}
                    >
                      {park.selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-2xl mb-2 block">{park.emoji}</span>
                      <p className="font-display text-base text-foreground">{park.name}</p>
                      <p className="font-editorial text-xs text-muted-foreground mt-1">{park.tagline}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── VIBE ── */}
            {step === "vibe" && (
              <motion.div key="vibe" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">What's the vibe?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">Pick everything that sounds like your kind of day. This shapes the pace and priorities.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vibes.map(vibe => (
                    <button
                      key={vibe.id}
                      onClick={() => toggleVibe(vibe.id)}
                      className={`rounded-lg border p-5 text-left transition-all duration-300 relative ${vibe.selected
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                        : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                      }`}
                    >
                      {vibe.selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-xl mb-1 block">{vibe.emoji}</span>
                      <p className="font-editorial text-sm text-foreground font-medium">{vibe.label}</p>
                      <p className="font-editorial text-xs text-muted-foreground mt-0.5">{vibe.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── DINING ── */}
            {step === "dining" && (
              <motion.div key="dining" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">How do you like to eat?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">Dining can make or break a Disney day. Let us know your style.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dining.map(d => (
                    <button
                      key={d.id}
                      onClick={() => toggleDining(d.id)}
                      className={`rounded-lg border p-5 text-left transition-all duration-300 relative ${d.selected
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                        : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                      }`}
                    >
                      {d.selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-xl">{d.emoji}</span>
                      <p className="font-editorial text-sm text-foreground font-medium mt-1">{d.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── DREAMS ── */}
            {step === "dreams" && (
              <motion.div key="dreams" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">The dream list</h2>
                  <p className="font-editorial text-sm text-muted-foreground">
                    What moments would make this trip unforgettable? Pick everything that excites you — we'll weave them into your days.
                  </p>
                </div>

                {["Moments", "Rides", "Dining", "Snacks", "Characters", "Lands", "Relaxation", "Extras"].map(cat => {
                  const items = dreams.filter(d => d.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="label-text mb-3">{cat}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(dream => (
                          <button
                            key={dream.id}
                            onClick={() => toggleDream(dream.id)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border font-editorial text-sm transition-all duration-300 ${dream.selected
                              ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)] text-foreground shadow-[var(--shadow-soft)]"
                              : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--gold)/0.3)]"
                            }`}
                          >
                            <span>{dream.emoji}</span>
                            <span>{dream.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ── PREVIEW ── */}
            {step === "preview" && (
              <motion.div key="preview" {...slideAnim} className="space-y-8">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, ease }}
                    className="w-16 h-16 rounded-full bg-[hsl(var(--mint)/0.1)] border border-[hsl(var(--mint)/0.2)] flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-7 h-7 text-[hsl(var(--mint))]" />
                  </motion.div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">Your Dream Vacation</h2>
                  <p className="font-editorial text-sm text-muted-foreground">
                    {dates.duration} days in {dates.month} · {travelers.adults} adult{travelers.adults > 1 ? "s" : ""}{travelers.kids > 0 ? ` + ${travelers.kids} kid${travelers.kids > 1 ? "s" : ""}` : ""} · {selectedParks.map(p => p.name).join(", ")}
                  </p>
                </div>

                {/* Day-by-day plan */}
                <div className="space-y-4">
                  {generatePlan().map((day, i) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease }}
                      className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{day.emoji}</span>
                          <div>
                            <p className="label-text text-[hsl(var(--gold))]">Day {day.day}</p>
                            <p className="font-display text-lg text-foreground">{day.park}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Sun className="w-3 h-3 text-[hsl(var(--sunshine))]" />
                            <span className="label-text text-[0.6rem]">Morning</span>
                          </div>
                          <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{day.morning}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[hsl(var(--coral))]" />
                            <span className="label-text text-[0.6rem]">Afternoon</span>
                          </div>
                          <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{day.afternoon}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Moon className="w-3 h-3 text-[hsl(var(--lavender))]" />
                            <span className="label-text text-[0.6rem]">Evening</span>
                          </div>
                          <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{day.evening}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Vibes & dreams summary */}
                {(selectedVibes.length > 0 || selectedDreams.length > 0) && (
                  <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                    {selectedVibes.length > 0 && (
                      <div className="mb-4">
                        <p className="label-text mb-2">Your Vibe</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedVibes.map(v => (
                            <span key={v.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[hsl(var(--lavender)/0.08)] border border-[hsl(var(--lavender)/0.15)] font-editorial text-xs text-[hsl(var(--lavender))]">
                              {v.emoji} {v.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDreams.length > 0 && (
                      <div>
                        <p className="label-text mb-2">Dream List Included</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedDreams.map(d => (
                            <span key={d.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.15)] font-editorial text-xs text-[hsl(var(--gold))]">
                              {d.emoji} {d.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="text-center pt-4">
                  <Link
                    to="/adventure"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity"
                  >
                    Create This Trip <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="font-editorial text-xs text-muted-foreground mt-3">
                    This will add it to your Trips Hub where you can fine-tune every detail.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        {step !== "welcome" && (
          <div className="flex items-center justify-between pt-8 mt-auto">
            <button onClick={back} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border font-editorial text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step !== "preview" && (
              <button
                onClick={next}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DreamPlanner;
