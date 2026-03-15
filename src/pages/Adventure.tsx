import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import fireworksNight from "@/assets/fireworks-night.jpg";
import editorialPacking from "@/assets/editorial-packing.jpg";
import SparkleField from "@/components/SparkleField";
import TripWizard from "@/components/TripWizard";
import type { BookedTrip } from "@/data/types";
import { mockData } from "@/data/mockData";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});
const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.4, delay, ease },
});

interface AdventureProps {
  bookedTrip: BookedTrip;
}

const Adventure = ({ bookedTrip }: AdventureProps) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { destination, tripName, countdownDays, todaysPark, timeReclaimed, ridesSaved, travelLegs, preparations, packingLists } = bookedTrip;
  const { partySurvey } = mockData;

  // Consensus aggregation
  const consensusData = useMemo(() => {
    const completed = partySurvey.responses.filter((r) => r.status === "completed");
    if (completed.length === 0) return [];

    return partySurvey.attractions.map((attraction) => {
      const votes = { "must-do": 0, "like-to-do": 0, "will-avoid": 0 };
      let topFiveCount = 0;

      for (const resp of completed) {
        const rank = resp.rankings[attraction.attractionId];
        if (rank) votes[rank]++;
        if (resp.topFiveMustDos.includes(attraction.attractionId)) topFiveCount++;
      }

      const hasConflict = votes["must-do"] > 0 && votes["will-avoid"] > 0;
      const isPartyPriority = topFiveCount >= 2;

      return { attraction, votes, hasConflict, isPartyPriority, topFiveCount };
    }).sort((a, b) => {
      if (a.isPartyPriority !== b.isPartyPriority) return a.isPartyPriority ? -1 : 1;
      if (a.hasConflict !== b.hasConflict) return a.hasConflict ? -1 : 1;
      return b.votes["must-do"] - a.votes["must-do"];
    });
  }, [partySurvey]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative h-[60vh] overflow-hidden">
        <img src={bookedTrip.heroImage} alt={destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={10} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-16">
          <motion.p {...fade()} className="label-text !text-white/40 mb-6 tracking-[0.3em]">Your Booked Adventure</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-5xl sm:text-7xl leading-[1.02]">{destination}</motion.h1>
          <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-6">{tripName} · {countdownDays} days away</motion.p>
        </div>
      </section>

      {/* ═══ The Consensus ═══ */}
      <section className="px-8 lg:px-16 py-20 lg:py-28 bg-[hsl(var(--warm))]">
        <motion.div {...fade()}>
          <p className="label-text mb-6">The Consensus</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Party Preferences</h2>
          <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-12">
            Your party's combined rankings. Conflicts are highlighted for resolution.
          </p>
        </motion.div>

        {/* Member status chips */}
        <motion.div {...fade(0.1)} className="flex flex-wrap gap-3 mb-12">
          {partySurvey.responses.map((resp) => (
            <div key={resp.memberId} className="flex items-center gap-2 border border-border bg-card px-4 py-2">
              <div className="w-7 h-7 flex items-center justify-center bg-foreground text-background text-xs font-medium">
                {resp.memberId}
              </div>
              <span className="font-display text-sm text-foreground">{resp.memberName}</span>
              {resp.status === "completed" ? (
                <>
                  <span className="label-text !text-[hsl(var(--gold))]">✓ Complete</span>
                  {resp.openToAnything && <span className="text-xs" title="Open to anything">✨</span>}
                </>
              ) : (
                <Link
                  to={`/survey/${partySurvey.tripId}/${resp.memberId.toLowerCase()}`}
                  className="label-text !text-[hsl(var(--gold))] hover:underline"
                >
                  Pending · Copy Link
                </Link>
              )}
            </div>
          ))}
        </motion.div>

        {/* Party Priorities */}
        {consensusData.filter((c) => c.isPartyPriority).length > 0 && (
          <motion.div {...fade(0.15)} className="mb-12">
            <p className="label-text mb-6">✦ Party Priorities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {consensusData.filter((c) => c.isPartyPriority).map((c) => (
                <div key={c.attraction.attractionId} className="border border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)] p-5">
                  <h4 className="font-display text-lg text-foreground mb-1">{c.attraction.name}</h4>
                  <p className="label-text mb-3">{c.attraction.parkId.toUpperCase()} · {c.topFiveCount} members' Top 5</p>
                  <div className="flex gap-4">
                    <span className="text-xs text-muted-foreground">{c.votes["must-do"]} Must-Do</span>
                    <span className="text-xs text-muted-foreground">{c.votes["like-to-do"]} Like</span>
                    {c.votes["will-avoid"] > 0 && <span className="text-xs text-destructive">{c.votes["will-avoid"]} Avoid</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Conflicts */}
        {consensusData.filter((c) => c.hasConflict && !c.isPartyPriority).length > 0 && (
          <motion.div {...fade(0.2)} className="mb-12">
            <p className="label-text mb-6">⚡ Conflicts to Resolve</p>
            <div className="space-y-3">
              {consensusData.filter((c) => c.hasConflict && !c.isPartyPriority).map((c) => (
                <div key={c.attraction.attractionId} className="flex items-center justify-between border border-[hsl(var(--gold)/0.3)] p-4 bg-card">
                  <div>
                    <h4 className="font-display text-lg text-foreground">{c.attraction.name}</h4>
                    <span className="label-text">{c.attraction.parkId.toUpperCase()}</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-foreground">{c.votes["must-do"]} Must-Do</span>
                    <span className="text-destructive">{c.votes["will-avoid"]} Avoid</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All rankings summary */}
        <motion.div {...fade(0.25)}>
          <p className="label-text mb-6">All Attractions</p>
          <div className="space-y-2">
            {consensusData.filter((c) => !c.isPartyPriority && !c.hasConflict).slice(0, 10).map((c) => (
              <div key={c.attraction.attractionId} className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="font-display text-foreground">{c.attraction.name}</span>
                  <span className="label-text">{c.attraction.parkId.toUpperCase()}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {c.votes["must-do"] > 0 && <span>{c.votes["must-do"]} Must-Do</span>}
                  {c.votes["like-to-do"] > 0 && <span>{c.votes["like-to-do"]} Like</span>}
                  {c.votes["will-avoid"] > 0 && <span className="text-destructive">{c.votes["will-avoid"]} Avoid</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Schedule + Time saved */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="px-8 lg:px-16 py-20 lg:py-28">
          <motion.div {...fade()}>
            <p className="label-text mb-8">Today's Park</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-10">{todaysPark.parkName}</h2>
          </motion.div>
          <motion.div {...fade(0.15)} className="space-y-8">
            {[
              { label: "Weather", text: todaysPark.weather },
              { label: "Crowd Level", text: todaysPark.crowdLevel },
              { label: "Strategy", text: todaysPark.strategy },
            ].map((item) => (
              <div key={item.label}>
                <p className="label-text mb-2">{item.label}</p>
                <p className="font-editorial text-lg text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="px-8 lg:px-16 py-20 lg:py-28 bg-[hsl(var(--warm))]">
          <motion.div {...fade()}>
            <p className="label-text mb-8">Time Recovered</p>
            <h2 className="font-display text-6xl sm:text-7xl text-foreground leading-[0.9] mb-8">{timeReclaimed}</h2>
          </motion.div>
          <motion.div {...fade(0.2)} className="space-y-6">
            {ridesSaved.map((s) => (
              <div key={s.rideName} className="flex items-start gap-4 group cursor-pointer">
                <span className="text-lg mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">{s.emoji}</span>
                <div>
                  <p className="font-display text-lg text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{s.minutesSaved} saved</p>
                  <p className="font-editorial text-sm text-muted-foreground mt-1">{s.rideName}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Journey */}
      <section className="section-dark">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[70vh]">
          <div className="lg:col-span-3 relative min-h-[40vh] lg:min-h-0">
            <img src={fireworksNight} alt="Night sky" className="w-full h-full object-cover" />
          </div>
          <div className="lg:col-span-2 px-8 lg:px-14 py-20 lg:py-28 flex flex-col justify-center">
            <motion.div {...fade()}><p className="label-text mb-8">The Journey</p></motion.div>
            <div className="space-y-12">
              {travelLegs.map((trip, i) => (
                <motion.div key={trip.legName} {...fade(i * 0.1)}>
                  <p className="label-text mb-2">{trip.date} · {trip.time}</p>
                  <h3 className="font-display text-2xl text-white mb-1">{trip.legName}</h3>
                  <p className="font-editorial text-sm text-white/50 italic">{trip.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packing + Preparations side by side */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="relative min-h-[40vh] lg:min-h-0 overflow-hidden">
          <img src={editorialPacking} alt="Packing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[hsl(var(--warm))]/30" />
        </div>
        <div className="px-8 lg:px-16 py-20 lg:py-28 bg-[hsl(var(--warm))]">
          <motion.div {...fade()}>
            <p className="label-text mb-8">The Trunk</p>
            <h2 className="font-display text-4xl text-foreground leading-[1.1] mb-12">Packing</h2>
          </motion.div>
          <motion.div {...slideRight(0.1)} className="space-y-8 mb-16">
            {packingLists.map((list) => (
              <div key={list.category}>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="font-display text-lg text-foreground">{list.category}</p>
                  <p className="label-text">{list.packedCount}/{list.totalCount}</p>
                </div>
                <div className="w-full h-px bg-border relative">
                  <div className="absolute left-0 top-0 h-full bg-foreground/30" style={{ width: `${(list.packedCount / list.totalCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div {...fade(0.2)}>
            <p className="label-text mb-6">Preparations</p>
          </motion.div>
          <motion.div {...fade(0.25)} className="space-y-4">
            {preparations.map((t) => (
              <p key={t.description} className={`font-editorial text-sm leading-relaxed ${t.isComplete ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"}`}>
                {t.description}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Plan a New Adventure CTA ═══ */}
      <section className="py-20 sm:py-28 text-center bg-[hsl(var(--warm))]">
        <motion.div {...fade()}>
          <p className="label-text mb-6">The Voyage Canvas</p>
          <h2 className="font-display text-foreground leading-[1.08] mb-4" style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)" }}>
            Plan a new adventure.
          </h2>
          <div className="gold-rule mx-auto mb-6" />
          <p className="font-editorial text-sm text-muted-foreground max-w-md mx-auto mb-10">
            Launch the Strategy Wizard to architect your next perfect park day.
          </p>
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center justify-center px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-all duration-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Initialize Your Journey
          </button>
        </motion.div>
      </section>

      <Footer />

      <TripWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Adventure;
