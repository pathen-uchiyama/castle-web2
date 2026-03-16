import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "@/components/Footer";
import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import FloatingAnchor from "@/components/FloatingAnchor";
import SparkleField from "@/components/SparkleField";
import EmberTrail from "@/components/EmberTrail";
import castleHero from "@/assets/castle-hero.jpg";
import editorialCalendar from "@/assets/editorial-calendar.jpg";
import editorialFamilyWalk from "@/assets/editorial-family-walk.jpg";
import type {
  BookedTrip, FutureTrip, ParkGuide, PartyMember,
  TripMemory, AccountProfile,
} from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});
const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.4, delay, ease },
});
const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.4, delay, ease },
});
const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.6, delay, ease },
});

const ParallaxImage = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img src={src} alt={alt} style={{ y }} className="w-full h-[115%] object-cover" />
    </div>
  );
};

interface IndexProps {
  guestName: string;
  bookedTrip: BookedTrip;
  futureTrips: FutureTrip[];
  parkGuides: ParkGuide[];
  partyMembers: PartyMember[];
  tripMemories: TripMemory[];
  account: AccountProfile;
}

const Index = ({
  guestName, bookedTrip, futureTrips, parkGuides,
  partyMembers, tripMemories, account,
}: IndexProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const parkScrollRef = useRef<HTMLDivElement>(null);
  const [activeParkIdx, setActiveParkIdx] = useState(0);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0);
  const timelineCardCount = bookedTrip.travelLegs.length + 2; // legs + packing + time recovered

  const handleTimelineScroll = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 300;
    const gap = 20;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveTimelineIdx(Math.min(idx, timelineCardCount - 1));
  }, [timelineCardCount]);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleTimelineScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleTimelineScroll);
  }, [handleTimelineScroll]);

  const handleParkScroll = useCallback(() => {
    const el = parkScrollRef.current;
    if (!el) return;
    const card = el.querySelector('div') as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 340;
    const gap = 24;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveParkIdx(Math.min(idx, parkGuides.length - 1));
  }, [parkGuides.length]);

  useEffect(() => {
    const el = parkScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleParkScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleParkScroll);
  }, [handleParkScroll]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══ HERO — Fixed image behind, text scrolls with page ═══ */}
      <div className="fixed inset-0 h-screen z-0">
        <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 3, ease }} className="absolute inset-0">
          <img src={castleHero} alt="Castle at dusk" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <EmberTrail />
        <SparkleField count={15} />
      </div>

      {/* Hero text — scrolls with the page */}
      <header className="relative z-10 h-screen flex items-end overflow-hidden">
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 pb-16 sm:pb-20 lg:pb-28">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="label-text !text-white/60 mb-10 tracking-[0.3em]">
            Castle Companion ✨
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.8, ease }} className="font-display text-white text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.95] max-w-5xl">
            Welcome, <em className="italic" style={{ fontWeight: 400 }}>{guestName}</em>.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }} className="font-editorial text-white/60 text-base sm:text-lg mt-10 max-w-md leading-relaxed tracking-[-0.005em]">
            The magic is waiting. Your family's next adventure begins here. 🏰
          </motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 1.8, ease }} className="mt-10 w-16 h-px bg-white/30 origin-left" />
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="w-px h-10 bg-white/25" />
        </motion.div>
      </header>

      {/* ═══ Content that scrolls over the hero ═══ */}
      <div className="relative z-10">

      {/* ═══ YOUR ADVENTURE — Unified trip + timeline ═══ */}
      <section className="relative overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <img src={bookedTrip.heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        <div className="relative">
          {/* Trip overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
            <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-28">
              <motion.div {...slideLeft()}>
                <p className="label-text !text-white/60 mb-10 tracking-[0.25em]" style={{ letterSpacing: '0.25em' }}>Your Booked Adventure 🎉</p>
                <h2 className="font-display text-4xl sm:text-5xl xl:text-6xl text-white leading-[1.08] mb-6">
                  {bookedTrip.destination}
                </h2>
                <p className="font-display text-2xl sm:text-3xl text-white/60 leading-[1.2] mb-8">
                  {bookedTrip.tripName}
                </p>
                <p className="font-editorial text-base text-white/60 max-w-md leading-relaxed">
                  {bookedTrip.countdownDays} days until the fun begins! A party of {bookedTrip.partySize} — {bookedTrip.todaysPark?.weather?.toLowerCase() || 'clear skies'} ahead. 🌤️
                </p>
              </motion.div>
              <motion.div {...slideLeft(0.2)} className="mt-14 flex gap-10 sm:gap-16 flex-wrap">
                {[
                  { label: "Countdown", value: `${bookedTrip.countdownDays} days` },
                  { label: "Party", value: String(bookedTrip.partySize) },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="label-text !text-white/50 mb-2" style={{ fontSize: '0.625rem', letterSpacing: '0.2em' }}>{d.label}</p>
                    <p className="font-display text-3xl sm:text-4xl text-white">{d.value}</p>
                  </div>
                ))}
                <div>
                  <p className="label-text !text-[hsl(var(--gold-light))]/60 mb-2" style={{ fontSize: '0.625rem', letterSpacing: '0.2em' }}>Time Reclaimed</p>
                  <p className="font-display text-3xl sm:text-4xl text-[hsl(var(--gold-light))]">{bookedTrip.timeReclaimed}</p>
                </div>
              </motion.div>
              <motion.div {...slideLeft(0.3)} className="mt-10">
                <Link to={`/trip/${bookedTrip.tripId}`}>
                  <span className="link-editorial font-editorial text-sm text-white/60 hover:text-white">View full itinerary →</span>
                </Link>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center justify-center px-8 py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6, ease }}
                className="bg-white/95 backdrop-blur-sm rounded-lg px-8 py-6 shadow-soft"
              >
                <p className="label-text tracking-[0.15em] mb-1 !text-foreground/50">Magic starts in</p>
               <p className="font-display-bold text-4xl text-foreground">{bookedTrip.countdownDays} days</p>
              </motion.div>
            </div>
          </div>

          {/* Timeline scroll */}
          <div className="border-t border-white/[0.08] py-10 lg:py-14">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />
              <div
                ref={timelineRef}
                className="flex gap-5 overflow-x-auto px-8 pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {bookedTrip.travelLegs.map((leg, i) => (
                  <motion.div
                    key={leg.legName}
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease }}
                    className="flex-shrink-0 w-[260px] sm:w-[300px] group cursor-pointer"
                  >
                     <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 h-full hover:bg-white/15 transition-colors duration-500 overflow-hidden">
                      <p className="label-text !text-white/50 mb-3" style={{ fontSize: '0.625rem' }}>{leg.date}</p>
                      <p className="font-display text-lg text-white mb-1 truncate">{leg.legName}</p>
                      <p className="font-editorial text-sm text-white/55 mb-5" style={{ fontSize: '0.75rem', letterSpacing: '-0.02em' }}>{leg.time}</p>
                      <div className="gold-rule mb-3" />
                      <p className="font-editorial text-xs text-white/30 italic group-hover:text-white/50 transition-colors duration-500 line-clamp-2">{leg.note}</p>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease }}
                  className="flex-shrink-0 w-[260px] sm:w-[300px] group cursor-pointer"
                >
                  <Link to={`/trip/${bookedTrip.tripId}`}>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 h-full hover:bg-white/15 transition-colors duration-500 overflow-hidden">
                      <p className="label-text !text-white/50 mb-3" style={{ fontSize: '0.625rem' }}>Preparations</p>
                      <p className="font-display text-lg text-white mb-3">Packing</p>
                      <div className="space-y-2 mb-5">
                        {bookedTrip.packingLists.map((list) => (
                          <div key={list.category} className="flex justify-between items-center">
                            <p className="font-editorial text-sm text-white/60 truncate mr-3">{list.category}</p>
                            <p className="label-text !text-white/40 shrink-0" style={{ fontSize: '0.6rem' }}>{list.packedCount}/{list.totalCount}</p>
                          </div>
                        ))}
                      </div>
                      <div className="gold-rule mb-3" />
                      <p className="font-editorial text-xs text-white/30 italic group-hover:text-white/50 transition-colors duration-500">Review list →</p>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4, ease }}
                  className="flex-shrink-0 w-[260px] sm:w-[300px]"
                >
                  <div className="bg-[hsl(var(--gold-dark))]/10 backdrop-blur-md rounded-lg p-5 h-full border border-[hsl(var(--gold))]/10 overflow-hidden">
                    <p className="label-text !text-[hsl(var(--gold-light))]/50 mb-3" style={{ fontSize: '0.625rem' }}>Time Reclaimed</p>
                    <p className="font-display text-3xl text-[hsl(var(--gold-light))] mb-1">{bookedTrip.timeReclaimed}</p>
                    <p className="font-editorial text-xs text-white/35 mb-4 italic">Given back to your family. 💛</p>
                    <div className="space-y-2">
                      {bookedTrip.ridesSaved.slice(0, 3).map((s) => (
                        <div key={s.rideName} className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs opacity-40 shrink-0">{s.emoji}</span>
                          <p className="font-editorial text-xs text-white/50 truncate" style={{ letterSpacing: '-0.02em' }}>{s.minutesSaved} · {s.rideName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: timelineCardCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = timelineRef.current;
                      if (!el) return;
                      const card = el.children[i] as HTMLElement;
                      if (card) el.scrollTo({ left: card.offsetLeft - 32, behavior: 'smooth' });
                    }}
                    className={`w-4 h-1.5 rounded-full transition-all duration-500 ${
                      i === activeTimelineIdx
                        ? "bg-white/60"
                        : "bg-white/15 hover:bg-white/25"
                    }`}
                    aria-label={`Go to card ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PARK TILES — Horizontal scrollable visual cards ═══ */}
      <section className="py-20 lg:py-28 bg-[hsl(var(--warm))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-12">
          <motion.div {...fade()}>
            <p className="label-text mb-6 tracking-[0.25em]">Park Guide 🗺️</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08]">
              Know before you go.
            </h2>
            <p className="font-editorial text-sm text-muted-foreground mt-3">Insider tips, crowd levels, and must-do's for the whole family.</p>
          </motion.div>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[hsl(var(--warm))] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[hsl(var(--warm))] to-transparent z-10 pointer-events-none" />
          <div
            ref={parkScrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-8 pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {parkGuides.map((park, i) => (
              <motion.div
                key={park.parkId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.12, ease }}
                whileHover={{ y: -6 }}
                className="flex-shrink-0 w-[300px] sm:w-[340px] group"
              >
                <Link to={`/parks/${park.parkId}`}>
                  <div className="relative h-[420px] overflow-hidden rounded-2xl">
                    <img
                      src={park.heroImage}
                      alt={park.parkName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="label-text !text-white/60 mb-2 tracking-[0.2em]">{park.resortName}</p>
                      <h3 className="font-display text-2xl text-white mb-4 group-hover:text-[hsl(var(--gold-light))] transition-colors duration-500">{park.parkName}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/50">Weather</p>
                          <p className="font-editorial text-sm text-white/90">{park.todayWeather}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/50">Crowds</p>
                          <p className="font-editorial text-sm text-white/90">{park.todayCrowdLevel}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/50">Hours</p>
                          <p className="font-editorial text-sm text-white/90">{park.operatingHours.regular}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {park.categories.slice(0, 3).map((c) => (
                          <span key={c.label} className="label-text !text-white/40 text-[0.6rem]">{c.label} · {c.itemCount}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2.5 mt-8 w-full">
          {parkGuides.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = parkScrollRef.current;
                if (!el) return;
                const card = el.children[i] as HTMLElement;
                if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
              }}
              className={`w-5 h-2.5 rounded-full border transition-all duration-500 ${
                i === activeParkIdx
                  ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]"
                  : "bg-transparent border-muted-foreground/30 hover:border-[hsl(var(--gold-light))]"
              }`}
              aria-label={`Go to park ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══ TWO COLUMN — Plan Next Trip + Inner Circle ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8 bg-[hsl(var(--warm))]">
        {/* Plan Your Next Trip — left */}
        <div className="relative overflow-hidden rounded-lg shadow-soft hover:shadow-soft-hover transition-shadow duration-500">
          <Link to="/adventure" className="group block">
            <div className="relative h-[500px] overflow-hidden">
              <ParallaxImage src={editorialCalendar} alt="Plan your next trip" className="absolute inset-0 h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 group-hover:from-black/90 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 lg:px-12 pb-10 sm:pb-12">
                <motion.div {...fade(0.1)}>
                  <p className="label-text !text-white/60 mb-4 tracking-[0.3em]">
                    {futureTrips.length > 0 ? "Plan Your Next Trip ✈️" : "Plan Your First Trip 🌟"}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.1] mb-3">
                    {futureTrips.length > 0 ? "Where will the magic take you next?" : "Your family adventure starts here."}
                  </h3>
                  <p className="font-editorial text-sm text-white/80 mb-6 max-w-sm">
                    {futureTrips.length > 0
                      ? `${futureTrips.length} trip${futureTrips.length > 1 ? "s" : ""} in the works — tap to explore dates, parks, and strategies.`
                      : "Choose a destination and we'll help you plan every magical moment."}
                  </p>
                  <span className="inline-flex items-center gap-2 font-editorial text-sm text-white border-b border-white/50 pb-1 group-hover:border-white transition-all duration-500">
                    Start planning →
                  </span>
                </motion.div>
              </div>
            </div>
          </Link>
        </div>

        {/* Inner Circle — right */}
        <div className="bg-[hsl(var(--warm))] border border-[hsl(var(--border))] rounded-lg shadow-soft hover:shadow-soft-hover transition-shadow duration-500 flex flex-col px-4 sm:px-6 lg:px-8 py-7 sm:py-8 h-auto md:h-[500px] overflow-hidden">
          <div className="shrink-0">
            <motion.div {...slideRight()}>
              <p className="label-text mb-2 tracking-[0.3em]">The Inner Circle 👨‍👩‍👧‍👦</p>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-[1.1] mb-1">Your party</h3>
              <p className="font-editorial text-sm text-muted-foreground mb-4">The crew that makes every trip unforgettable.</p>
            </motion.div>
          </div>

          <motion.div {...slideRight(0.15)} className="space-y-1.5 flex-1 min-h-0 overflow-hidden">
            {partyMembers.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease }}
                className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 hover:bg-foreground/[0.03] transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] flex items-center justify-center shrink-0 shadow-md"
                >
                  <span className="font-display text-sm text-primary-foreground">{m.initial}</span>
                </motion.div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-display text-sm sm:text-base text-foreground group-hover:text-[hsl(var(--gold))] transition-colors duration-500 truncate">{m.name}</p>
                  <p className="label-text mt-0.5 text-[0.55rem] truncate">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm text-foreground/70">{m.adventureCount}</p>
                  <p className="label-text text-[0.5rem]">trips</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...slideRight(0.3)} className="mt-2 pt-3 border-t border-border shrink-0">
            <Link to="/circle">
              <span className="link-editorial font-editorial text-sm text-muted-foreground hover:text-foreground">Manage travelers →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ MEMORIES — Editorial magazine spread ═══ */}
      <section className="bg-[hsl(var(--warm))] py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div {...fade()} className="mb-16 sm:mb-24">
            <p className="label-text mb-6 sm:mb-8">The Digital Gallery 📸</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.1]">
              Moments worth keeping. ✦
            </h2>
            <p className="font-editorial text-sm text-muted-foreground mt-3 max-w-lg">Relive the laughs, the fireworks, and the ice cream faces.</p>
          </motion.div>
        </div>

        {/* Editorial spread — asymmetric, layered, breathing */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10 sm:space-y-16">

          {/* Hero full-bleed — first memory anchors the chapter */}
          {tripMemories[0] && (
            <motion.div {...scaleIn(0)} className="relative">
              <Link to={`/memories/${tripMemories[0].tripId}`} className="group block relative overflow-hidden">
                <div className="relative h-[50vh] sm:h-[60vh]">
                  <img
                    src={tripMemories[0].coverImage}
                    alt={tripMemories[0].tripName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </Link>
              {/* Overlapping scrapbook label */}
              <div className="relative sm:absolute sm:bottom-0 sm:left-0 sm:translate-y-1/2 bg-[hsl(var(--warm))] sm:ml-8 lg:ml-12 px-6 py-4 sm:shadow-soft z-10">
                <p className="label-text mb-1" style={{ fontSize: '0.6rem' }}>{tripMemories[0].date}</p>
                <p className="font-display text-xl sm:text-2xl text-foreground">{tripMemories[0].tripName}</p>
                <p className="font-editorial text-xs text-muted-foreground mt-1">{tripMemories[0].photoCount} photos · {tripMemories[0].destination}</p>
              </div>
            </motion.div>
          )}

          {/* Asymmetric pair — large left, small right with breathing gap */}
          {tripMemories.length > 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-10 sm:pt-8">
              <motion.div {...scaleIn(0.08)} className="sm:col-span-3 relative">
                <Link to={`/memories/${tripMemories[1].tripId}`} className="group block overflow-hidden">
                  <div className="relative h-[280px] sm:h-[360px]">
                    <img
                      src={tripMemories[1].coverImage}
                      alt={tripMemories[1].tripName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <div className="mt-4 sm:mt-5">
                  <p className="label-text" style={{ fontSize: '0.6rem' }}>{tripMemories[1].date}</p>
                  <p className="font-display text-lg text-foreground mt-1">{tripMemories[1].tripName}</p>
                </div>
              </motion.div>

              <motion.div {...scaleIn(0.16)} className="sm:col-span-2 relative sm:mt-16">
                <Link to={`/memories/${tripMemories[2].tripId}`} className="group block overflow-hidden">
                  <div className="relative h-[280px] sm:h-[300px]">
                    <img
                      src={tripMemories[2].coverImage}
                      alt={tripMemories[2].tripName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <div className="mt-4 sm:mt-5">
                  <p className="label-text" style={{ fontSize: '0.6rem' }}>{tripMemories[2].date}</p>
                  <p className="font-display text-lg text-foreground mt-1">{tripMemories[2].tripName}</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Reversed asymmetric pair — small left, large right */}
          {tripMemories.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-10">
              <motion.div {...scaleIn(0.24)} className="sm:col-span-2 relative sm:mt-10">
                <Link to={`/memories/${tripMemories[3].tripId}`} className="group block overflow-hidden">
                  <div className="relative h-[260px] sm:h-[320px]">
                    <img
                      src={tripMemories[3].coverImage}
                      alt={tripMemories[3].tripName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                {/* Overlapping date tag */}
                <div className="relative sm:absolute sm:top-0 sm:right-0 sm:-translate-y-1/2 bg-[hsl(var(--warm))] px-5 py-3 sm:shadow-soft z-10 mt-4 sm:mt-0">
                  <p className="label-text" style={{ fontSize: '0.6rem' }}>{tripMemories[3].date}</p>
                  <p className="font-display text-base text-foreground mt-0.5">{tripMemories[3].tripName}</p>
                </div>
              </motion.div>

              <motion.div {...scaleIn(0.32)} className="sm:col-span-3 relative">
                <Link to={`/memories/${tripMemories[4].tripId}`} className="group block overflow-hidden">
                  <div className="relative h-[280px] sm:h-[400px]">
                    <img
                      src={tripMemories[4].coverImage}
                      alt={tripMemories[4].tripName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </Link>
                <div className="mt-4 sm:mt-5">
                  <p className="label-text" style={{ fontSize: '0.6rem' }}>{tripMemories[4].date}</p>
                  <p className="font-display text-lg text-foreground mt-1">{tripMemories[4].tripName}</p>
                  <p className="font-editorial text-xs text-muted-foreground mt-1">{tripMemories[4].photoCount} photos · {tripMemories[4].destination}</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div {...fade(0.3)} className="mt-16 sm:mt-20 text-center">
            <Link to="/memories">
              <span className="link-editorial font-editorial text-sm text-muted-foreground hover:text-foreground">View all memories →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />

      </div>{/* close z-10 scroll-over wrapper */}

      <FloatingAnchor />
    </div>
  );
};

export default Index;
