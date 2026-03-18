import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Users, MapPin, Calendar, Utensils, Star, Check, Sun, Moon } from "lucide-react";
import Footer from "@/components/Footer";

/* ── Types ── */
type Resort = "wdw" | "dlr" | null;
type Step = "welcome" | "who" | "when" | "resort" | "where" | "vibe" | "dining" | "dreams" | "preview";

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
  resort: "wdw" | "dlr";
  tagline: string;
  emoji: string;
  selected: boolean;
  highlights: string[];
  bestFor: string;
  mustDo: string;
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
  why: string;
  park: string;
  resort: "wdw" | "dlr" | "both";
}

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const stepOrder: Step[] = ["welcome", "who", "when", "resort", "where", "vibe", "dining", "dreams", "preview"];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const durations = [
  { days: 3, label: "Long Weekend", sub: "3 days" },
  { days: 5, label: "Classic Trip", sub: "5 days" },
  { days: 7, label: "Full Week", sub: "7 days" },
  { days: 10, label: "Grand Adventure", sub: "10 days" },
];

const allParks: ParkChoice[] = [
  {
    id: "mk", name: "Magic Kingdom", resort: "wdw", emoji: "🏰", selected: false,
    tagline: "The storybook heart of Walt Disney World",
    highlights: ["Cinderella Castle", "Space Mountain", "Haunted Mansion", "Happily Ever After fireworks"],
    bestFor: "First-timers, families with kids of any age, classic Disney magic",
    mustDo: "Watch the fireworks from Main Street U.S.A. — it's a once-in-a-lifetime feeling.",
  },
  {
    id: "epcot", name: "EPCOT", resort: "wdw", emoji: "🌍", selected: false,
    tagline: "World culture, festivals, innovation & incredible food",
    highlights: ["World Showcase (11 countries to explore)", "Guardians of the Galaxy coaster", "Frozen Ever After", "Food & Wine Festival"],
    bestFor: "Foodies, adults, couples, older kids who love exploring cultures",
    mustDo: "Walk the World Showcase — each country has unique food, drinks, and entertainment.",
  },
  {
    id: "hs", name: "Hollywood Studios", resort: "wdw", emoji: "🎬", selected: false,
    tagline: "Star Wars, Toy Story, and the biggest thrills at WDW",
    highlights: ["Star Wars: Galaxy's Edge", "Rise of the Resistance", "Tower of Terror", "Toy Story Land"],
    bestFor: "Star Wars fans, thrill seekers, movie lovers",
    mustDo: "Rise of the Resistance is widely considered the best ride Disney has ever built.",
  },
  {
    id: "ak", name: "Animal Kingdom", resort: "wdw", emoji: "🦁", selected: false,
    tagline: "Pandora, real safaris, and breathtaking nature",
    highlights: ["Avatar Flight of Passage", "Kilimanjaro Safaris", "Pandora (glows at night)", "Expedition Everest"],
    bestFor: "Nature lovers, Avatar fans, families wanting something different",
    mustDo: "Visit Pandora after dark — the bioluminescent plants are absolutely magical.",
  },
  {
    id: "dl", name: "Disneyland Park", resort: "dlr", emoji: "✨", selected: false,
    tagline: "Walt's original park — where it all started in 1955",
    highlights: ["Matterhorn Bobsleds", "Pirates of the Caribbean", "Indiana Jones Adventure", "Fantasmic!"],
    bestFor: "First-timers, Disney history lovers, families — it's the most charming park",
    mustDo: "Walk through Sleeping Beauty Castle — it's intimate and magical unlike anything at WDW.",
  },
  {
    id: "dca", name: "Disney California Adventure", resort: "dlr", emoji: "🎡", selected: false,
    tagline: "Pixar, Marvel, incredible rides, and the best food at Disneyland Resort",
    highlights: ["Radiator Springs Racers", "Incredicoaster", "Web Slingers", "Cars Land at night"],
    bestFor: "Thrill seekers, Pixar fans, foodies who want great quick-service options",
    mustDo: "See Cars Land after sunset — the neon glow turns it into a real-life Radiator Springs.",
  },
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

const allDreams: DreamItem[] = [
  // WDW
  { id: "castle-photo", label: "Castle Photo at Sunrise", emoji: "🏰", category: "Moments", selected: false, resort: "wdw", park: "Magic Kingdom", why: "The park opens early for resort guests — you can get a photo in front of Cinderella Castle with almost no one around." },
  { id: "fireworks", label: "Happily Ever After Fireworks", emoji: "🎆", category: "Moments", selected: false, resort: "wdw", park: "Magic Kingdom", why: "Projections on the castle + fireworks + music — many people say it's the most emotional Disney experience." },
  { id: "space-mountain", label: "Ride Space Mountain", emoji: "🚀", category: "Rides", selected: false, resort: "wdw", park: "Magic Kingdom", why: "A classic indoor roller coaster in near-total darkness. Not too intense — great for first-time thrill riders." },
  { id: "rise-resistance", label: "Rise of the Resistance", emoji: "⚔️", category: "Rides", selected: false, resort: "wdw", park: "Hollywood Studios", why: "Widely considered the best ride ever built. You're captured by the First Order in a fully immersive 18-minute experience." },
  { id: "flight-passage", label: "Avatar Flight of Passage", emoji: "🌊", category: "Rides", selected: false, resort: "wdw", park: "Animal Kingdom", why: "You ride on the back of a banshee over Pandora. The wind, mist, and scents make it feel shockingly real." },
  { id: "tron", label: "TRON Lightcycle / Run", emoji: "💡", category: "Rides", selected: false, resort: "wdw", park: "Magic Kingdom", why: "Disney's fastest coaster — you lean forward on a motorcycle-style vehicle and launch into the Grid." },
  { id: "guardians", label: "Guardians of the Galaxy: Cosmic Rewind", emoji: "🌌", category: "Rides", selected: false, resort: "wdw", park: "EPCOT", why: "The first reverse-launch Disney coaster. Each ride plays a different classic rock song — it's a total blast." },
  { id: "be-our-guest", label: "Dine at Be Our Guest", emoji: "🥀", category: "Dining", selected: false, resort: "wdw", park: "Magic Kingdom", why: "Eat inside Beast's Castle. Three themed rooms including the magical West Wing with a enchanted rose. Book early — it sells out fast." },
  { id: "ohana", label: "Breakfast at 'Ohana", emoji: "🌺", category: "Dining", selected: false, resort: "wdw", park: "Polynesian Resort", why: "All-you-can-eat Hawaiian breakfast with Stitch and Lilo visiting your table. The pog juice and macadamia pancakes are legendary." },
  { id: "space-220", label: "Lunch at Space 220", emoji: "🚀", category: "Dining", selected: false, resort: "wdw", park: "EPCOT", why: "You take an elevator 'to space' and dine in a space station overlooking Earth. The simulated views are jaw-dropping." },
  { id: "dole-whip", label: "Get a Dole Whip", emoji: "🍍", category: "Snacks", selected: false, resort: "both", park: "Magic Kingdom / Disneyland", why: "Pineapple soft-serve — the #1 fan-favorite Disney snack. Available at Aloha Isle. Best on a hot day." },
  { id: "churro", label: "Eat a Churro", emoji: "🥖", category: "Snacks", selected: false, resort: "both", park: "All parks", why: "Warm, cinnamon-sugar perfection. Disney churros hit different — seasonal flavors appear around holidays." },
  { id: "meet-mickey", label: "Meet Mickey Mouse", emoji: "🐭", category: "Characters", selected: false, resort: "both", park: "Magic Kingdom / Disneyland", why: "A face-to-face moment with the mouse himself. He talks and interacts now — magical for kids and adults alike." },
  { id: "galaxy-edge", label: "Explore Galaxy's Edge", emoji: "🌟", category: "Lands", selected: false, resort: "both", park: "Hollywood Studios / Disneyland", why: "Walk through the planet Batuu — build a custom lightsaber ($250, but unforgettable), mix blue/green milk, and fly the Millennium Falcon." },
  { id: "pandora", label: "Pandora at Night", emoji: "🌙", category: "Lands", selected: false, resort: "wdw", park: "Animal Kingdom", why: "The entire land glows with bioluminescent plants after dark. Walk through slowly — it's one of Disney's most beautiful environments." },
  { id: "world-showcase", label: "Eat Around the World", emoji: "🌎", category: "Dining", selected: false, resort: "wdw", park: "EPCOT", why: "11 countries, each with authentic food and drinks. Split small plates across Mexico, Japan, France, and more — the ultimate food crawl." },
  { id: "pool-day", label: "Resort Pool Day", emoji: "🏊", category: "Relaxation", selected: false, resort: "both", park: "Your Resort", why: "Disney resort pools have slides, lazy rivers, and poolside bars. A mid-trip rest day makes the other park days SO much better." },
  { id: "disney-springs", label: "Disney Springs / Downtown Disney", emoji: "🛍️", category: "Extras", selected: false, resort: "both", park: "No ticket needed", why: "Free-admission shopping, dining, and entertainment. Great for a rest day evening — World of Disney is the biggest Disney store anywhere." },
  // DLR-specific
  { id: "radiator-springs", label: "Radiator Springs Racers", emoji: "🏎️", category: "Rides", selected: false, resort: "dlr", park: "California Adventure", why: "Race through the desert at 40mph past stunning animatronics. Often called the best ride at Disneyland Resort." },
  { id: "cars-land-night", label: "See Cars Land at Night", emoji: "🌃", category: "Moments", selected: false, resort: "dlr", park: "California Adventure", why: "The neon signs light up Route 66 — it feels like you stepped into the movie. One of Disney's most photogenic spots." },
  { id: "indiana-jones", label: "Indiana Jones Adventure", emoji: "🏺", category: "Rides", selected: false, resort: "dlr", park: "Disneyland", why: "A thrilling jeep ride through a cursed temple. Unique to Disneyland — you can't ride this at WDW." },
  { id: "fantasmic-dl", label: "Watch Fantasmic!", emoji: "🐉", category: "Moments", selected: false, resort: "dlr", park: "Disneyland", why: "A spectacular water, fire, and projection show on the Rivers of America. The dragon finale is breathtaking." },
];

/* ── Component ── */
const DreamPlanner = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [travelers, setTravelers] = useState<TravelerInfo>({ adults: 2, kids: 0, kidAges: "", firstTime: null });
  const [dates, setDates] = useState<TripDates>({ month: "", duration: 5 });
  const [selectedResort, setSelectedResort] = useState<Resort>(null);
  const [parks, setParks] = useState<ParkChoice[]>(allParks);
  const [vibes, setVibes] = useState<VibeChoice[]>(initialVibes);
  const [dining, setDining] = useState<DiningPref[]>(initialDining);
  const [dreams, setDreams] = useState<DreamItem[]>(allDreams);

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

  // When resort changes, reset park selections and filter dreams
  const handleResortChange = (resort: Resort) => {
    setSelectedResort(resort);
    setParks(allParks.map(p => ({ ...p, selected: false })));
    setDreams(allDreams.map(d => ({ ...d, selected: false })));
  };

  const visibleParks = parks.filter(p => p.resort === selectedResort);
  const visibleDreams = dreams.filter(d => d.resort === selectedResort || d.resort === "both");

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
      case "resort": return selectedResort !== null;
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
      case "resort": return "Destination";
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

            {/* ── RESORT ── */}
            {step === "resort" && (
              <motion.div key="resort" {...slideAnim} className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">Where are you headed?</h2>
                  <p className="font-editorial text-sm text-muted-foreground">
                    Disney has two resorts in the US — each is a completely different vacation.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {([
                    {
                      id: "wdw" as const,
                      name: "Walt Disney World",
                      location: "Orlando, Florida",
                      emoji: "🏰",
                      desc: "4 theme parks, 2 water parks, 25+ resorts, and Disney Springs. The full-scale Disney vacation — most people spend 5–10 days here.",
                      parks: "Magic Kingdom · EPCOT · Hollywood Studios · Animal Kingdom",
                      bestFor: "First-timers who want the full Disney experience, families with kids, Star Wars & Avatar fans",
                    },
                    {
                      id: "dlr" as const,
                      name: "Disneyland Resort",
                      location: "Anaheim, California",
                      emoji: "✨",
                      desc: "2 theme parks side-by-side, walkable from hotels. Walt's original park — more intimate and charming. Perfect for a 3–5 day trip.",
                      parks: "Disneyland Park · Disney California Adventure",
                      bestFor: "Shorter trips, west coast travelers, nostalgia seekers, people who love a cozy, walkable resort",
                    },
                  ]).map(resort => (
                    <button
                      key={resort.id}
                      onClick={() => handleResortChange(resort.id)}
                      className={`rounded-lg border p-6 text-left transition-all duration-300 relative ${selectedResort === resort.id
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                        : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                      }`}
                    >
                      {selectedResort === resort.id && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <span className="text-3xl mt-0.5">{resort.emoji}</span>
                        <div className="flex-1">
                          <p className="font-display text-lg text-foreground">{resort.name}</p>
                          <p className="font-editorial text-xs text-[hsl(var(--gold))] mb-2">{resort.location}</p>
                          <p className="font-editorial text-sm text-muted-foreground leading-relaxed mb-3">{resort.desc}</p>
                          <p className="font-editorial text-xs text-muted-foreground/70 mb-1">
                            <strong className="text-foreground/70">Parks:</strong> {resort.parks}
                          </p>
                          <p className="font-editorial text-xs text-muted-foreground/70">
                            <strong className="text-foreground/70">Best for:</strong> {resort.bestFor}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {travelers.firstTime && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-[hsl(var(--sky)/0.06)] border border-[hsl(var(--sky)/0.15)] p-4">
                    <p className="font-editorial text-xs text-[hsl(var(--sky))]">
                      💡 <strong>First-timer tip:</strong> Walt Disney World is the most popular choice for a first trip — 4 parks means more variety, and there's enough to fill a full week without repeating anything.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── WHERE ── */}
            {step === "where" && (
              <motion.div key="where" {...slideAnim} className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">
                    {selectedResort === "wdw" ? "Which WDW parks?" : "Which Disneyland parks?"}
                  </h2>
                  <p className="font-editorial text-sm text-muted-foreground">
                    {selectedResort === "wdw"
                      ? "Each park is a full day (or more). Pick the ones that excite you — we'll help you plan each day."
                      : "Both parks are right next to each other — you can even park hop between them in the same day."
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  {visibleParks.map(park => (
                    <button
                      key={park.id}
                      onClick={() => togglePark(park.id)}
                      className={`w-full rounded-lg border p-6 text-left transition-all duration-300 relative overflow-hidden ${park.selected
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                        : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                      }`}
                    >
                      {park.selected && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <span className="text-3xl mt-0.5">{park.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg text-foreground">{park.name}</p>
                          <p className="font-editorial text-sm text-muted-foreground mt-0.5 leading-relaxed">{park.tagline}</p>
                          
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {park.highlights.map(h => (
                              <span key={h} className="inline-block px-2.5 py-1 rounded-md bg-muted text-[0.625rem] text-muted-foreground font-editorial">
                                {h}
                              </span>
                            ))}
                          </div>

                          <p className="font-editorial text-xs text-muted-foreground/70 mt-3">
                            <strong className="text-foreground/70">Best for:</strong> {park.bestFor}
                          </p>
                          <p className="font-editorial text-xs text-[hsl(var(--gold))] mt-1.5 italic">
                            ✨ {park.mustDo}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedResort === "wdw" && visibleParks.filter(p => p.selected).length === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-[hsl(var(--mint)/0.06)] border border-[hsl(var(--mint)/0.15)] p-4">
                    <p className="font-editorial text-xs text-[hsl(var(--mint))]">
                      🎉 <strong>All four parks!</strong> For a full WDW experience, we recommend at least 5–7 days so you don't feel rushed.
                    </p>
                  </motion.div>
                )}
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
                    What would make this trip unforgettable? Tap anything that excites you — we'll weave them into your plan.
                  </p>
                </div>

                {["Moments", "Rides", "Dining", "Snacks", "Characters", "Lands", "Relaxation", "Extras"].map(cat => {
                  const items = visibleDreams.filter(d => d.category === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="label-text mb-3">{cat}</p>
                      <div className="space-y-2">
                        {items.map(dream => (
                          <button
                            key={dream.id}
                            onClick={() => toggleDream(dream.id)}
                            className={`w-full rounded-lg border p-4 text-left transition-all duration-300 relative ${dream.selected
                              ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] shadow-[var(--shadow-soft)]"
                              : "border-border bg-card hover:border-[hsl(var(--gold)/0.3)]"
                            }`}
                          >
                            {dream.selected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5 shrink-0">{dream.emoji}</span>
                              <div className="flex-1 min-w-0 pr-6">
                                <p className="font-editorial text-sm text-foreground font-medium">{dream.label}</p>
                                <p className="font-editorial text-xs text-muted-foreground/70 mt-0.5">{dream.park}</p>
                                <p className="font-editorial text-xs text-muted-foreground mt-1.5 leading-relaxed">{dream.why}</p>
                              </div>
                            </div>
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
              <motion.div key="preview" {...slideAnim} className="text-center py-12 space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease }}
                  className="w-16 h-16 rounded-full bg-[hsl(var(--mint)/0.1)] border border-[hsl(var(--mint)/0.2)] flex items-center justify-center mx-auto"
                >
                  <Check className="w-7 h-7 text-[hsl(var(--mint))]" />
                </motion.div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-2">Your Dream Plan is Ready!</h2>
                  <p className="font-editorial text-sm text-muted-foreground max-w-md mx-auto">
                    We've built a detailed day-by-day itinerary based on your preferences — with insider tips and reasoning for every recommendation.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-soft)] text-left max-w-sm mx-auto space-y-3">
                  <p className="font-editorial text-xs text-muted-foreground">Your plan includes:</p>
                  <div className="space-y-2">
                    <p className="font-editorial text-sm text-foreground">📅 {dates.duration} days · {dates.month}</p>
                    <p className="font-editorial text-sm text-foreground">👥 {travelers.adults} adult{travelers.adults > 1 ? "s" : ""}{travelers.kids > 0 ? ` + ${travelers.kids} kid${travelers.kids > 1 ? "s" : ""}` : ""}</p>
                    <p className="font-editorial text-sm text-foreground">🏰 {selectedParks.map(p => p.name).join(", ")}</p>
                    {selectedDreams.length > 0 && <p className="font-editorial text-sm text-foreground">⭐ {selectedDreams.length} dream list item{selectedDreams.length > 1 ? "s" : ""}</p>}
                    {selectedVibes.length > 0 && <p className="font-editorial text-sm text-foreground">✨ {selectedVibes.map(v => v.label).join(", ")}</p>}
                  </div>
                </div>

                <button
                  onClick={() => navigate("/dream-itinerary", {
                    state: {
                      travelers,
                      dates,
                      selectedResort,
                      selectedParks: selectedParks.map(p => ({ id: p.id, name: p.name, emoji: p.emoji, tagline: p.tagline })),
                      selectedVibes: selectedVibes.map(v => ({ id: v.id, label: v.label, emoji: v.emoji })),
                      selectedDining: selectedDining.map(d => ({ id: d.id, label: d.label, emoji: d.emoji })),
                      selectedDreams: selectedDreams.map(d => ({ id: d.id, label: d.label, emoji: d.emoji, why: d.why, park: d.park, category: d.category })),
                    }
                  })}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity"
                >
                  View My Dream Itinerary <ArrowRight className="w-4 h-4" />
                </button>
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
