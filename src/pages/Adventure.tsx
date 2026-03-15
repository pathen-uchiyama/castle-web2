import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import fireworksNight from "@/assets/fireworks-night.jpg";
import editorialPacking from "@/assets/editorial-packing.jpg";
import editorialCalendar from "@/assets/editorial-calendar.jpg";
import editorialDining from "@/assets/editorial-dining.jpg";
import SparkleField from "@/components/SparkleField";
import TripWizard from "@/components/TripWizard";
import type { BookedTrip, FutureTrip } from "@/data/types";
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
  futureTrips: FutureTrip[];
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "surveys", label: "Surveys", badge: "2 pending" },
  { id: "designer", label: "The Designer" },
  { id: "prep", label: "Prep & Checklists" },
];

const statusLabels: Record<string, string> = {
  dreaming: "Dreaming",
  planning: "Planning",
  booking: "Booking",
};

const Adventure = ({ bookedTrip, futureTrips }: AdventureProps) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { destination, tripName, countdownDays, travelLegs, preparations, packingLists } = bookedTrip;
  const { partySurvey } = mockData;

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

  const pendingCount = partySurvey.responses.filter((r) => r.status === "pending").length;
  const completedCount = partySurvey.responses.filter((r) => r.status === "completed").length;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[50vh] overflow-hidden">
        <img src={bookedTrip.heroImage} alt={destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={10} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-12">
          <motion.p {...fade()} className="label-text !text-white/40 mb-4 tracking-[0.3em]">Plan Your Trip</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-4xl sm:text-6xl leading-[1.02]">{destination}</motion.h1>
          <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-4">{tripName} · {countdownDays} days away</motion.p>
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-[hsl(var(--warm))] px-8 lg:px-16 sticky top-16 z-30">
        <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ═══ OVERVIEW TAB — All Trips Dashboard ═══ */}
      {activeTab === "overview" && (
        <>
          {/* Active Trip */}
          <section className="px-8 lg:px-16 py-16 lg:py-24">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Active Adventure</p>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Your trips at a glance.</h2>
              <div className="gold-rule mb-12" />
            </motion.div>

            {/* Booked Trip Card */}
            <motion.div {...fade(0.1)} className="mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-border bg-card shadow-[var(--shadow-soft)] overflow-hidden">
                <div className="lg:col-span-2 relative min-h-[240px]">
                  <img src={bookedTrip.heroImage} alt={bookedTrip.destination} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium bg-foreground text-background">
                      Booked
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                  <p className="label-text mb-3">{bookedTrip.countdownDays} days away</p>
                  <h3 className="font-display text-3xl text-foreground mb-2">{bookedTrip.destination}</h3>
                  <p className="font-editorial text-muted-foreground mb-6">{bookedTrip.tripName} · Party of {bookedTrip.partySize}</p>
                  <p className="font-editorial text-sm text-muted-foreground/70 max-w-lg mb-8 leading-relaxed">
                    {bookedTrip.description}
                  </p>
                  <div className="flex flex-wrap gap-6 mb-8">
                    {[
                      { label: "Surveys", value: `${completedCount}/${partySurvey.responses.length}`, sub: "completed" },
                      { label: "Travel Legs", value: String(travelLegs.length), sub: "scheduled" },
                      { label: "Packing", value: `${packingLists.reduce((a, l) => a + l.packedCount, 0)}/${packingLists.reduce((a, l) => a + l.totalCount, 0)}`, sub: "packed" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="label-text mb-1">{stat.label}</p>
                        <p className="font-display text-2xl text-foreground">{stat.value}</p>
                        <p className="font-editorial text-xs text-muted-foreground/50">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab("surveys")}
                      className="px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-500 hover:opacity-90"
                    >
                      View Surveys
                    </button>
                    <button
                      onClick={() => setActiveTab("prep")}
                      className="px-6 py-2.5 text-xs tracking-[0.15em] uppercase font-medium text-foreground border border-border transition-opacity duration-500 hover:opacity-70"
                    >
                      Prep & Checklists
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Journey Timeline */}
            <motion.div {...fade(0.15)} className="mb-16">
              <p className="label-text mb-6">The Journey</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {travelLegs.map((leg, i) => (
                  <motion.div key={leg.legName} {...fade(0.2 + i * 0.05)} className="border border-border bg-card p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                    <p className="label-text mb-2">{leg.date} · {leg.time}</p>
                    <h4 className="font-display text-lg text-foreground mb-2">{leg.legName}</h4>
                    <p className="font-editorial text-sm text-muted-foreground italic">{leg.note}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Future Trips */}
            {futureTrips.length > 0 && (
              <motion.div {...fade(0.2)}>
                <p className="label-text mb-6">On the Horizon</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {futureTrips.map((trip, i) => (
                    <motion.div
                      key={trip.tripId}
                      {...fade(0.25 + i * 0.1)}
                      className="group border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 cursor-pointer"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={trip.heroImage}
                          alt={trip.destination}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium border"
                            style={{
                              background: trip.status === "planning" ? "hsl(var(--gold) / 0.15)" : "hsl(var(--muted))",
                              borderColor: trip.status === "planning" ? "hsl(var(--gold) / 0.3)" : "hsl(var(--border))",
                              color: trip.status === "planning" ? "hsl(var(--gold-dark))" : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {statusLabels[trip.status] || trip.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="label-text mb-2">{trip.tentativeDate}</p>
                        <h3 className="font-display text-xl text-foreground mb-1">{trip.destination}</h3>
                        <p className="font-editorial text-sm text-muted-foreground mb-3">{trip.tripName}</p>
                        <p className="font-editorial text-xs text-muted-foreground/60 italic">{trip.note}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </section>

          {/* Plan New Adventure CTA */}
          <section className="py-16 sm:py-24 text-center bg-[hsl(var(--warm))]">
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
        </>
      )}

      {/* ═══ SURVEYS TAB ═══ */}
      {activeTab === "surveys" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Consensus</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Party Preferences</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-12">
              Send surveys to your party. Everyone ranks attractions, then we find the consensus.
            </p>
          </motion.div>

          {/* Member status */}
          <motion.div {...fade(0.1)} className="flex flex-wrap gap-3 mb-12">
            {partySurvey.responses.map((resp) => (
              <div key={resp.memberId} className="flex items-center gap-2 border border-border bg-card px-4 py-2 shadow-[var(--shadow-soft)]">
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
                    Pending · Send Link
                  </Link>
                )}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div {...fade(0.15)} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Completed", value: String(completedCount) },
              { label: "Pending", value: String(pendingCount) },
              { label: "Attractions", value: String(partySurvey.attractions.length) },
              { label: "Conflicts", value: String(consensusData.filter((c) => c.hasConflict).length) },
            ].map((stat) => (
              <div key={stat.label} className="border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">{stat.label}</p>
                <p className="font-display text-3xl text-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Party Priorities */}
          {consensusData.filter((c) => c.isPartyPriority).length > 0 && (
            <motion.div {...fade(0.2)} className="mb-12">
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
          {consensusData.filter((c) => c.hasConflict).length > 0 && (
            <motion.div {...fade(0.25)} className="mb-12">
              <p className="label-text mb-6">⚡ Conflicts to Resolve</p>
              <div className="space-y-3">
                {consensusData.filter((c) => c.hasConflict).map((c) => (
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

          {/* All rankings */}
          <motion.div {...fade(0.3)}>
            <p className="label-text mb-6">All Attractions</p>
            <div className="space-y-2">
              {consensusData.filter((c) => !c.hasConflict).map((c) => (
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
      )}

      {/* ═══ DESIGNER TAB ═══ */}
      {activeTab === "designer" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Architect</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">The Designer</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-16">
              Generate a concierge-quality itinerary from your party's consensus, then refine it to perfection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <motion.div {...fade(0.1)} className="border border-border bg-card p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
              <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden">
                <img src={editorialCalendar} alt="Plan" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <p className="label-text mb-4">Step 1</p>
              <h3 className="font-display text-2xl text-foreground mb-3">Generate Concierge Draft</h3>
              <p className="font-editorial text-sm text-muted-foreground mb-8 leading-relaxed">
                Our algorithm builds a baseline plan using your survey data, park hours, crowd predictions, and Lightning Lane strategy.
              </p>
              <button className="px-8 py-3 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-opacity duration-500 hover:opacity-90">
                Generate Plan
              </button>
            </motion.div>

            <motion.div {...fade(0.2)} className="border border-border bg-card p-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
              <div className="relative h-48 -mx-8 -mt-8 mb-6 overflow-hidden">
                <img src={editorialDining} alt="Dining" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <p className="label-text mb-4">Step 2</p>
              <h3 className="font-display text-2xl text-foreground mb-3">Set Your Itinerary</h3>
              <p className="font-editorial text-sm text-muted-foreground mb-8 leading-relaxed">
                Drag and drop to reorder. Delete what doesn't fit. Add hidden gems. When you're ready, commit to lock it in.
              </p>
              <button className="px-8 py-3 text-sm tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border transition-opacity duration-500 hover:opacity-70" disabled>
                Awaiting Draft
              </button>
            </motion.div>
          </div>

          <motion.div {...fade(0.3)} className="border border-dashed border-border py-20 text-center">
            <p className="font-display text-2xl text-muted-foreground/40 mb-3">No itinerary yet</p>
            <p className="font-editorial text-sm text-muted-foreground/30">
              Generate a draft above, or complete your party surveys first for the best results.
            </p>
          </motion.div>
        </section>
      )}

      {/* ═══ PREP & CHECKLISTS TAB ═══ */}
      {activeTab === "prep" && (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh]">
            <div className="relative min-h-[40vh] lg:min-h-0 overflow-hidden">
              <img src={editorialPacking} alt="Packing" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[hsl(var(--warm))]/30" />
            </div>
            <div className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
              <motion.div {...fade()}>
                <p className="label-text mb-6">The Field Kit</p>
                <h2 className="font-display text-4xl text-foreground leading-[1.1] mb-10">Packing</h2>
              </motion.div>
              <motion.div {...slideRight(0.1)} className="space-y-6 mb-14">
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

          <section className="px-8 lg:px-16 py-16 lg:py-24">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Weather Outlook</p>
              <h2 className="font-display text-3xl text-foreground leading-[1.1] mb-4">Forecast-Driven Packing</h2>
              <p className="font-editorial text-muted-foreground max-w-xl mb-10">
                When connected to weather data, your packing list updates automatically — ponchos if rain exceeds 30%, sunscreen reminders for UV alerts.
              </p>
            </motion.div>
            <motion.div {...fade(0.1)} className="border border-dashed border-border py-16 text-center">
              <p className="font-display text-2xl text-muted-foreground/40 mb-3">Weather integration coming soon</p>
              <p className="font-editorial text-sm text-muted-foreground/30">
                Dynamic packing suggestions based on your trip dates and destination forecast.
              </p>
            </motion.div>
          </section>
        </>
      )}

      <Footer />
      <TripWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Adventure;
