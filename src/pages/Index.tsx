import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "@/components/Footer";
import { useRef } from "react";
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
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="label-text !text-white/40 mb-10 tracking-[0.3em]">
            Castle Companion
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.8, ease }} className="font-display text-white text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] leading-[1.02] max-w-4xl">
            Welcome, <em className="italic" style={{ fontWeight: 400 }}>{guestName}</em>.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }} className="font-editorial text-white/60 text-lg sm:text-xl mt-8 max-w-lg leading-relaxed">
            The realm is at rest. Your next chapter awaits.
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
                <p className="label-text !text-white/50 mb-10 tracking-[0.25em]">Your Booked Adventure</p>
                <h2 className="font-display text-4xl sm:text-5xl xl:text-6xl text-white leading-[1.08] mb-6">
                  {bookedTrip.destination}
                </h2>
                <p className="font-display text-2xl sm:text-3xl text-white/60 leading-[1.2] mb-8">
                  {bookedTrip.tripName}
                </p>
                <p className="font-editorial text-base text-white/50 max-w-md leading-relaxed">
                  {bookedTrip.description}
                </p>
              </motion.div>
              <motion.div {...slideLeft(0.2)} className="mt-14 flex gap-10 sm:gap-16 flex-wrap">
                {[
                  { label: "Countdown", value: `${bookedTrip.countdownDays} days` },
                  { label: "Party", value: String(bookedTrip.partySize) },
                  { label: "Time Saved", value: bookedTrip.timeReclaimed },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="label-text !text-white/40 mb-2">{d.label}</p>
                    <p className="font-display text-3xl sm:text-4xl text-white">{d.value}</p>
                  </div>
                ))}
              </motion.div>
              <motion.div {...slideLeft(0.3)} className="mt-10">
                <Link to={`/trip/${bookedTrip.tripId}`}>
                  <span className="link-editorial font-editorial text-sm text-white/70 hover:text-white">View full itinerary →</span>
                </Link>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center justify-center px-8 py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6, ease }}
                className="bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl"
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
                    <div className="rounded-xl bg-white/10 backdrop-blur-md p-5 h-full hover:bg-white/15 transition-colors duration-500">
                      <p className="label-text !text-white/35 mb-3">{leg.date}</p>
                      <p className="font-display text-lg text-white mb-1">{leg.legName}</p>
                      <p className="font-editorial text-sm text-white/40 mb-5">{leg.time}</p>
                      <div className="gold-rule mb-3" />
                      <p className="font-editorial text-xs text-white/30 italic group-hover:text-white/50 transition-colors duration-500">{leg.note}</p>
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
                    <div className="rounded-xl bg-white/10 backdrop-blur-md p-5 h-full hover:bg-white/15 transition-colors duration-500">
                      <p className="label-text !text-white/35 mb-3">Preparations</p>
                      <p className="font-display text-lg text-white mb-3">Packing</p>
                      <div className="space-y-2 mb-5">
                        {bookedTrip.packingLists.map((list) => (
                          <div key={list.category} className="flex justify-between items-center">
                            <p className="font-editorial text-sm text-white/50">{list.category}</p>
                            <p className="label-text !text-white/25">{list.packedCount}/{list.totalCount}</p>
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
                  <div className="rounded-xl bg-white/10 backdrop-blur-md p-5 h-full">
                    <p className="label-text !text-white/35 mb-3">Time Recovered</p>
                    <p className="font-display text-3xl text-white mb-3">{bookedTrip.timeReclaimed}</p>
                    <div className="space-y-2">
                      {bookedTrip.ridesSaved.slice(0, 3).map((s) => (
                        <div key={s.rideName} className="flex items-center gap-2">
                          <span className="text-xs opacity-40">{s.emoji}</span>
                          <p className="font-editorial text-xs text-white/50">{s.minutesSaved} · {s.rideName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PARK TILES — Horizontal scrollable visual cards ═══ */}
      <section className="py-20 lg:py-28 bg-[hsl(var(--warm))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-12">
          <motion.div {...fade()}>
            <p className="label-text mb-6 tracking-[0.25em]">Park Guide</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08]">
              Know before you go.
            </h2>
          </motion.div>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[hsl(var(--warm))] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[hsl(var(--warm))] to-transparent z-10 pointer-events-none" />
          <div
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
                          <p className="font-editorial text-sm text-white/90">{park.operatingHours}</p>
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
      </section>

      {/* ═══ TWO COLUMN — Plan Next Trip + Inner Circle ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8 bg-[hsl(var(--warm))]">
        {/* Plan Your Next Trip — left */}
        <div className="relative overflow-hidden rounded-2xl">
          <Link to="/adventure" className="group block">
            <div className="relative h-[500px] overflow-hidden">
              <ParallaxImage src={editorialCalendar} alt="Plan your next trip" className="absolute inset-0 h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 lg:px-12 pb-10 sm:pb-12">
                <motion.div {...fade(0.1)}>
                  <p className="label-text !text-white/40 mb-4 tracking-[0.3em]">
                    {futureTrips.length > 0 ? "Plan Your Next Trip" : "Plan Your First Trip"}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.1] mb-3">
                    {futureTrips.length > 0 ? "Where will the magic take you?" : "Your adventure starts here."}
                  </h3>
                  <p className="font-editorial text-sm text-white/50 mb-6 max-w-sm">
                    {futureTrips.length > 0
                      ? `${futureTrips.length} trip${futureTrips.length > 1 ? "s" : ""} in the works — tap to explore dates, parks, and strategies.`
                      : "Choose a destination and let us handle the rest."}
                  </p>
                  <span className="inline-flex items-center gap-2 font-editorial text-sm text-white/80 border-b border-white/30 pb-1 group-hover:text-white group-hover:border-white/60 transition-all duration-500">
                    Start planning →
                  </span>
                </motion.div>
              </div>
            </div>
          </Link>
        </div>

        {/* Inner Circle — right */}
        <div className="bg-background rounded-2xl shadow-sm flex flex-col px-4 sm:px-6 lg:px-8 py-7 sm:py-8 h-auto md:h-[500px] overflow-hidden">
          <div className="shrink-0">
            <motion.div {...slideRight()}>
              <p className="label-text mb-2 tracking-[0.3em]">The Inner Circle</p>
              <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-[1.1] mb-1">Your party</h3>
              <p className="font-editorial text-sm text-muted-foreground mb-4">The crew that makes the magic happen ✨</p>
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
                className="flex items-center gap-3 group cursor-pointer rounded-xl p-2 -mx-2 hover:bg-[hsl(var(--warm))] transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] flex items-center justify-center shrink-0 shadow-md"
                >
                  <span className="font-display text-sm text-white">{m.initial}</span>
                </motion.div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-display text-sm sm:text-base text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500 truncate">{m.name}</p>
                  <p className="label-text mt-0.5 text-[0.55rem] truncate">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm text-foreground">{m.adventureCount}</p>
                  <p className="label-text text-[0.5rem]">trips</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...slideRight(0.3)} className="mt-2 pt-3 border-t border-border shrink-0">
            <Link to="/circle">
              <span className="link-editorial font-editorial text-sm text-foreground">Manage travelers →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ MEMORIES — Masonry gallery ═══ */}
      <section className="bg-[hsl(var(--warm))] py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div {...fade()} className="mb-10 sm:mb-16">
            <p className="label-text mb-6 sm:mb-8">Memories</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.1]">
              Moments worth keeping. ✦
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 auto-rows-[220px] sm:auto-rows-[280px]">
            {tripMemories.map((memory, i) => (
              <Link key={memory.tripId} to={`/memories/${memory.tripId}`} className={`${memory.gridSpan} group cursor-pointer relative overflow-hidden rounded-2xl block`}>
                <motion.div {...scaleIn(i * 0.08)} className="w-full h-full">
                  <motion.img
                    src={memory.coverImage}
                    alt={memory.tripName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 sm:p-5">
                    <div>
                      <p className="label-text !text-white/50 mb-1">{memory.date}</p>
                      <p className="font-display text-lg text-white">{memory.tripName}</p>
                      <p className="font-editorial text-xs text-white/40 mt-1">{memory.photoCount} photos · {memory.destination}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <motion.div {...fade(0.3)} className="mt-10 sm:mt-12 text-center">
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
