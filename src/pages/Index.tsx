import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import FloatingAnchor from "@/components/FloatingAnchor";
import SparkleField from "@/components/SparkleField";
import castleHero from "@/assets/castle-hero.jpg";
import editorialJournal from "@/assets/editorial-travel-journal.jpg";
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

      {/* ═══ HERO — Fixed behind, content scrolls over ═══ */}
      <header className="fixed inset-0 h-screen flex items-end overflow-hidden z-0">
        <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 3, ease }} className="absolute inset-0">
          <img src={castleHero} alt="Castle at dusk" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <SparkleField count={15} />
        <div className="relative w-full max-w-6xl mx-auto px-8 pb-20 lg:pb-28">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="label-text !text-white/40 mb-10 tracking-[0.3em]">
            Castle Companion
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.8, ease }} className="font-display text-white text-5xl sm:text-7xl lg:text-[6rem] leading-[1.02] max-w-4xl">
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

      {/* Spacer to push content below the fixed hero */}
      <div className="h-screen" />

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
            <div className="flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-28">
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
        <div className="max-w-6xl mx-auto px-8 mb-12">
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
            className="flex gap-6 overflow-x-auto px-8 pb-4"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="label-text !text-white/40 mb-2 tracking-[0.2em]">{park.resortName}</p>
                      <h3 className="font-display text-2xl text-white mb-4 group-hover:text-[hsl(var(--gold-light))] transition-colors duration-500">{park.parkName}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/30">Weather</p>
                          <p className="font-editorial text-sm text-white/70">{park.todayWeather}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/30">Crowds</p>
                          <p className="font-editorial text-sm text-white/70">{park.todayCrowdLevel}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="label-text !text-white/30">Hours</p>
                          <p className="font-editorial text-sm text-white/70">{park.operatingHours}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {park.categories.slice(0, 3).map((c) => (
                          <span key={c.label} className="label-text !text-white/20 text-[0.6rem]">{c.label} · {c.itemCount}</span>
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
          {futureTrips.map((trip, i) => (
            <Link key={trip.tripId} to={`/trip/${trip.tripId}`} className={`group block ${i > 0 ? "hidden" : ""}`}>
              <div className="relative h-[500px] overflow-hidden">
                <ParallaxImage src={trip.heroImage} alt={trip.tripName} className="absolute inset-0 h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-12 pb-12">
                  <motion.div {...fade(0.1)}>
                    <p className="label-text !text-white/40 mb-4 tracking-[0.3em]">Plan Your Next Trip</p>
                    <h3 className="font-display text-3xl sm:text-4xl text-white leading-[1.1] mb-3">{trip.tripName}</h3>
                    <p className="font-editorial text-sm text-white/50 mb-3">{trip.tentativeDate} · {trip.destination}</p>
                    <span className="label-text !text-white/25 capitalize">{trip.status}</span>
                  </motion.div>
                  {futureTrips.length > 1 && (
                    <motion.div {...fade(0.3)} className="mt-8 flex gap-3">
                      {futureTrips.map((ft, fi) => (
                        <Link key={ft.tripId} to={`/trip/${ft.tripId}`} className="group/dot">
                          <div className={`w-8 h-1 rounded-full ${fi === 0 ? "bg-white/60" : "bg-white/20"} group-hover/dot:bg-white/40 transition-colors duration-300`} />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Inner Circle — right */}
        <div className="bg-background rounded-2xl shadow-sm flex flex-col justify-between px-8 lg:px-12 py-12 h-[500px]">
          <div>
            <motion.div {...slideRight()}>
              <p className="label-text mb-4 tracking-[0.3em]">The Inner Circle</p>
              <h3 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.1] mb-2">Your party</h3>
              <p className="font-editorial text-sm text-muted-foreground mb-8">The crew that makes the magic happen ✨</p>
            </motion.div>
          </div>

          <motion.div {...slideRight(0.15)} className="space-y-4 flex-1 overflow-y-auto">
            {partyMembers.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease }}
                className="flex items-center gap-4 group cursor-pointer rounded-xl p-3 -mx-3 hover:bg-[hsl(var(--warm))] transition-colors duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] flex items-center justify-center shrink-0 shadow-md"
                >
                  <span className="font-display text-sm text-white">{m.initial}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{m.name}</p>
                  <p className="label-text mt-0.5 text-[0.6rem]">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm text-foreground">{m.adventureCount}</p>
                  <p className="label-text text-[0.55rem]">trips</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...slideRight(0.3)} className="mt-4 pt-5 border-t border-border">
            <Link to="/circle">
              <span className="link-editorial font-editorial text-sm text-foreground">Manage your travelers →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ MEMORIES — Masonry gallery ═══ */}
      <section className="bg-[hsl(var(--warm))] py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div {...fade()} className="mb-16">
            <p className="label-text mb-8">Memories</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1]">
              Moments worth keeping. ✦
            </h2>
          </motion.div>

          <div className="grid grid-cols-6 gap-3 auto-rows-[200px] sm:auto-rows-[280px]">
            {tripMemories.map((memory, i) => (
              <Link key={memory.tripId} to={`/memories/${memory.tripId}`} className={`${memory.gridSpan} group cursor-pointer relative overflow-hidden rounded-2xl block`}>
                <motion.div {...scaleIn(i * 0.08)} className="w-full h-full">
                  <motion.img
                    src={memory.coverImage}
                    alt={memory.tripName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
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

          <motion.div {...fade(0.3)} className="mt-12 text-center">
            <Link to="/memories">
              <span className="link-editorial font-editorial text-sm text-muted-foreground hover:text-foreground">View all memories →</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ COLOPHON ═══ */}
      <footer className="max-w-5xl mx-auto px-8 py-20">
        <div className="divider mb-12" />
        <motion.div {...fade()} className="flex items-baseline justify-between">
          <p className="font-editorial text-sm text-muted-foreground">Castle Companion — Be there for the magic.</p>
          <p className="label-text">MMXXVI</p>
        </motion.div>
      </footer>

      <FloatingAnchor />
    </div>
  );
};

export default Index;
