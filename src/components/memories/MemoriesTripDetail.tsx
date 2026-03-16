import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, Award, Share2, Download } from "lucide-react";
import SectionNav from "@/components/SectionNav";
import AudioEcho from "./AudioEcho";
import JoyBlueprint from "./JoyBlueprint";
import type { TripMemory } from "@/data/types";

import castleHero from "@/assets/castle-hero.jpg";
import castleGolden from "@/assets/castle-golden.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import editorialCarousel from "@/assets/editorial-carousel.jpg";
import editorialDining from "@/assets/editorial-dining.jpg";
import editorialSunset from "@/assets/editorial-sunset.jpg";
import editorialFamilyWalk from "@/assets/editorial-family-walk.jpg";
import editorialResort from "@/assets/editorial-resort-twilight.jpg";
import editorialJournal from "@/assets/editorial-travel-journal.jpg";
import editorialPacking from "@/assets/editorial-packing.jpg";
import editorialCalendar from "@/assets/editorial-calendar.jpg";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 1, delay, ease },
});

const tabs = [
  { id: "vault", label: "The Vault" },
  { id: "echoes", label: "Echoes" },
  { id: "joy", label: "Joy Report" },
];

/* ═══════════════════════════════════════════════════════════════
 * SCRAPBOOK DATA — each day is a "spread" with interwoven
 * photos, narrative text, pull quotes, and moments
 * ═══════════════════════════════════════════════════════════════ */

interface SpreadPhoto {
  src: string;
  caption: string;
}

interface DaySpread {
  day: string;
  date: string;
  title: string;
  subtitle: string;
  mood: string;
  moodLabel: string;
  /** Hero image for this day — full-width cinematic */
  hero: SpreadPhoto;
  /** Opening narrative paragraph */
  narrative: string;
  /** Supporting photos woven into the layout */
  photos: SpreadPhoto[];
  /** Key moments as short captions */
  moments: string[];
  /** Pull quote from a family member */
  pullQuote?: { text: string; attribution: string };
  /** Small stats for the day */
  stats?: { label: string; value: string }[];
}

const spreads: DaySpread[] = [
  {
    day: "Day One",
    date: "December 18, 2025",
    title: "The Grand Arrival",
    subtitle: "Contemporary Resort · Magic Kingdom",
    mood: "😍",
    moodLabel: "Pure Magic",
    hero: { src: castleHero, caption: "The castle, dressed in holiday lights — the moment everything became real" },
    narrative: "We pulled up to the Contemporary Resort at 2:45 PM. The monorail whooshed overhead. Jack pressed his face against the car window and whispered, \"Is this it?\" It was. We dropped bags and practically ran to the Magic Kingdom. The castle was bigger than any of us remembered.",
    photos: [
      { src: editorialResort, caption: "Contemporary Resort at golden hour — our home for the next four days" },
      { src: editorialFamilyWalk, caption: "The walk down Main Street. Emma grabbed Sarah's hand and didn't let go." },
      { src: editorialCarousel, caption: "First ride of the trip — the carrousel at sunset" },
    ],
    moments: [
      "First Dole Whip of the trip — pineapple, no swirl",
      "Emma saw the castle and froze mid-sentence",
      "Rode Tron at rope-drop — 8 minute wait",
      "Watched the castle lighting ceremony from the hub",
    ],
    pullQuote: { text: "She just stood there. Mouth open. Eyes wide. I looked at Sarah and we both knew — this was the trip.", attribution: "Patchen" },
    stats: [
      { label: "Steps walked", value: "18,422" },
      { label: "Attractions", value: "6" },
      { label: "Snacks", value: "4" },
    ],
  },
  {
    day: "Day Two",
    date: "December 19, 2025",
    title: "The EPCOT Expedition",
    subtitle: "EPCOT · World Showcase · Space 220",
    mood: "🤩",
    moodLabel: "Extraordinary",
    hero: { src: editorialSunset, caption: "Sunset over World Showcase Lagoon — the golden hour we planned the whole day around" },
    narrative: "EPCOT days are different. Slower. More intentional. We started with Cosmic Rewind — \"September\" by Earth, Wind & Fire — and Jack screamed the entire time. By afternoon we were in the France Pavilion, where he tried his first macaron and declared it \"basically a cookie sandwich.\"",
    photos: [
      { src: editorialDining, caption: "Space 220 — dinner at the edge of the atmosphere" },
      { src: editorialCalendar, caption: "The Festival of the Holidays passport — every stamp earned" },
    ],
    moments: [
      "Cosmic Rewind — \"September\" by Earth, Wind & Fire",
      "Space 220 dinner, table with a view of the station",
      "Jack's first macaron in the France Pavilion",
      "Festival of the Holidays cookie stroll completed — all stamps",
    ],
    pullQuote: { text: "The waiter at Space 220 asked Jack if he'd been to space before. He said yes. Completely deadpan.", attribution: "Sarah" },
    stats: [
      { label: "Countries visited", value: "11" },
      { label: "Snacks", value: "7" },
      { label: "Steps walked", value: "22,108" },
    ],
  },
  {
    day: "Day Three",
    date: "December 20, 2025",
    title: "Hollywood & Magic",
    subtitle: "Hollywood Studios · Galaxy's Edge · Fantasmic!",
    mood: "⚡",
    moodLabel: "Thrilling",
    hero: { src: familyMainstreet, caption: "Walking through the gates — the day we'd been building lightsabers for" },
    narrative: "This was the day Sarah had been waiting for. Savi's Workshop. She and Emma walked in together and came out with lightsabers, tear-streaked faces, and a story they'll tell forever. Jack, meanwhile, rode Tower of Terror and immediately demanded to go again. Three times.",
    photos: [
      { src: editorialJournal, caption: "Sarah's journal entry — \"Today Emma and I became Jedi. I'm not crying, you're crying.\"" },
      { src: editorialPacking, caption: "The morning ritual — lightsaber parts laid out like surgical instruments" },
      { src: castleGolden, caption: "Back to Magic Kingdom for an evening hop — golden hour from the hub" },
    ],
    moments: [
      "Rise of the Resistance — the best 18 minutes in theme parks",
      "Savi's Workshop — Sarah and Emma built lightsabers together",
      "Tower of Terror — Jack's first drop ride (he wants to go again)",
      "Fantasmic! front row, dessert party — unforgettable finale",
    ],
    pullQuote: { text: "AGAIN! AGAIN! AGAIN!", attribution: "Jack, age 6, exiting Tower of Terror" },
    stats: [
      { label: "Tower of Terror rides", value: "3" },
      { label: "Lightsabers built", value: "2" },
      { label: "Screams", value: "∞" },
    ],
  },
  {
    day: "Day Four",
    date: "December 21, 2025",
    title: "The Last Day",
    subtitle: "Animal Kingdom · Magic Kingdom · MVMCP",
    mood: "😭",
    moodLabel: "Bittersweet",
    hero: { src: fireworksNight, caption: "The finale. Snow on Main Street. Nobody wanted to leave." },
    narrative: "We started the last day at Topolino's Terrace — Mickey in his chef whites, Emma in her princess dress. By afternoon we were on the safari watching giraffes walk through golden light. And then, the party. Mickey's Very Merry Christmas. It snowed on Main Street. Emma looked up and said, \"Can we just live here?\"",
    photos: [
      { src: editorialDining, caption: "Topolino's Terrace — the character breakfast that started our last day" },
      { src: editorialFamilyWalk, caption: "The walk back. Slower this time. Nobody was in a hurry." },
    ],
    moments: [
      "Topolino's Terrace character breakfast — Mickey in chef whites",
      "Animal Kingdom safari at golden hour — giraffes in the sunset",
      "Mickey's Very Merry Christmas Party — hot cocoa and carols",
      "Fireworks from the hub. Snow on Main Street. Nobody wanted to leave.",
    ],
    pullQuote: { text: "Can we just live here?", attribution: "Emma, looking up at the snow on Main Street" },
    stats: [
      { label: "Photos today", value: "94" },
      { label: "Hot cocoas", value: "6" },
      { label: "Tears shed", value: "Several" },
    ],
  },
];

const familyFavorites = [
  { member: "Patchen", favorite: "Rise of the Resistance", quote: "The best 18 minutes in any theme park, period." },
  { member: "Sarah", favorite: "Savi's Workshop", quote: "Building lightsabers with Emma — I'll never forget her face." },
  { member: "Emma", favorite: "Meeting Cinderella", quote: "She knew my name, Daddy!" },
  { member: "Jack", favorite: "Tower of Terror", quote: "AGAIN! AGAIN! AGAIN!" },
];

const tripStats = [
  { label: "Photos", value: "248", icon: "📸" },
  { label: "Audio Echoes", value: "7", icon: "🎙️" },
  { label: "Parks Visited", value: "4", icon: "🏰" },
  { label: "Attractions", value: "23", icon: "🎢" },
  { label: "Snacks", value: "19", icon: "🍦" },
  { label: "Miles Walked", value: "42.3", icon: "👟" },
];

/* ═══════════════════════════════════════════════════════════════
 * LAYOUT COMPONENTS — alternating editorial spreads
 * ═══════════════════════════════════════════════════════════════ */

/** Full-width cinematic hero with overlay text */
const SpreadHero = ({ photo, day, date, title, subtitle, mood, moodLabel }: {
  photo: SpreadPhoto; day: string; date: string; title: string; subtitle: string; mood: string; moodLabel: string;
}) => (
  <motion.div {...fade()} className="relative overflow-hidden" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
    <img src={photo.src} alt={photo.caption} className="w-full h-[400px] sm:h-[560px] object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className="text-white/40 mb-2 uppercase tracking-[0.25em]"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
          >
            {day} · {date}
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-white leading-[1.02] mb-1">
            {title}
          </h2>
          <p
            className="text-white/50"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
          >
            {subtitle}
          </p>
        </div>
        <div className="text-center shrink-0">
          <span className="text-3xl block">{mood}</span>
          <p
            className="text-white/40 mt-1"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {moodLabel}
          </p>
        </div>
      </div>
    </div>
    {/* Photo caption — subtle bottom strip */}
    <div className="absolute top-5 left-5">
      <span
        className="px-3 py-1.5 bg-[#947120] text-white"
        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
      >
        Master
      </span>
    </div>
  </motion.div>
);

/** Pull quote — large, editorial, gold accent */
const PullQuote = ({ text, attribution }: { text: string; attribution: string }) => (
  <motion.div {...fade(0.1)} className="py-8 sm:py-12">
    <div className="max-w-2xl mx-auto text-center">
      <span className="block mb-4" style={{ color: "#947120", fontSize: "2.5rem", lineHeight: 1, fontFamily: "Georgia, serif" }}>"</span>
      <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.35] mb-4">
        {text}
      </p>
      <p
        className="text-muted-foreground"
        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
      >
        — {attribution}
      </p>
    </div>
  </motion.div>
);

/** Photo with caption — editorial style */
const CaptionedPhoto = ({ photo, className = "" }: { photo: SpreadPhoto; className?: string }) => (
  <div className={className}>
    <div className="overflow-hidden group" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
      <img
        src={photo.src}
        alt={photo.caption}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
    </div>
    <p
      className="text-muted-foreground mt-3 leading-relaxed"
      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}
    >
      {photo.caption}
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
 * SPREAD LAYOUTS — each day uses a different editorial layout
 * to prevent visual monotony (coffee table book rhythm)
 * ═══════════════════════════════════════════════════════════════ */

/** Layout A: Hero → Narrative left + 2 photos right → moments → pull quote */
const SpreadLayoutA = ({ spread, index }: { spread: DaySpread; index: number }) => (
  <div className="space-y-0">
    <SpreadHero photo={spread.hero} {...spread} />

    {/* Narrative + photos — asymmetric 2-column */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 pt-3">
      {/* Narrative column */}
      <motion.div {...fade(0.05)} className="lg:col-span-3 bg-white border border-border p-8 sm:p-10" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
        <p
          className="text-foreground leading-[1.8] mb-8"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}
        >
          {spread.narrative}
        </p>
        <div className="border-t border-border pt-6">
          <p
            className="text-muted-foreground uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
          >
            Key Moments
          </p>
          <ul className="space-y-2.5">
            {spread.moments.map((m, j) => (
              <li
                key={j}
                className="flex items-start gap-3 text-muted-foreground"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}
              >
                <span className="shrink-0 mt-2 w-1.5 h-1.5" style={{ backgroundColor: "#947120" }} />
                {m}
              </li>
            ))}
          </ul>
        </div>
        {/* Day stats */}
        {spread.stats && (
          <div className="flex gap-6 mt-8 pt-6 border-t border-border">
            {spread.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-lg text-foreground">{s.value}</p>
                <p
                  className="text-muted-foreground uppercase tracking-[0.12em]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Photos column */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        {spread.photos.slice(0, 2).map((photo, j) => (
          <motion.div key={j} {...fade(0.08 + j * 0.04)} className="flex-1">
            <CaptionedPhoto photo={photo} className="h-full [&>div]:h-[220px] sm:[&>div]:h-[260px]" />
          </motion.div>
        ))}
      </div>
    </div>

    {/* Third photo — full width if present */}
    {spread.photos[2] && (
      <motion.div {...fade(0.12)} className="pt-3">
        <CaptionedPhoto photo={spread.photos[2]} className="[&>div]:h-[280px] sm:[&>div]:h-[360px]" />
      </motion.div>
    )}

    {spread.pullQuote && <PullQuote {...spread.pullQuote} />}
  </div>
);

/** Layout B: Hero → full-width photo pair → narrative centered → moments grid */
const SpreadLayoutB = ({ spread, index }: { spread: DaySpread; index: number }) => (
  <div className="space-y-0">
    <SpreadHero photo={spread.hero} {...spread} />

    {/* Photo pair — side by side */}
    {spread.photos.length >= 2 && (
      <div className="grid grid-cols-2 gap-3 pt-3">
        {spread.photos.slice(0, 2).map((photo, j) => (
          <motion.div key={j} {...fade(0.05 + j * 0.04)}>
            <CaptionedPhoto photo={photo} className="[&>div]:h-[240px] sm:[&>div]:h-[320px]" />
          </motion.div>
        ))}
      </div>
    )}

    {/* Centered narrative — editorial magazine style */}
    <motion.div {...fade(0.1)} className="pt-3">
      <div className="bg-white border border-border p-8 sm:p-12" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="text-foreground leading-[1.8] mb-8"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}
          >
            {spread.narrative}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {spread.moments.map((m, j) => (
              <div
                key={j}
                className="flex items-start gap-3 text-muted-foreground"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}
              >
                <span className="shrink-0 mt-2 w-1.5 h-1.5" style={{ backgroundColor: "#947120" }} />
                {m}
              </div>
            ))}
          </div>
          {spread.stats && (
            <div className="flex gap-8 mt-8 pt-6 border-t border-border justify-center">
              {spread.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-lg text-foreground">{s.value}</p>
                  <p
                    className="text-muted-foreground uppercase tracking-[0.12em]"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>

    {/* Third photo full-width */}
    {spread.photos[2] && (
      <motion.div {...fade(0.14)} className="pt-3">
        <CaptionedPhoto photo={spread.photos[2]} className="[&>div]:h-[280px] sm:[&>div]:h-[380px]" />
      </motion.div>
    )}

    {spread.pullQuote && <PullQuote {...spread.pullQuote} />}
  </div>
);

/** Layout C: Hero → Narrative right + tall photo left → moments → bottom photos */
const SpreadLayoutC = ({ spread, index }: { spread: DaySpread; index: number }) => (
  <div className="space-y-0">
    <SpreadHero photo={spread.hero} {...spread} />

    {/* Tall photo left + narrative right — reversed asymmetry */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 pt-3">
      {/* Tall photo */}
      <motion.div {...fade(0.05)} className="lg:col-span-2">
        {spread.photos[0] && (
          <CaptionedPhoto photo={spread.photos[0]} className="h-full [&>div]:h-[300px] lg:[&>div]:h-full" />
        )}
      </motion.div>

      {/* Narrative + moments */}
      <motion.div {...fade(0.08)} className="lg:col-span-3 bg-white border border-border p-8 sm:p-10" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
        <p
          className="text-foreground leading-[1.8] mb-8"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}
        >
          {spread.narrative}
        </p>
        <div className="border-t border-border pt-6">
          <p
            className="text-muted-foreground uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
          >
            Key Moments
          </p>
          <ul className="space-y-2.5">
            {spread.moments.map((m, j) => (
              <li
                key={j}
                className="flex items-start gap-3 text-muted-foreground"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}
              >
                <span className="shrink-0 mt-2 w-1.5 h-1.5" style={{ backgroundColor: "#947120" }} />
                {m}
              </li>
            ))}
          </ul>
        </div>
        {spread.stats && (
          <div className="flex gap-6 mt-8 pt-6 border-t border-border">
            {spread.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-lg text-foreground">{s.value}</p>
                <p
                  className="text-muted-foreground uppercase tracking-[0.12em]"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>

    {/* Bottom photos */}
    {spread.photos.length > 1 && (
      <div className={`grid gap-3 pt-3 ${spread.photos.length > 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {spread.photos.slice(1).map((photo, j) => (
          <motion.div key={j} {...fade(0.12 + j * 0.04)}>
            <CaptionedPhoto photo={photo} className="[&>div]:h-[240px] sm:[&>div]:h-[300px]" />
          </motion.div>
        ))}
      </div>
    )}

    {spread.pullQuote && <PullQuote {...spread.pullQuote} />}
  </div>
);

/** Picks a layout based on index to create variety */
const SpreadLayout = ({ spread, index }: { spread: DaySpread; index: number }) => {
  const layouts = [SpreadLayoutA, SpreadLayoutB, SpreadLayoutC, SpreadLayoutB];
  const Layout = layouts[index % layouts.length];
  return <Layout spread={spread} index={index} />;
};

/* ═══════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════ */

interface MemoriesTripDetailProps {
  memory: TripMemory;
  allMemories: TripMemory[];
  onBack: () => void;
}

const MemoriesTripDetail = ({ memory, allMemories, onBack }: MemoriesTripDetailProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [restorationPhase, setRestorationPhase] = useState<"restoring" | "revealed">("restoring");

  useEffect(() => {
    const timer = setTimeout(() => setRestorationPhase("revealed"), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ═══ RESTORATION LOADING ═══ */}
      {restorationPhase === "restoring" && (
        <section className="flex flex-col items-center justify-center py-40">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 mb-8 flex items-center justify-center"
            style={{ border: "1px solid #947120" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6"
              style={{ border: "1px solid #947120", borderTopColor: "transparent" }}
            />
          </motion.div>
          <p className="font-display text-lg text-foreground mb-2">
            The Scribe is hand-polishing your memory.
          </p>
          <p
            className="text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
          >
            Verifying local mirror checksums…
          </p>
        </section>
      )}

      {/* ═══ REVEALED CONTENT ═══ */}
      {restorationPhase === "revealed" && (
        <>
          {/* Header */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease }}>
              <button
                onClick={onBack}
                className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Adventures
              </button>

              <p
                className="mb-3 uppercase tracking-[0.3em] text-muted-foreground"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
              >
                {memory.date} · {memory.destination} · {memory.photoCount} photos
              </p>
              <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
                {memory.tripName}
              </h1>
              <p
                className="text-muted-foreground max-w-lg"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}
              >
                A four-day story told in photographs, moments, and the words your family spoke when they thought nobody was listening.
              </p>
            </motion.div>
          </section>

          {/* Sub-navigation */}
          <div
            className="border-b border-border px-4 sm:px-8 sticky top-16 z-30"
            style={{ backgroundColor: "#F9F7F2" }}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* ═══ THE VAULT — SCRAPBOOK ═══ */}
          {activeTab === "vault" && (
            <div className="pb-24">
              {/* Trip stats bar */}
              <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
                <motion.div {...fade()} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {tripStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white border border-border p-4 text-center"
                      style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                    >
                      <span className="text-lg mb-1 block">{stat.icon}</span>
                      <p className="font-display text-xl text-foreground">{stat.value}</p>
                      <p
                        className="text-muted-foreground mt-0.5 uppercase tracking-[0.12em]"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </section>

              {/* Day spreads — the scrapbook */}
              {spreads.map((spread, i) => (
                <section key={spread.day} className="max-w-6xl mx-auto px-4 sm:px-8 pt-20 sm:pt-28">
                  {/* Day divider */}
                  <motion.div {...fade()} className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1" style={{ backgroundColor: "#947120", opacity: 0.2 }} />
                    <p
                      className="text-muted-foreground uppercase tracking-[0.3em] shrink-0"
                      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", fontWeight: 400 }}
                    >
                      {spread.day}
                    </p>
                    <div className="h-px flex-1" style={{ backgroundColor: "#947120", opacity: 0.2 }} />
                  </motion.div>

                  <SpreadLayout spread={spread} index={i} />
                </section>
              ))}

              {/* Family Favorites */}
              <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-24">
                <motion.div {...fade()}>
                  <p
                    className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
                  >
                    In Their Own Words
                  </p>
                  <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-12">
                    Family Favorites
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {familyFavorites.map((fav, i) => (
                    <motion.div
                      key={fav.member}
                      {...fade(0.04 + i * 0.04)}
                      className="bg-white border border-border p-6 sm:p-8"
                      style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                    >
                      <p
                        className="text-muted-foreground mb-1 uppercase tracking-[0.15em]"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                      >
                        {fav.member}'s Favorite
                      </p>
                      <h4 className="font-display text-xl text-foreground mb-3">{fav.favorite}</h4>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 mt-1" style={{ color: "#947120", fontSize: "1.25rem", lineHeight: 1 }}>"</span>
                        <p
                          className="text-muted-foreground italic"
                          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}
                        >
                          {fav.quote}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Closing editorial */}
              <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-8 text-center">
                <motion.div {...fade()}>
                  <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: "#947120" }} />
                  <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.3] max-w-xl mx-auto mb-4">
                    "Nobody wanted to leave. But the memories — those we get to keep."
                  </p>
                  <p
                    className="text-muted-foreground mb-10"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
                  >
                    — The Noelke Family, {memory.date}
                  </p>

                  {/* CTA to order print */}
                  <motion.div {...fade(0.05)} className="inline-block">
                    <div
                      className="bg-white border border-border px-8 py-6 text-center"
                      style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                    >
                      <p
                        className="text-muted-foreground mb-2 uppercase tracking-[0.15em]"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                      >
                        Make it Permanent
                      </p>
                      <p className="font-display text-lg text-foreground mb-4">
                        Order a Coffee Table Book
                      </p>
                      <button
                        className="px-6 text-center transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "#1A1A1B",
                          color: "#C8A84E",
                          fontFamily: "Inter, system-ui, sans-serif",
                          fontSize: "0.625rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                          minHeight: 44,
                          lineHeight: "44px",
                        }}
                      >
                        Design Your Book — from $49.95
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </section>
            </div>
          )}

          {activeTab === "echoes" && <AudioEcho />}
          {activeTab === "joy" && <JoyBlueprint tripMemories={[memory]} />}
        </>
      )}
    </>
  );
};

export default MemoriesTripDetail;
