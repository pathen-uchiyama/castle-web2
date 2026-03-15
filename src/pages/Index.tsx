import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import FloatingAnchor from "@/components/FloatingAnchor";
import SparkleField from "@/components/SparkleField";
import castleHero from "@/assets/castle-hero.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import editorialJournal from "@/assets/editorial-travel-journal.jpg";
import editorialPacking from "@/assets/editorial-packing.jpg";
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
  const { todaysPark, ridesSaved, timeReclaimed } = bookedTrip;
  const wdwParks = parkGuides.filter((p) => p.resort === "wdw");
  const dlrParks = parkGuides.filter((p) => p.resort === "dlr");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══ HERO ═══ */}
      <header className="relative h-screen flex items-end overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2.5, ease }} className="absolute inset-0">
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

      {/* ═══ YOUR TRIP — Side-by-side: Itinerary + Countdown ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div className="flex flex-col justify-center px-8 lg:px-16 py-24 lg:py-32">
          <motion.div {...slideLeft()}>
            <p className="label-text mb-10 tracking-[0.25em]">Your Booked Adventure</p>
            <h2 className="font-display text-4xl sm:text-5xl xl:text-6xl text-foreground leading-[1.08] mb-8">
              {bookedTrip.destination}
            </h2>
            <p className="font-display text-2xl sm:text-3xl text-muted-foreground leading-[1.2] mb-10">
              {bookedTrip.tripName}
            </p>
            <p className="font-editorial text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              {bookedTrip.description}
            </p>
          </motion.div>
          <motion.div {...slideLeft(0.2)} className="mt-16 flex gap-12 sm:gap-20 flex-wrap">
            {[
              { label: "Countdown", value: `${bookedTrip.countdownDays} days` },
              { label: "Party", value: String(bookedTrip.partySize) },
              { label: "Time Saved", value: timeReclaimed },
            ].map((d) => (
              <div key={d.label}>
                <p className="label-text mb-2">{d.label}</p>
                <p className="font-display text-3xl sm:text-4xl text-foreground">{d.value}</p>
              </div>
            ))}
          </motion.div>
          <motion.div {...slideLeft(0.3)} className="mt-12">
            <Link to={`/trip/${bookedTrip.tripId}`}>
              <span className="link-editorial font-editorial text-sm text-foreground">View full itinerary →</span>
            </Link>
          </motion.div>
        </div>
        <motion.div {...slideRight(0.2)} className="relative min-h-[60vh] lg:min-h-0">
          <ParallaxImage src={bookedTrip.heroImage} alt={bookedTrip.destination} className="absolute inset-0 h-full" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
            className="absolute top-8 right-8 bg-white px-5 py-3 shadow-lg"
          >
            <p className="label-text !text-foreground tracking-[0.15em] mb-1">Magic starts in</p>
            <p className="font-display-bold text-2xl text-foreground">{bookedTrip.countdownDays} days</p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ DUAL: Today's Park + Packing ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        {/* Today — dark cinematic */}
        <Link to={`/trip/${bookedTrip.tripId}`} className="group">
          <div className="relative min-h-[70vh] overflow-hidden bg-[hsl(var(--ink))]">
            <motion.div {...scaleIn()} className="absolute inset-0">
              <ParallaxImage src={fireworksNight} alt="Night sky" className="h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </motion.div>
            <div className="relative h-full min-h-[70vh] flex flex-col justify-end px-8 lg:px-12 pb-12 lg:pb-16">
              <motion.div {...fade(0.2)}>
                <p className="label-text !text-white/40 mb-6">Today's Park</p>
                <h2 className="font-display text-5xl sm:text-6xl text-white leading-[1.05] mb-4">{todaysPark.parkName}</h2>
                <div className="flex gap-8 mt-6">
                  <div>
                    <p className="label-text !text-white/30 mb-1">Weather</p>
                    <p className="font-editorial text-base text-white/70">{todaysPark.weather}</p>
                  </div>
                  <div>
                    <p className="label-text !text-white/30 mb-1">Crowds</p>
                    <p className="font-editorial text-base text-white/70">{todaysPark.crowdLevel}</p>
                  </div>
                </div>
                <p className="font-editorial text-sm text-white/30 italic mt-8 group-hover:text-white/50 transition-colors duration-700">
                  {todaysPark.strategy} →
                </p>
              </motion.div>
            </div>
          </div>
        </Link>

        {/* Packing — warm with editorial image */}
        <Link to={`/trip/${bookedTrip.tripId}`} className="group">
          <div className="relative min-h-[70vh] overflow-hidden">
            <ParallaxImage src={editorialPacking} alt="Packing essentials" className="absolute inset-0 h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--warm))]/95 via-[hsl(var(--warm))]/70 to-transparent" />
            <div className="relative h-full min-h-[70vh] flex flex-col justify-end px-8 lg:px-12 pb-12 lg:pb-16">
              <motion.div {...slideRight()}>
                <p className="label-text mb-6">The Trunk</p>
                <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.05] mb-8">Packing</h2>
              </motion.div>
              <motion.div {...slideRight(0.15)} className="space-y-5">
                {bookedTrip.packingLists.map((list) => (
                  <div key={list.category} className="flex items-center justify-between">
                    <p className="font-editorial text-base text-foreground">{list.category}</p>
                    <p className="label-text">
                      {list.packedCount}/{list.totalCount}
                    </p>
                  </div>
                ))}
              </motion.div>
              <p className="font-editorial text-sm text-muted-foreground italic mt-8 group-hover:text-foreground transition-colors duration-700">
                Review packing list →
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══ PARK GUIDES — Full-width, side by side resort cards ═══ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div {...fade()} className="mb-16">
            <p className="label-text mb-8 tracking-[0.25em]">Park Guides</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08]">
              Know before you go.
            </h2>
          </motion.div>
        </div>

        {/* WDW + DLR side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* WDW */}
          <div className="bg-[hsl(var(--warm))] px-8 lg:px-14 py-16 lg:py-24">
            <motion.div {...slideLeft()}>
              <p className="label-text mb-6 tracking-[0.3em]">Walt Disney World</p>
              <p className="font-editorial text-sm text-muted-foreground italic mb-12">
                {wdwParks[0]?.typicalWeather}
              </p>
            </motion.div>
            <div className="space-y-10">
              {wdwParks.map((park, i) => (
                <motion.div key={park.parkId} {...slideLeft(i * 0.1)} className="group cursor-pointer">
                  <Link to={`/parks/${park.parkId}`}>
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 shrink-0 overflow-hidden">
                        <img src={park.heroImage} alt={park.parkName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="font-display text-xl text-foreground group-hover:text-gold-dark transition-colors duration-500">{park.parkName}</p>
                        <p className="font-editorial text-xs text-muted-foreground mt-1">{park.crowdCalendarSummary.slice(0, 60)}…</p>
                        <div className="flex gap-4 mt-3">
                          {park.categories.slice(0, 3).map((c) => (
                            <span key={c.label} className="label-text text-[0.6rem]">{c.label} · {c.itemCount}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* DLR */}
          <div className="section-dark px-8 lg:px-14 py-16 lg:py-24">
            <motion.div {...slideRight()}>
              <p className="label-text mb-6 tracking-[0.3em]">Disneyland Resort</p>
              <p className="font-editorial text-sm text-white/40 italic mb-12">
                {dlrParks[0]?.typicalWeather}
              </p>
            </motion.div>
            <div className="space-y-10">
              {dlrParks.map((park, i) => (
                <motion.div key={park.parkId} {...slideRight(i * 0.1)} className="group cursor-pointer">
                  <Link to={`/parks/${park.parkId}`}>
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 shrink-0 overflow-hidden">
                        <img src={park.heroImage} alt={park.parkName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="font-display text-xl text-white group-hover:text-gold-light transition-colors duration-500">{park.parkName}</p>
                        <p className="font-editorial text-xs text-white/40 mt-1">{park.crowdCalendarSummary.slice(0, 60)}…</p>
                        <div className="flex gap-4 mt-3">
                          {park.categories.slice(0, 3).map((c) => (
                            <span key={c.label} className="label-text !text-white/25 text-[0.6rem]">{c.label} · {c.itemCount}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIME RECOVERED — Full-width dramatic stat ═══ */}
      <section className="relative py-28 lg:py-40 overflow-hidden bg-[hsl(var(--warm))]">
        <SparkleField count={8} />
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div {...fade()}>
              <p className="label-text mb-8">Time Recovered</p>
              <motion.h2
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease }}
                className="font-display text-7xl sm:text-8xl lg:text-[8rem] text-foreground leading-[0.9]"
              >
                {timeReclaimed.split(" ")[0]}<br />{timeReclaimed.split(" ")[1]}
              </motion.h2>
              <p className="font-editorial text-base text-muted-foreground mt-8 max-w-sm leading-relaxed italic">
                From automated Lightning Lane acquisitions while you slept.
              </p>
            </motion.div>
            <motion.div {...slideRight(0.2)} className="space-y-8">
              {ridesSaved.map((s, i) => (
                <motion.div
                  key={s.rideName}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease }}
                  className="group flex items-start gap-4 cursor-pointer"
                >
                  <span className="text-lg mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">{s.emoji}</span>
                  <div>
                    <p className="font-display text-lg text-foreground group-hover:text-gold-dark transition-colors duration-500">{s.minutesSaved} saved</p>
                    <p className="font-editorial text-sm text-muted-foreground mt-1">{s.rideName}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FUTURE ADVENTURES — Side by side dream cards ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        {futureTrips.map((trip, i) => (
          <Link key={trip.tripId} to={`/trip/${trip.tripId}`} className="group">
            <div className="relative min-h-[50vh] lg:min-h-[60vh] overflow-hidden">
              <motion.div {...scaleIn(i * 0.15)} className="absolute inset-0">
                <ParallaxImage src={trip.heroImage} alt={trip.tripName} className="h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 group-hover:from-black/75 transition-all duration-700" />
              </motion.div>
              <div className="relative h-full min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-end px-8 lg:px-12 pb-12">
                <motion.div {...fade(0.1 + i * 0.15)}>
                  <p className="label-text !text-white/40 mb-3 tracking-[0.3em] capitalize">{trip.status}</p>
                  <h3 className="font-display text-3xl sm:text-4xl text-white leading-[1.1] mb-2">{trip.tripName}</h3>
                  <p className="font-editorial text-sm text-white/50 mb-4">{trip.tentativeDate} · {trip.destination}</p>
                  <p className="font-editorial text-xs text-white/30 italic group-hover:text-white/60 transition-colors duration-700">
                    {trip.note} →
                  </p>
                </motion.div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ═══ THE INNER CIRCLE + ACCOUNT — Side by side ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        {/* Circle */}
        <Link to="/circle" className="group">
          <div className="min-h-[60vh] bg-[hsl(var(--warm))] flex flex-col justify-between px-8 lg:px-14 py-12 lg:py-16">
            <motion.div {...fade(0.1)}>
              <p className="label-text mb-8 tracking-[0.3em]">The Inner Circle</p>
              <h3 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.1] mb-6">Your party</h3>
            </motion.div>
            <motion.div {...fade(0.2)} className="space-y-5 my-auto">
              {partyMembers.map((m) => (
                <div key={m.name} className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-10 h-10 bg-foreground flex items-center justify-center shrink-0">
                    <span className="font-display text-sm text-background">{m.initial}</span>
                  </motion.div>
                  <div>
                    <p className="font-display text-base text-foreground">{m.name}</p>
                    <p className="label-text mt-0.5 text-[0.6rem]">{m.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.div {...fade(0.3)}>
              <p className="font-editorial text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-700">Manage your travelers →</p>
            </motion.div>
          </div>
        </Link>

        {/* Account */}
        <Link to="/account" className="group">
          <div className="min-h-[60vh] section-dark flex flex-col justify-between px-8 lg:px-14 py-12 lg:py-16">
            <motion.div {...fade(0.2)}>
              <p className="label-text !text-white/30 mb-8 tracking-[0.3em]">Account</p>
              <h3 className="font-display text-3xl sm:text-4xl text-white leading-[1.1] mb-6">The details</h3>
            </motion.div>
            <motion.div {...fade(0.3)} className="space-y-8 my-auto">
              {[
                { label: "Plan", value: account.subscription.planName },
                { label: "Member since", value: account.memberSince },
                { label: "Adventures", value: String(account.adventuresCompleted) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="label-text !text-white/25 mb-1">{item.label}</p>
                  <p className="font-editorial text-lg text-white/70">{item.value}</p>
                </div>
              ))}
            </motion.div>
            <motion.div {...fade(0.4)}>
              <p className="font-editorial text-sm text-white/30 group-hover:text-white/60 transition-colors duration-700">Manage your account →</p>
            </motion.div>
          </div>
        </Link>
      </section>

      {/* ═══ MEMORIES — Masonry gallery, each clickable to a trip ═══ */}
      <section className="section-dark py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div {...fade()} className="mb-16">
            <p className="label-text mb-8">Memories</p>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-[1.1]">
              Moments worth keeping.
            </h2>
          </motion.div>

          <div className="grid grid-cols-6 gap-2 auto-rows-[200px] sm:auto-rows-[280px]">
            {tripMemories.map((memory, i) => (
              <Link key={memory.tripId} to={`/memories/${memory.tripId}`} className={`${memory.gridSpan} group cursor-pointer relative overflow-hidden block`}>
                <motion.div {...scaleIn(i * 0.08)} className="w-full h-full">
                  <motion.img
                    src={memory.coverImage}
                    alt={memory.tripName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
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
              <span className="link-editorial font-editorial text-sm text-white/60 hover:text-white/80">View all memories →</span>
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
