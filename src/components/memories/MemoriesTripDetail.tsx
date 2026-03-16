import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Award, Share2, Download, Volume2, Play, Pause } from "lucide-react";
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

// Rich mock data for the Christmas 2025 trip (our "full example")
const mockGalleryPhotos = [
  { id: "p1", src: fireworksNight, caption: "The moment the sky erupted — MVMCP finale", aspect: "col-span-4 row-span-2" },
  { id: "p2", src: editorialDining, caption: "Topolino's Terrace character breakfast", aspect: "col-span-2 row-span-1" },
  { id: "p3", src: editorialCarousel, caption: "Prince Charming Regal Carrousel at golden hour", aspect: "col-span-2 row-span-1" },
  { id: "p4", src: castleHero, caption: "The castle, dressed for the holidays", aspect: "col-span-3 row-span-2" },
  { id: "p5", src: familyMainstreet, caption: "Main Street family portrait — the annual tradition", aspect: "col-span-3 row-span-1" },
  { id: "p6", src: editorialFamilyWalk, caption: "Walking toward Adventureland, hand in hand", aspect: "col-span-3 row-span-1" },
  { id: "p7", src: editorialSunset, caption: "Sunset over Seven Seas Lagoon", aspect: "col-span-2 row-span-1" },
  { id: "p8", src: editorialResort, caption: "Contemporary Resort at twilight", aspect: "col-span-2 row-span-1" },
  { id: "p9", src: editorialJournal, caption: "Sarah's travel journal — day three reflections", aspect: "col-span-2 row-span-1" },
  { id: "p10", src: castleGolden, caption: "Golden hour from the hub", aspect: "col-span-6 row-span-1" },
  { id: "p11", src: editorialPacking, caption: "The morning-of essentials", aspect: "col-span-3 row-span-1" },
  { id: "p12", src: editorialCalendar, caption: "Park strategy board — the master plan", aspect: "col-span-3 row-span-1" },
];

const mockDayByDay = [
  {
    day: "Day 1 — December 18",
    title: "The Grand Arrival",
    moments: [
      "Checked into Contemporary Resort, Garden Wing at 2:45 PM",
      "First Dole Whip of the trip — pineapple, no swirl",
      "Emma saw the castle for the first time and froze mid-sentence",
      "Rode Tron at rope-drop — 8 minute wait",
    ],
    mood: "😍",
    moodLabel: "Pure Magic",
  },
  {
    day: "Day 2 — December 19",
    title: "The EPCOT Expedition",
    moments: [
      "Guardians of the Galaxy: Cosmic Rewind — September by Earth, Wind & Fire",
      "Space 220 dinner reservation, table with a view of the station",
      "Jack tried his first macaron in the France Pavilion",
      "Festival of the Holidays cookie stroll completed",
    ],
    mood: "🤩",
    moodLabel: "Extraordinary",
  },
  {
    day: "Day 3 — December 20",
    title: "Hollywood & Magic",
    moments: [
      "Rise of the Resistance — the best 18 minutes in theme parks",
      "Savi's Workshop: Sarah and Emma built lightsabers together",
      "Tower of Terror — Jack's first drop ride (he wants to go again)",
      "Fantasmic! front row, dessert party — unforgettable finale",
    ],
    mood: "⚡",
    moodLabel: "Thrilling",
  },
  {
    day: "Day 4 — December 21",
    title: "The Last Day — MVMCP",
    moments: [
      "Topolino's Terrace character breakfast — Mickey in chef whites",
      "Animal Kingdom safari at golden hour — giraffes in the sunset",
      "Back to Magic Kingdom for Mickey's Very Merry Christmas Party",
      "Fireworks from the hub. Snow on Main Street. Nobody wanted to leave.",
    ],
    mood: "😭",
    moodLabel: "Bittersweet",
  },
];

const tripStats = [
  { label: "Photos", value: "248", icon: "📸" },
  { label: "Audio Echoes", value: "7", icon: "🎙️" },
  { label: "Parks Visited", value: "4", icon: "🏰" },
  { label: "Attractions Rode", value: "23", icon: "🎢" },
  { label: "Snacks Consumed", value: "19", icon: "🍦" },
  { label: "Miles Walked", value: "42.3", icon: "👟" },
];

const familyFavorites = [
  { member: "Patchen", favorite: "Rise of the Resistance", quote: "The best 18 minutes in any theme park, period." },
  { member: "Sarah", favorite: "Savi's Workshop", quote: "Building lightsabers with Emma — I'll never forget her face." },
  { member: "Emma", favorite: "Meeting Cinderella", quote: "She knew my name, Daddy!" },
  { member: "Jack", favorite: "Tower of Terror", quote: "AGAIN! AGAIN! AGAIN!" },
];

interface MemoriesTripDetailProps {
  memory: TripMemory;
  allMemories: TripMemory[];
  onBack: () => void;
}

const MemoriesTripDetail = ({ memory, allMemories, onBack }: MemoriesTripDetailProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [restorationPhase, setRestorationPhase] = useState<"restoring" | "revealed">("restoring");

  // Simulate restoration on first load
  useState(() => {
    const timer = setTimeout(() => setRestorationPhase("revealed"), 2400);
    return () => clearTimeout(timer);
  });

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
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease }}
            >
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
                {memory.date} · {memory.destination}
              </p>
              <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
                {memory.tripName}
              </h1>

              <div className="flex items-center gap-4 flex-wrap">
                {memory.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 border border-border bg-white text-muted-foreground"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    {h}
                  </span>
                ))}
              </div>
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

          {/* ═══ THE VAULT TAB ═══ */}
          {activeTab === "vault" && (
            <VaultContent
              memory={memory}
              expandedPhoto={expandedPhoto}
              onExpandPhoto={setExpandedPhoto}
            />
          )}

          {/* ═══ ECHOES TAB ═══ */}
          {activeTab === "echoes" && <AudioEcho />}

          {/* ═══ JOY REPORT TAB ═══ */}
          {activeTab === "joy" && <JoyBlueprint tripMemories={[memory]} />}
        </>
      )}
    </>
  );
};

/* ───────────────────────────────────────────────────────────
 * THE VAULT — Full restored memory experience
 * ─────────────────────────────────────────────────────────── */
const VaultContent = ({
  memory,
  expandedPhoto,
  onExpandPhoto,
}: {
  memory: TripMemory;
  expandedPhoto: string | null;
  onExpandPhoto: (id: string | null) => void;
}) => {
  return (
    <div className="pb-24">
      {/* ── HERO IMAGE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
        <motion.div {...fade()} className="relative overflow-hidden" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease }}
            src={memory.coverImage}
            alt={memory.tripName}
            className="w-full h-[360px] sm:h-[520px] object-cover"
          />
          {/* Golden seal */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
            className="absolute bottom-5 right-5 w-12 h-12 flex items-center justify-center"
            style={{ backgroundColor: "#947120" }}
          >
            <Award className="w-5 h-5 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute top-5 left-5"
          >
            <span
              className="px-3 py-1.5 bg-[#947120] text-white"
              style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
            >
              Master
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRIP STATS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
        <motion.div {...fade(0.05)} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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

      {/* ── DAY-BY-DAY JOURNAL ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-20">
        <motion.div {...fade(0.1)}>
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            The Chronicle
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-12">
            Day by Day
          </h2>
        </motion.div>

        <div className="space-y-4">
          {mockDayByDay.map((day, i) => (
            <motion.div
              key={day.day}
              {...fade(0.12 + i * 0.04)}
              className="bg-white border border-border p-6 sm:p-8"
              style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-muted-foreground uppercase tracking-[0.15em] mb-1"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}
                  >
                    {day.day}
                  </p>
                  <h3 className="font-display text-2xl text-foreground">{day.title}</h3>
                </div>
                <div className="text-center shrink-0 ml-4">
                  <span className="text-2xl block">{day.mood}</span>
                  <p
                    className="text-muted-foreground mt-0.5"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    {day.moodLabel}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {day.moments.map((moment, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-muted-foreground"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}
                  >
                    <span className="shrink-0 mt-1.5 w-1 h-1 bg-[#947120]" />
                    {moment}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PHOTO MOSAIC ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-20">
        <motion.div {...fade(0.15)}>
          <p
            className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            The Collection
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
            {memory.photoCount} Restored Memories
          </h2>
          <p
            className="text-muted-foreground max-w-lg mb-12"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em" }}
          >
            Every frame verified, color-corrected, and archived. Hover to read the moment.
          </p>
        </motion.div>

        <div className="grid grid-cols-6 gap-3 auto-rows-[180px] sm:auto-rows-[220px]">
          {mockGalleryPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              {...fade(0.18 + i * 0.03)}
              className={`${photo.aspect} relative group cursor-pointer overflow-hidden`}
              style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              onClick={() => onExpandPhoto(expandedPhoto === photo.id ? null : photo.id)}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Hover caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p
                  className="text-white/90 leading-snug"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
                >
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAMILY FAVORITES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-20">
        <motion.div {...fade(0.2)}>
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
              {...fade(0.22 + i * 0.04)}
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

      {/* ── CLOSING EDITORIAL ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-8 text-center">
        <motion.div {...fade(0.25)}>
          <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: "#947120" }} />
          <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.3] max-w-xl mx-auto mb-4">
            "Nobody wanted to leave. But the memories — those we get to keep."
          </p>
          <p
            className="text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}
          >
            — The Noelke Family, {memory.date}
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default MemoriesTripDetail;
