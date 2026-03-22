import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import SparkleField from "@/components/SparkleField";
import TripWizard from "@/components/TripWizard";
import EmptyState from "@/components/EmptyState";
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
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const { partySurvey } = mockData;
  const completedCount = partySurvey.responses.filter((r) => r.status === "completed").length;
  const totalPacked = bookedTrip.packingLists.reduce((a, l) => a + l.packedCount, 0);
  const totalItems = bookedTrip.packingLists.reduce((a, l) => a + l.totalCount, 0);
  const confirmedDining = bookedTrip.diningReservations.filter(d => d.status === "confirmed").length;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[25vh] min-h-[160px] overflow-hidden">
        <img src={bookedTrip.heroImage} alt="Adventures" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={6} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
          <motion.p {...fade()} className="label-text !text-white/60 mb-2 tracking-[0.3em]">Your Adventures ✨</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-3xl sm:text-5xl leading-[1.02]">Plan Your Trip</motion.h1>
        </div>
      </section>

      {/* Active Trip Card */}
      <section className="px-8 lg:px-16 py-16 lg:py-24">
        <motion.div {...fade()}>
          <p className="label-text mb-6">Active Adventure 🎒</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Your trips at a glance.</h2>
          <div className="gold-rule mb-12" />
        </motion.div>

        <motion.div {...fade(0.1)} className="mb-16">
          <Link to={`/trip/${bookedTrip.tripId}`} className="block group">
            <div className="border border-border bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative min-h-[200px]">
                  <img src={bookedTrip.heroImage} alt={bookedTrip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium bg-foreground text-background">Booked</span>
                  </div>
                </div>
                <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col justify-center">
                  <p className="label-text mb-2">{bookedTrip.countdownDays} days away</p>
                  <h3 className="font-display text-2xl text-foreground mb-1 group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{bookedTrip.destination}</h3>
                  <p className="font-editorial text-sm text-muted-foreground mb-4">{bookedTrip.tripName} · Party of {bookedTrip.partySize}</p>
                  <div className="flex flex-wrap gap-5 mb-4">
                    {[
                      { label: "Surveys", value: `${completedCount}/${partySurvey.responses.length}`, sub: "completed" },
                      { label: "Dining", value: String(confirmedDining), sub: "confirmed" },
                      { label: "Packing", value: `${totalPacked}/${totalItems}`, sub: "packed" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="label-text mb-0.5">{stat.label}</p>
                        <p className="font-display text-xl text-foreground">{stat.value}</p>
                        <p className="font-editorial text-xs text-muted-foreground/50">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                  <span className="link-editorial font-editorial text-sm text-foreground">
                    Open trip details →
                  </span>
                </div>
              </div>

              {/* Journey Timeline — integrated */}
              {bookedTrip.travelLegs.length > 0 && (
                <div className="border-t border-border px-6 lg:px-8 py-5">
                  <p className="label-text mb-3">The Journey</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bookedTrip.travelLegs.map((leg) => (
                      <div key={leg.legName} className="border border-border bg-background/50 p-4">
                        <p className="label-text mb-1 text-[0.6rem]">{leg.date} · {leg.time}</p>
                        <h4 className="font-display text-sm text-foreground mb-1">{leg.legName}</h4>
                        <p className="font-editorial text-xs text-muted-foreground italic">{leg.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Future Trips */}
        {futureTrips.length > 0 && (
          <motion.div {...fade(0.2)}>
            <p className="label-text mb-6">On the Horizon 🌅</p>
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
          <p className="label-text mb-6">The Voyage Canvas 🌍</p>
          <h2 className="font-display text-foreground leading-[1.08] mb-4" style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)" }}>Plan a new adventure.</h2>
          <div className="gold-rule mx-auto mb-6" />
          <p className="font-editorial text-sm text-muted-foreground max-w-md mx-auto mb-10">Choose your destination, pick your dates, and we'll help your family make the most of every moment.</p>
          <motion.button
            onClick={() => setWizardOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center px-10 py-4 rounded-lg text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-all duration-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Start Your Journey ✨
          </motion.button>
        </motion.div>
      </section>

      <Footer />
      <TripWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onComplete={(tripId) => navigate(`/trip/${tripId}`)} guestName={mockData.guestName} />
    </div>
  );
};

export default TripsHub;
