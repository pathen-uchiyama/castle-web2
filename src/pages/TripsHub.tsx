import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
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

interface TripsHubProps {
  bookedTrip: BookedTrip;
  futureTrips: FutureTrip[];
}

const statusLabels: Record<string, string> = {
  dreaming: "Dreaming",
  planning: "Planning",
  booking: "Booking",
};

const TripsHub = ({ bookedTrip, futureTrips }: TripsHubProps) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { partySurvey } = mockData;
  const completedCount = partySurvey.responses.filter((r) => r.status === "completed").length;
  const totalPacked = bookedTrip.packingLists.reduce((a, l) => a + l.packedCount, 0);
  const totalItems = bookedTrip.packingLists.reduce((a, l) => a + l.totalCount, 0);
  const confirmedDining = bookedTrip.diningReservations.filter(d => d.status === "confirmed").length;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[40vh] overflow-hidden">
        <img src={bookedTrip.heroImage} alt="Adventures" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={10} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-12">
          <motion.p {...fade()} className="label-text !text-white/40 mb-4 tracking-[0.3em]">Your Adventures</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-4xl sm:text-6xl leading-[1.02]">Plan Your Trip</motion.h1>
          <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-4">All your journeys in one place.</motion.p>
        </div>
      </section>

      {/* Active Trip Card */}
      <section className="px-8 lg:px-16 py-16 lg:py-24">
        <motion.div {...fade()}>
          <p className="label-text mb-6">Active Adventure</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Your trips at a glance.</h2>
          <div className="gold-rule mb-12" />
        </motion.div>

        <motion.div {...fade(0.1)} className="mb-16">
          <Link to={`/trip/${bookedTrip.tripId}`} className="block group">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-border bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 overflow-hidden">
              <div className="lg:col-span-2 relative min-h-[240px]">
                <img src={bookedTrip.heroImage} alt={bookedTrip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium bg-foreground text-background">Booked</span>
                </div>
              </div>
              <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                <p className="label-text mb-3">{bookedTrip.countdownDays} days away</p>
                <h3 className="font-display text-3xl text-foreground mb-2 group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{bookedTrip.destination}</h3>
                <p className="font-editorial text-muted-foreground mb-6">{bookedTrip.tripName} · Party of {bookedTrip.partySize}</p>
                <p className="font-editorial text-sm text-muted-foreground/70 max-w-lg mb-8 leading-relaxed">{bookedTrip.description}</p>
                <div className="flex flex-wrap gap-6 mb-6">
                  {[
                    { label: "Surveys", value: `${completedCount}/${partySurvey.responses.length}`, sub: "completed" },
                    { label: "Dining", value: String(confirmedDining), sub: "confirmed" },
                    { label: "Packing", value: `${totalPacked}/${totalItems}`, sub: "packed" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="label-text mb-1">{stat.label}</p>
                      <p className="font-display text-2xl text-foreground">{stat.value}</p>
                      <p className="font-editorial text-xs text-muted-foreground/50">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                <span className="link-editorial font-editorial text-sm text-foreground">
                  Open trip details →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Journey Timeline */}
        <motion.div {...fade(0.15)} className="mb-16">
          <p className="label-text mb-6">The Journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookedTrip.travelLegs.map((leg, i) => (
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
                <motion.div key={trip.tripId} {...fade(0.25 + i * 0.1)} className="group border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img src={trip.heroImage} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium border" style={{
                        background: trip.status === "planning" ? "hsl(var(--gold) / 0.15)" : "hsl(var(--muted))",
                        borderColor: trip.status === "planning" ? "hsl(var(--gold) / 0.3)" : "hsl(var(--border))",
                        color: trip.status === "planning" ? "hsl(var(--gold-dark))" : "hsl(var(--muted-foreground))",
                      }}>
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
          <h2 className="font-display text-foreground leading-[1.08] mb-4" style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)" }}>Plan a new adventure.</h2>
          <div className="gold-rule mx-auto mb-6" />
          <p className="font-editorial text-sm text-muted-foreground max-w-md mx-auto mb-10">Launch the Strategy Wizard to architect your next perfect park day.</p>
          <button onClick={() => setWizardOpen(true)} className="inline-flex items-center justify-center px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-all duration-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring">Initialize Your Journey</button>
        </motion.div>
      </section>

      <Footer />
      <TripWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default TripsHub;
