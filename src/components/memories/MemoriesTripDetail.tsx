import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Award, Share2, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
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
import travelFlatlay from "@/assets/travel-flatlay.jpg";
import editorialNextTrip from "@/assets/editorial-next-trip.jpg";

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
 * TYPES
 * ═══════════════════════════════════════════════════════════════ */
interface SpreadPhoto {
  src: string;
  caption: string;
  /** Grid span for collage layout */
  span?: string;
}

interface DaySpread {
  day: string;
  date: string;
  title: string;
  subtitle: string;
  mood: string;
  moodLabel: string;
  hero: SpreadPhoto;
  narrative: string;
  /** Featured photos shown in the editorial layout */
  featured: SpreadPhoto[];
  /** Collage grid — the dense mosaic of the day's photos */
  collage: SpreadPhoto[];
  /** Total photo count for this day (most aren't shown) */
  totalPhotos: number;
  moments: string[];
  pullQuote?: { text: string; attribution: string };
  stats?: { label: string; value: string }[];
}

/* ═══════════════════════════════════════════════════════════════
 * SCRAPBOOK DATA — rich, photo-dense spreads
 * ═══════════════════════════════════════════════════════════════ */
const spreads: DaySpread[] = [
  {
    day: "Day One",
    date: "December 18, 2025",
    title: "The Grand Arrival",
    subtitle: "Contemporary Resort · Magic Kingdom",
    mood: "😍",
    moodLabel: "Pure Magic",
    totalPhotos: 52,
    hero: { src: castleHero, caption: "The castle, dressed in holiday lights — the moment everything became real" },
    narrative: "We pulled up to the Contemporary Resort at 2:45 PM. The monorail whooshed overhead. Jack pressed his face against the car window and whispered, \"Is this it?\" It was. We dropped bags and practically ran to the Magic Kingdom. The castle was bigger than any of us remembered.",
    featured: [
      { src: editorialResort, caption: "Contemporary Resort at golden hour — our home for the next four days" },
      { src: editorialFamilyWalk, caption: "The walk down Main Street. Emma grabbed Sarah's hand and didn't let go." },
    ],
    collage: [
      { src: editorialCarousel, caption: "First ride — the carrousel at sunset", span: "col-span-2 row-span-2" },
      { src: travelFlatlay, caption: "Park bag essentials — sunscreen, ponchos, autograph book", span: "col-span-1 row-span-1" },
      { src: editorialPacking, caption: "Matching ears laid out on the hotel bed", span: "col-span-1 row-span-1" },
      { src: castleGolden, caption: "Castle from the hub — golden hour", span: "col-span-2 row-span-1" },
      { src: editorialDining, caption: "First park dinner — Pecos Bill's, loaded nachos", span: "col-span-1 row-span-1" },
      { src: editorialNextTrip, caption: "Waiting for Tron — only 8 minutes!", span: "col-span-1 row-span-1" },
      { src: familyMainstreet, caption: "Family portrait in front of the train station", span: "col-span-2 row-span-1" },
      { src: editorialCalendar, caption: "Jack studying the park map like a general", span: "col-span-1 row-span-1" },
      { src: editorialJournal, caption: "Emma's first trip journal entry", span: "col-span-1 row-span-1" },
      { src: editorialSunset, caption: "Sunset from the monorail platform", span: "col-span-2 row-span-1" },
      { src: editorialResort, caption: "Lobby Christmas tree — twelve feet tall", span: "col-span-1 row-span-1" },
      { src: castleHero, caption: "Castle Dream Lights — 200,000 LEDs", span: "col-span-1 row-span-1" },
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
    totalPhotos: 68,
    hero: { src: editorialSunset, caption: "Sunset over World Showcase Lagoon — the golden hour we planned the whole day around" },
    narrative: "EPCOT days are different. Slower. More intentional. We started with Cosmic Rewind — \"September\" by Earth, Wind & Fire — and Jack screamed the entire time. By afternoon we were in the France Pavilion, where he tried his first macaron and declared it \"basically a cookie sandwich.\"",
    featured: [
      { src: editorialDining, caption: "Space 220 — dinner at the edge of the atmosphere" },
      { src: editorialCalendar, caption: "The Festival of the Holidays passport — every stamp earned" },
    ],
    collage: [
      { src: editorialNextTrip, caption: "The line for Cosmic Rewind — worth every second", span: "col-span-1 row-span-1" },
      { src: editorialCarousel, caption: "Living with the Land — Jack's surprising favorite", span: "col-span-1 row-span-1" },
      { src: castleGolden, caption: "Spaceship Earth at golden hour", span: "col-span-2 row-span-2" },
      { src: editorialPacking, caption: "Jack's macaron from Les Halles Boulangerie-Pâtisserie", span: "col-span-1 row-span-1" },
      { src: travelFlatlay, caption: "Festival of the Holidays cookie stroll collection", span: "col-span-1 row-span-1" },
      { src: familyMainstreet, caption: "Family selfie in front of the Japan Pavilion torii gate", span: "col-span-2 row-span-1" },
      { src: editorialJournal, caption: "Sarah documenting the World Showcase food tour", span: "col-span-1 row-span-1" },
      { src: editorialFamilyWalk, caption: "Walking through the UK Pavilion gardens", span: "col-span-1 row-span-1" },
      { src: editorialResort, caption: "Illuminations — sorry, Luminous — from the Italy bridge", span: "col-span-2 row-span-1" },
      { src: editorialDining, caption: "School Bread from Norway — Emma's new obsession", span: "col-span-1 row-span-1" },
      { src: editorialCalendar, caption: "Kidcot Fun Stop stamps — Emma collected all 11", span: "col-span-1 row-span-1" },
    ],
    moments: [
      "Cosmic Rewind — \"September\" by Earth, Wind & Fire",
      "Space 220 dinner, table with a view of the station",
      "Jack's first macaron in the France Pavilion",
      "Festival of the Holidays cookie stroll — all stamps",
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
    totalPhotos: 74,
    hero: { src: familyMainstreet, caption: "Walking through the gates — the day we'd been building lightsabers for" },
    narrative: "This was the day Sarah had been waiting for. Savi's Workshop. She and Emma walked in together and came out with lightsabers, tear-streaked faces, and a story they'll tell forever. Jack, meanwhile, rode Tower of Terror and immediately demanded to go again. Three times.",
    featured: [
      { src: editorialJournal, caption: "Sarah's journal entry — \"Today Emma and I became Jedi. I'm not crying, you're crying.\"" },
      { src: castleGolden, caption: "Evening hop to Magic Kingdom — golden hour from the hub" },
    ],
    collage: [
      { src: editorialPacking, caption: "Morning ritual — lightsaber parts laid out like surgical instruments", span: "col-span-2 row-span-1" },
      { src: editorialNextTrip, caption: "The queue for Rise of the Resistance — immersive even in line", span: "col-span-2 row-span-2" },
      { src: editorialFamilyWalk, caption: "Galaxy's Edge — walking into another planet", span: "col-span-1 row-span-1" },
      { src: editorialDining, caption: "Blue Milk and a Ronto Wrap — the Star Wars lunch", span: "col-span-1 row-span-1" },
      { src: travelFlatlay, caption: "Lightsaber components — Sarah chose peace and justice", span: "col-span-1 row-span-1" },
      { src: editorialCarousel, caption: "Toy Story Land — Slinky Dog Dash line selfie", span: "col-span-1 row-span-1" },
      { src: editorialCalendar, caption: "Tower of Terror photo — Jack's face is priceless", span: "col-span-2 row-span-1" },
      { src: editorialResort, caption: "Fantasmic! dessert party setup — front row seats", span: "col-span-1 row-span-1" },
      { src: fireworksNight, caption: "Fantasmic! finale — water, fire, and Mickey", span: "col-span-1 row-span-1" },
      { src: editorialSunset, caption: "Sunset Boulevard at dusk — the neon glowing", span: "col-span-2 row-span-1" },
      { src: familyMainstreet, caption: "Post-Fantasmic! family glow — exhausted and happy", span: "col-span-1 row-span-1" },
      { src: editorialJournal, caption: "Emma drawing her lightsaber in her journal", span: "col-span-1 row-span-1" },
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
    totalPhotos: 94,
    hero: { src: fireworksNight, caption: "The finale. Snow on Main Street. Nobody wanted to leave." },
    narrative: "We started the last day at Topolino's Terrace — Mickey in his chef whites, Emma in her princess dress. By afternoon we were on the safari watching giraffes walk through golden light. And then, the party. Mickey's Very Merry Christmas. It snowed on Main Street. Emma looked up and said, \"Can we just live here?\"",
    featured: [
      { src: editorialDining, caption: "Topolino's Terrace — the character breakfast that started our last day" },
      { src: editorialFamilyWalk, caption: "The walk back. Slower this time. Nobody was in a hurry." },
    ],
    collage: [
      { src: editorialCarousel, caption: "Emma in her princess dress — ready for the last day", span: "col-span-1 row-span-1" },
      { src: editorialPacking, caption: "Packing the park bag one last time", span: "col-span-1 row-span-1" },
      { src: editorialSunset, caption: "Kilimanjaro Safari — giraffes in the golden hour", span: "col-span-2 row-span-2" },
      { src: editorialNextTrip, caption: "The Tree of Life — details you only see up close", span: "col-span-1 row-span-1" },
      { src: travelFlatlay, caption: "Safari snack break — Mickey pretzels and lemonade", span: "col-span-1 row-span-1" },
      { src: editorialCalendar, caption: "Festival of the Lion King — Jack danced in his seat", span: "col-span-2 row-span-1" },
      { src: editorialResort, caption: "Back at Contemporary — quick costume change for MVMCP", span: "col-span-1 row-span-1" },
      { src: castleHero, caption: "MVMCP — the castle in Christmas projection", span: "col-span-1 row-span-1" },
      { src: editorialDining, caption: "Hot cocoa and cookies — complimentary at the party", span: "col-span-1 row-span-1" },
      { src: familyMainstreet, caption: "Jingle Cruise — holiday dad jokes on the water", span: "col-span-1 row-span-1" },
      { src: castleGolden, caption: "Snow on Main Street — real foam, real magic", span: "col-span-2 row-span-1" },
      { src: editorialJournal, caption: "Emma's last journal entry: 'Can we just live here?'", span: "col-span-1 row-span-1" },
      { src: editorialFamilyWalk, caption: "The final walk down Main Street — nobody was rushing", span: "col-span-1 row-span-1" },
      { src: fireworksNight, caption: "Minnie's Wonderful Christmastime Fireworks — the last boom", span: "col-span-2 row-span-1" },
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
 * LAYOUT PRIMITIVES
 * ═══════════════════════════════════════════════════════════════ */

const SpreadHero = ({ photo, day, date, title, subtitle, mood, moodLabel }: {
  photo: SpreadPhoto; day: string; date: string; title: string; subtitle: string; mood: string; moodLabel: string;
}) => (
  <motion.div {...fade()} className="relative overflow-hidden" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
    <img src={photo.src} alt={photo.caption} className="w-full h-[400px] sm:h-[560px] object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-white/40 mb-2 uppercase tracking-[0.25em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
            {day} · {date}
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-white leading-[1.02] mb-1">{title}</h2>
          <p className="text-white/50" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}>
            {subtitle}
          </p>
        </div>
        <div className="text-center shrink-0">
          <span className="text-3xl block">{mood}</span>
          <p className="text-white/40 mt-1" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {moodLabel}
          </p>
        </div>
      </div>
    </div>
    <div className="absolute top-5 left-5">
      <span className="px-3 py-1.5 bg-[#947120] text-white" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        Master
      </span>
    </div>
  </motion.div>
);

const PullQuote = ({ text, attribution }: { text: string; attribution: string }) => (
  <motion.div {...fade(0.1)} className="py-8 sm:py-12">
    <div className="max-w-2xl mx-auto text-center">
      <span className="block mb-4" style={{ color: "#947120", fontSize: "2.5rem", lineHeight: 1, fontFamily: "Georgia, serif" }}>"</span>
      <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.35] mb-4">{text}</p>
      <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        — {attribution}
      </p>
    </div>
  </motion.div>
);

const CaptionedPhoto = ({ photo, className = "" }: { photo: SpreadPhoto; className?: string }) => (
  <div className={className}>
    <div className="overflow-hidden group" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
      <img src={photo.src} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
    </div>
    <p className="text-muted-foreground mt-3 leading-relaxed" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}>
      {photo.caption}
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
 * PHOTO COLLAGE — dense mosaic grid with expand/collapse
 * ═══════════════════════════════════════════════════════════════ */
const PhotoCollage = ({ photos, totalPhotos }: { photos: SpreadPhoto[]; totalPhotos: number }) => {
  const [expanded, setExpanded] = useState(false);
  const visiblePhotos = expanded ? photos : photos.slice(0, 8);
  const remaining = totalPhotos - photos.length;

  return (
    <motion.div {...fade(0.1)} className="pt-3">
      <div className="grid grid-cols-4 gap-1.5 auto-rows-[140px] sm:auto-rows-[180px]">
        {visiblePhotos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.03, ease }}
            className={`${photo.span || "col-span-1 row-span-1"} relative group overflow-hidden cursor-pointer`}
          >
            <img src={photo.src} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            {/* Hover caption overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
              <p className="text-white/90 leading-snug" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "-0.02em" }}>
                {photo.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expand / "View all" controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {photos.length > 8 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Show fewer" : `Show all ${photos.length}`}
          </button>
        )}
        {remaining > 0 && (
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "-0.02em" }}>
            + {remaining} more photos in full gallery
          </p>
        )}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
 * DAY SPREAD — scrollable content for a single day
 * ═══════════════════════════════════════════════════════════════ */
const DaySpreadContent = ({ spread, index }: { spread: DaySpread; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div className="space-y-3">
      {/* Hero */}
      <SpreadHero photo={spread.hero} {...spread} />

      {/* Featured + narrative */}
      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-3`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className={`${isEven ? "lg:col-span-3" : "lg:col-span-3 lg:order-2"} bg-white border border-border p-8 sm:p-10`}
          style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
        >
          <p className="text-foreground leading-[1.8] mb-8" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
            {spread.narrative}
          </p>
          <div className="border-t border-border pt-6">
            <p className="text-muted-foreground uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
              Key Moments
            </p>
            <ul className="space-y-2.5">
              {spread.moments.map((m, j) => (
                <li key={j} className="flex items-start gap-3 text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.8125rem", letterSpacing: "-0.02em", lineHeight: 1.6 }}>
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
                  <p className="text-muted-foreground uppercase tracking-[0.12em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className={`${isEven ? "lg:col-span-2" : "lg:col-span-2 lg:order-1"} flex flex-col gap-3`}>
          {spread.featured.map((photo, j) => (
            <motion.div
              key={j}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 + j * 0.05, ease }}
              className="flex-1"
            >
              <CaptionedPhoto photo={photo} className="h-full [&>div]:h-[220px] sm:[&>div]:h-[260px]" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Photo collage */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted-foreground uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
            From this day — {spread.totalPhotos} photos
          </p>
        </div>
        <PhotoCollage photos={spread.collage} totalPhotos={spread.totalPhotos} />
      </div>

      {/* Pull quote */}
      {spread.pullQuote && <PullQuote {...spread.pullQuote} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
 * DAY CAROUSEL — horizontal page-flip between days
 * ═══════════════════════════════════════════════════════════════ */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 600 : -600,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -600 : 600,
    opacity: 0,
    scale: 0.96,
  }),
};

const DayCarousel = ({ memory }: { memory: TripMemory }) => {
  const [[activeDay, direction], setActiveDay] = useState([0, 0]);

  const paginate = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= spreads.length) return;
    setActiveDay([newIndex, newIndex > activeDay ? 1 : -1]);
  }, [activeDay]);

  const goNext = useCallback(() => paginate(activeDay + 1), [activeDay, paginate]);
  const goPrev = useCallback(() => paginate(activeDay - 1), [activeDay, paginate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const spread = spreads[activeDay];

  return (
    <div className="pb-24">
      {/* Trip stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tripStats.map((stat) => (
            <div key={stat.label} className="bg-white border border-border p-4 text-center" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
              <span className="text-lg mb-1 block">{stat.icon}</span>
              <p className="font-display text-xl text-foreground">{stat.value}</p>
              <p className="text-muted-foreground mt-0.5 uppercase tracking-[0.12em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5rem" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Day selector + navigation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          {/* Day tabs */}
          <div className="flex items-center gap-1">
            {spreads.map((s, i) => (
              <button
                key={s.day}
                onClick={() => paginate(i)}
                className="relative px-4 py-3 transition-all duration-500"
              >
                <span
                  className="uppercase tracking-[0.15em] transition-colors duration-300"
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "0.625rem",
                    fontWeight: 400,
                    color: i === activeDay ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {s.day}
                </span>
                <span
                  className="block mt-0.5 transition-colors duration-300"
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "0.5rem",
                    color: i === activeDay ? "#947120" : "transparent",
                    letterSpacing: "0.05em",
                  }}
                >
                  {s.mood} {s.moodLabel}
                </span>
                {/* Active indicator */}
                <motion.div
                  className="absolute bottom-0 left-4 right-4 h-px"
                  initial={false}
                  animate={{
                    opacity: i === activeDay ? 1 : 0,
                    scaleX: i === activeDay ? 1 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ backgroundColor: "#947120", transformOrigin: "center" }}
                />
              </button>
            ))}
          </div>

          {/* Arrow navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goPrev}
              disabled={activeDay === 0}
              className="w-10 h-10 flex items-center justify-center border border-border bg-white transition-all disabled:opacity-30"
              style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goNext}
              disabled={activeDay === spreads.length - 1}
              className="w-10 h-10 flex items-center justify-center border border-border bg-white transition-all disabled:opacity-30"
              style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Day spread — animated page flip */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeDay}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) goNext();
                else if (info.offset.x > 80) goPrev();
              }}
            >
              <DaySpreadContent spread={spread} index={activeDay} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page dots */}
        <div className="flex items-center justify-center gap-2 pt-10">
          {spreads.map((_, i) => (
            <button key={i} onClick={() => paginate(i)} className="p-1">
              <motion.div
                animate={{
                  width: i === activeDay ? 24 : 6,
                  backgroundColor: i === activeDay ? "#947120" : "hsl(var(--border))",
                }}
                transition={{ duration: 0.4 }}
                className="h-1.5"
              />
            </button>
          ))}
          <p className="ml-3 text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}>
            {activeDay + 1} of {spreads.length} days
          </p>
        </div>
      </section>

      {/* Family Favorites — below the carousel */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-24">
        <motion.div {...fade()}>
          <p className="mb-2 uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}>
            In Their Own Words
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-12">Family Favorites</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {familyFavorites.map((fav, i) => (
            <motion.div key={fav.member} {...fade(0.04 + i * 0.04)} className="bg-white border border-border p-6 sm:p-8" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
              <p className="text-muted-foreground mb-1 uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
                {fav.member}'s Favorite
              </p>
              <h4 className="font-display text-xl text-foreground mb-3">{fav.favorite}</h4>
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-1" style={{ color: "#947120", fontSize: "1.25rem", lineHeight: 1 }}>"</span>
                <p className="text-muted-foreground italic" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}>
                  {fav.quote}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-8 text-center">
        <motion.div {...fade()}>
          <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: "#947120" }} />
          <p className="font-display text-2xl sm:text-3xl text-foreground leading-[1.3] max-w-xl mx-auto mb-4">
            "Nobody wanted to leave. But the memories — those we get to keep."
          </p>
          <p className="text-muted-foreground mb-10" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}>
            — The Noelke Family, {memory.date}
          </p>
          <motion.div {...fade(0.05)} className="inline-block">
            <div className="bg-white border border-border px-8 py-6 text-center" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
              <p className="text-muted-foreground mb-2 uppercase tracking-[0.15em]" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem" }}>
                Make it Permanent
              </p>
              <p className="font-display text-lg text-foreground mb-4">Order a Coffee Table Book</p>
              <button
                className="px-6 text-center transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#1A1A1B", color: "#C8A84E", fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "0.625rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500,
                  minHeight: 44, lineHeight: "44px",
                }}
              >
                Design Your Book — from $49.95
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
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
          <p className="font-display text-lg text-foreground mb-2">The Scribe is hand-polishing your memory.</p>
          <p className="text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.75rem", letterSpacing: "-0.02em" }}>
            Verifying local mirror checksums…
          </p>
        </section>
      )}

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

              <p className="mb-3 uppercase tracking-[0.3em] text-muted-foreground" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}>
                {memory.date} · {memory.destination} · {memory.photoCount} photos
              </p>
              <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">{memory.tripName}</h1>
              <p className="text-muted-foreground max-w-lg" style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}>
                A four-day story told in photographs, moments, and the words your family spoke when they thought nobody was listening.
              </p>
            </motion.div>
          </section>

          {/* Sub-navigation */}
          <div className="border-b border-border px-4 sm:px-8 sticky top-16 z-30" style={{ backgroundColor: "#F9F7F2" }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  <Share2 className="w-3 h-3" /> Share
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
            </div>
          </div>

          {/* THE VAULT — CAROUSEL SCRAPBOOK */}
          {activeTab === "vault" && <DayCarousel memory={memory} />}

          {activeTab === "echoes" && <AudioEcho />}
          {activeTab === "joy" && <JoyBlueprint tripMemories={[memory]} />}
        </>
      )}
    </>
  );
};

export default MemoriesTripDetail;
