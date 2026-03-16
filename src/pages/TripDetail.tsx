import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import editorialPacking from "@/assets/editorial-packing.jpg";
import editorialCalendar from "@/assets/editorial-calendar.jpg";
import editorialDining from "@/assets/editorial-dining.jpg";
import SparkleField from "@/components/SparkleField";
import type { BookedTrip, FutureTrip, PackingItem, PreparationItem, ExperienceCategory, BookingDifficulty, CostTier, DiningReservation, BookedExperience, DiningVenue, ExperienceVenue } from "@/data/types";
import ItineraryDesigner from "@/components/ItineraryDesigner";
import { mockData } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

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

const mealIcons: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌤",
  dinner: "🌙",
  snack: "🍿",
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "hsl(var(--gold) / 0.1)", text: "hsl(var(--gold-dark))", border: "hsl(var(--gold) / 0.3)" },
  pending: { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
  cancelled: { bg: "hsl(var(--destructive) / 0.1)", text: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.3)" },
};

const experienceIcons: Record<ExperienceCategory, string> = {
  "character-meet": "👑",
  "tour": "🗺",
  "special-event": "✨",
  "recreation": "🚴",
  "spa": "💆",
  "photo-session": "📸",
};

const experienceLabels: Record<ExperienceCategory, string> = {
  "character-meet": "Character Meet",
  "tour": "Tour",
  "special-event": "Special Event",
  "recreation": "Recreation",
  "spa": "Spa & Wellness",
  "photo-session": "Photo Session",
};

const difficultyColors: Record<BookingDifficulty, { bg: string; text: string; border: string }> = {
  easy: { bg: "hsl(var(--gold) / 0.1)", text: "hsl(var(--gold-dark))", border: "hsl(var(--gold) / 0.3)" },
  moderate: { bg: "hsl(var(--muted))", text: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
  hard: { bg: "hsl(var(--destructive) / 0.08)", text: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.2)" },
  legendary: { bg: "hsl(var(--destructive) / 0.15)", text: "hsl(var(--destructive))", border: "hsl(var(--destructive) / 0.4)" },
};

const costDots = (tier: CostTier) => {
  const count = tier.length;
  return Array.from({ length: 4 }, (_, i) => (
    <span key={i} className={`inline-block w-1.5 h-1.5 rounded-full ${i < count ? "bg-foreground" : "bg-border"}`} />
  ));
};

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-1">
      <span className="font-display text-lg text-foreground">{rating.toFixed(1)}</span>
      <div className="flex gap-0.5 ml-1">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`text-xs ${i < full ? "text-[hsl(var(--gold))]" : i === full && hasHalf ? "text-[hsl(var(--gold))]" : "text-border"}`}>
            {i < full ? "★" : i === full && hasHalf ? "★" : "☆"}
          </span>
        ))}
      </div>
    </div>
  );
};

interface TripDetailProps {
  bookedTrip: BookedTrip;
  futureTrips: FutureTrip[];
}

const TripDetail = ({ bookedTrip, futureTrips }: TripDetailProps) => {
  const { tripId } = useParams<{ tripId: string }>();

  // Resolve which trip to show
  // For now, only booked trip has full data; future trips redirect to hub
  const isBooked = tripId === bookedTrip.tripId;
  const futureTrip = futureTrips.find((t) => t.tripId === tripId);

  if (!isBooked && !futureTrip) {
    return <Navigate to="/adventure" replace />;
  }

  // Future trips don't have full detail yet — show a placeholder
  if (futureTrip && !isBooked) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <section className="relative h-[50vh] overflow-hidden">
          <img src={futureTrip.heroImage} alt={futureTrip.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-12">
            <motion.div {...fade()}>
              <Link to="/adventure" className="label-text !text-white/40 mb-4 tracking-[0.3em] hover:!text-white/60 transition-colors inline-block">← All Trips</Link>
            </motion.div>
            <motion.h1 {...fade(0.2)} className="font-display text-white text-4xl sm:text-6xl leading-[1.02] mt-4">{futureTrip.destination}</motion.h1>
            <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-4">{futureTrip.tripName} · {futureTrip.tentativeDate}</motion.p>
          </div>
        </section>
        <section className="px-8 lg:px-16 py-24 text-center">
          <motion.div {...fade()}>
            <p className="font-display text-2xl text-muted-foreground/40 mb-3">This trip is still in the {futureTrip.status} phase.</p>
            <p className="font-editorial text-sm text-muted-foreground/30 max-w-md mx-auto mb-8">{futureTrip.note}</p>
            <Link to="/adventure" className="link-editorial font-editorial text-sm text-foreground">← Back to all trips</Link>
          </motion.div>
        </section>
        <Footer />
      </div>
    );
  }

  // Full trip detail for booked trip
  return <BookedTripDetail trip={bookedTrip} />;
};

/* ─── Booked Trip Detail (all tabs) ─────────────────────────────── */

const tabs = [
  { id: "surveys", label: "Party Setup", badge: "2 pending" },
  { id: "dining", label: "Dining" },
  { id: "experiences", label: "Experiences" },
  { id: "designer", label: "The Designer" },
  { id: "prep", label: "Prep & Checklists" },
];

/* ─── Booking Modal ─────────────────────────────────────────────── */

interface BookingModalProps {
  type: "dining" | "experience";
  venueName: string;
  venueLocation: string;
  onClose: () => void;
  onBook: (data: { date: string; time: string; partySize: number; notes: string }) => void;
}

const BookingModal = ({ type, venueName, venueLocation, onClose, onBook }: BookingModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(4);
  const [notes, setNotes] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-text mb-1">Book {type === "dining" ? "Reservation" : "Experience"}</p>
              <h3 className="font-display text-xl text-foreground">{venueName}</h3>
              <p className="font-editorial text-sm text-muted-foreground">{venueLocation}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label-text mb-2 block">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-border bg-background rounded-md px-3 py-2 font-editorial text-sm text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors" />
          </div>
          <div>
            <label className="label-text mb-2 block">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full border border-border bg-background rounded-md px-3 py-2 font-editorial text-sm text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors" />
          </div>
          <div>
            <label className="label-text mb-2 block">Party Size</label>
            <div className="flex gap-2">
              {[1,2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setPartySize(n)} className={`w-10 h-10 rounded-md border text-sm font-display transition-all duration-200 ${partySize === n ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text mb-2 block">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requests, dietary needs..." rows={2} className="w-full border border-border bg-background rounded-md px-3 py-2 font-editorial text-sm text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-border flex gap-3">
          <button onClick={() => { if (date && time) onBook({ date, time, partySize, notes }); }} className="flex-1 px-6 py-3 rounded-lg text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-300 hover:opacity-90 disabled:opacity-40" disabled={!date || !time}>
            Add as Pending
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-lg text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Alert Modal ──────────────────────────────────────────────── */

interface AlertModalProps {
  venueName: string;
  opensDate: string;
  onClose: () => void;
  onSetAlert: (note: string) => void;
}

const AlertModal = ({ venueName, opensDate, onClose, onSetAlert }: AlertModalProps) => {
  const [alertNote, setAlertNote] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-card border border-border rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-text mb-1">🔔 Set Booking Alert</p>
              <h3 className="font-display text-lg text-foreground">{venueName}</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] rounded-lg p-4">
            <p className="font-editorial text-sm text-foreground mb-1">Booking window opens:</p>
            <p className="font-display text-xl text-foreground">{opensDate || "TBD"}</p>
            <p className="font-editorial text-xs text-muted-foreground mt-2">We'll remind you to book at 6 AM ET on this date.</p>
          </div>
          <div>
            <label className="label-text mb-2 block">Reminder Note (optional)</label>
            <input type="text" value={alertNote} onChange={(e) => setAlertNote(e.target.value)} placeholder="e.g., Request West Wing" className="w-full border border-border bg-background rounded-md px-3 py-2 font-editorial text-sm text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors" />
          </div>
        </div>
        <div className="p-6 border-t border-border">
          <button onClick={() => onSetAlert(alertNote)} className="w-full px-6 py-3 rounded-lg text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-[hsl(var(--gold))] text-background transition-opacity duration-300 hover:opacity-90">
            Set Alert
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Alert type ───────────────────────────────────────────────── */

interface BookingAlert {
  id: string;
  venueName: string;
  type: "dining" | "experience";
  opensDate: string;
  note: string;
}

const BookedTripDetail = ({ trip }: { trip: BookedTrip }) => {
  const [activeTab, setActiveTab] = useState("surveys");
  const [diningSubTab, setDiningSubTab] = useState<"discover" | "reservations">("discover");
  const [experienceSubTab, setExperienceSubTab] = useState<"discover" | "reservations">("discover");
  const [mdeConnected, setMdeConnected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mockData.partyMembers.forEach((m) => { initial[m.memberId] = false; });
    return initial;
  });

  // Booking state
  const [pendingDining, setPendingDining] = useState<DiningReservation[]>([]);
  const [pendingExperiences, setPendingExperiences] = useState<BookedExperience[]>([]);
  const [alerts, setAlerts] = useState<BookingAlert[]>([]);
  const [bookingModal, setBookingModal] = useState<{ type: "dining" | "experience"; venue: DiningVenue | ExperienceVenue } | null>(null);
  const [alertModal, setAlertModal] = useState<{ type: "dining" | "experience"; venueName: string; opensDate: string } | null>(null);
  const { destination, tripName, countdownDays, travelLegs, diningReservations, bookedExperiences, diningVenues, experienceVenues } = trip;
  const { partySurvey } = mockData;

  // Interactive packing state
  const [prepState, setPrepState] = useState<PreparationItem[]>(() =>
    trip.preparations.map((p) => ({ ...p }))
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [packedItems, setPackedItems] = useState<Record<string, boolean[]>>(() => {
    const initial: Record<string, boolean[]> = {};
    trip.packingLists.forEach((list) => {
      initial[list.category] = list.items.map((_, i) => i < list.packedCount);
    });
    return initial;
  });

  const togglePacked = (category: string, itemIndex: number) => {
    setPackedItems((prev) => {
      const updated = { ...prev, [category]: [...prev[category]] };
      updated[category][itemIndex] = !updated[category][itemIndex];
      return updated;
    });
  };
  const togglePrep = (index: number) => {
    setPrepState((prev) => prev.map((p, i) => i === index ? { ...p, isComplete: !p.isComplete } : p));
  };
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };
  const getPackedCount = (category: string) => packedItems[category]?.filter(Boolean).length ?? 0;
  const getTotalPacked = () => Object.values(packedItems).flat().filter(Boolean).length;
  const getTotalItems = () => Object.values(packedItems).flat().length;

  // Combined reservations (mock + pending)
  const allDiningReservations = useMemo(() => [...diningReservations, ...pendingDining], [diningReservations, pendingDining]);
  const allBookedExperiences = useMemo(() => [...bookedExperiences, ...pendingExperiences], [bookedExperiences, pendingExperiences]);

  /* ── Overlap detection for dining & experiences ─────────────────── */
  const parseTimeToMin = (timeStr: string): number => {
    const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return -1;
    let h = parseInt(m[1]);
    const min = parseInt(m[2]);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + min;
  };

  const diningDurationByMeal: Record<string, number> = { breakfast: 60, lunch: 75, dinner: 90, snack: 30 };

  type BookingSlot = { id: string; name: string; date: string; startMin: number; endMin: number; type: "dining" | "experience"; status: string };

  const allBookingSlots = useMemo((): BookingSlot[] => {
    const slots: BookingSlot[] = [];
    allDiningReservations.filter(d => d.status !== "cancelled").forEach(d => {
      const start = parseTimeToMin(d.time);
      const dur = diningDurationByMeal[d.mealType] || 75;
      if (start >= 0) slots.push({ id: d.reservationId, name: d.restaurantName, date: d.date, startMin: start, endMin: start + dur, type: "dining", status: d.status });
    });
    allBookedExperiences.filter(e => e.status !== "cancelled").forEach(e => {
      const start = parseTimeToMin(e.time);
      const dur = parseInt(e.duration || "60") || 60;
      if (start >= 0) slots.push({ id: e.experienceId, name: e.experienceName, date: e.date, startMin: start, endMin: start + dur, type: "experience", status: e.status });
    });
    return slots;
  }, [allDiningReservations, allBookedExperiences]);

  const overlapMap = useMemo(() => {
    const map: Record<string, BookingSlot[]> = {};
    for (let i = 0; i < allBookingSlots.length; i++) {
      for (let j = i + 1; j < allBookingSlots.length; j++) {
        const a = allBookingSlots[i];
        const b = allBookingSlots[j];
        if (a.date !== b.date) continue;
        if (a.startMin < b.endMin && b.startMin < a.endMin) {
          if (!map[a.id]) map[a.id] = [];
          if (!map[b.id]) map[b.id] = [];
          map[a.id].push(b);
          map[b.id].push(a);
        }
      }
    }
    return map;
  }, [allBookingSlots]);

  const hasAnyOverlaps = Object.keys(overlapMap).length > 0;

  const handleBookDining = (venue: DiningVenue, data: { date: string; time: string; partySize: number; notes: string }) => {
    const newRes: DiningReservation = {
      reservationId: `din-pending-${Date.now()}`,
      restaurantName: venue.name,
      parkOrResort: venue.parkOrResort,
      date: data.date,
      time: data.time,
      partySize: data.partySize,
      confirmationNumber: "Pending",
      cuisine: venue.cuisine,
      mealType: venue.mealTypes[0] || "dinner",
      notes: data.notes || undefined,
      dietaryFlags: venue.dietaryAccommodations.length > 0 ? venue.dietaryAccommodations.slice(0, 2) : undefined,
      status: "pending",
    };
    setPendingDining(prev => [...prev, newRes]);
    setBookingModal(null);
    setDiningSubTab("reservations");
    toast({ title: "Reservation added", description: `${venue.name} added as pending. Update with confirmation once booked.` });
  };

  const handleBookExperience = (venue: ExperienceVenue, data: { date: string; time: string; partySize: number; notes: string }) => {
    const newExp: BookedExperience = {
      experienceId: `exp-pending-${Date.now()}`,
      experienceName: venue.name,
      category: venue.category,
      parkOrResort: venue.parkOrResort,
      date: data.date,
      time: data.time,
      duration: venue.duration,
      partySize: data.partySize,
      confirmationNumber: "Pending",
      notes: data.notes || undefined,
      status: "pending",
    };
    setPendingExperiences(prev => [...prev, newExp]);
    setBookingModal(null);
    setExperienceSubTab("reservations");
    toast({ title: "Experience added", description: `${venue.name} added as pending. Update with confirmation once booked.` });
  };

  const handleSetAlert = (type: "dining" | "experience", venueName: string, opensDate: string, note: string) => {
    setAlerts(prev => [...prev, { id: `alert-${Date.now()}`, venueName, type, opensDate, note }]);
    setAlertModal(null);
    toast({ title: "🔔 Alert set!", description: `We'll remind you when ${venueName} booking opens${opensDate ? ` on ${opensDate}` : ""}.` });
  };


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

  const diningByDate = useMemo(() => {
    const grouped: Record<string, typeof diningReservations> = {};
    for (const res of allDiningReservations) {
      if (!grouped[res.date]) grouped[res.date] = [];
      grouped[res.date].push(res);
    }
    return Object.entries(grouped);
  }, [allDiningReservations]);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero with trip identity */}
      <section className="relative h-[50vh] overflow-hidden">
        <img src={trip.heroImage} alt={destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={10} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-12">
          <motion.div {...fade()}>
            <Link to="/adventure" className="label-text !text-white/40 mb-4 tracking-[0.3em] hover:!text-white/60 transition-colors inline-block">← All Trips</Link>
          </motion.div>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-4xl sm:text-6xl leading-[1.02] mt-4">{destination}</motion.h1>
          <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-4">{tripName} · {countdownDays} days away · Party of {trip.partySize}</motion.p>
        </div>
      </section>

      {/* Sub-navigation with trip context */}
      <div className="border-b border-border bg-[hsl(var(--warm))] px-8 lg:px-16 sticky top-16 z-30">
        <div className="flex items-center justify-between">
          <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ═══ SURVEYS TAB ═══ */}
      {activeTab === "surveys" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Consensus</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Party Preferences</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-12">Send surveys to your party. Everyone ranks attractions, then we find the consensus.</p>
          </motion.div>

          <motion.div {...fade(0.1)} className="flex flex-wrap gap-3 mb-12">
            {partySurvey.responses.map((resp) => (
              <div key={resp.memberId} className="flex items-center gap-2 border border-border bg-card px-4 py-2 shadow-[var(--shadow-soft)]">
                <div className="w-7 h-7 flex items-center justify-center bg-foreground text-background text-xs font-medium">{resp.memberId}</div>
                <span className="font-display text-sm text-foreground">{resp.memberName}</span>
                {resp.status === "completed" ? (
                  <>
                    <span className="label-text !text-[hsl(var(--gold))]">✓ Complete</span>
                    {resp.openToAnything && <span className="text-xs" title="Open to anything">✨</span>}
                  </>
                ) : (
                  <Link to={`/survey/${partySurvey.tripId}/${resp.memberId.toLowerCase()}`} className="label-text !text-[hsl(var(--gold))] hover:underline">Pending · Send Link</Link>
                )}
              </div>
            ))}
          </motion.div>

          {/* MDE Friends Connection */}
          <motion.div {...fade(0.12)} className="mb-12">
            <p className="label-text mb-4">🏰 My Disney Experience — Friends & Family</p>
            <p className="font-editorial text-sm text-muted-foreground mb-6 max-w-xl">
              Everyone in your party should connect as friends in the My Disney Experience app. This lets the Trip Captain manage Lightning Lane, dining, and plans for the whole group.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockData.partyMembers.map((member) => (
                <button
                  key={member.memberId}
                  onClick={() => setMdeConnected((prev) => ({ ...prev, [member.memberId]: !prev[member.memberId] }))}
                  className={`flex items-center gap-3 border p-4 transition-all duration-300 ${
                    mdeConnected[member.memberId]
                      ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                      : "border-border bg-card hover:border-foreground/20"
                  }`}
                >
                  <div className={`w-5 h-5 flex items-center justify-center border transition-all duration-300 ${
                    mdeConnected[member.memberId]
                      ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))] text-background"
                      : "border-muted-foreground/30"
                  }`}>
                    {mdeConnected[member.memberId] && <span className="text-[0.5rem]">✓</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-foreground text-background text-xs font-medium">{member.initial}</div>
                    <span className="font-display text-sm text-foreground">{member.name}</span>
                  </div>
                  <span className="ml-auto label-text">{mdeConnected[member.memberId] ? "Connected" : "Not Yet"}</span>
                </button>
              ))}
            </div>
            <p className="font-editorial text-xs text-muted-foreground/50 mt-3 italic">
              {Object.values(mdeConnected).filter(Boolean).length} of {Object.values(mdeConnected).length} connected
            </p>
          </motion.div>

          <motion.div {...fade(0.15)} className="grid grid-cols-3 gap-6 mb-16">
            {[
              { label: "Surveys Done", value: `${completedCount}/${completedCount + pendingCount}` },
              { label: "MDE Connected", value: `${Object.values(mdeConnected).filter(Boolean).length}/${Object.values(mdeConnected).length}` },
              { label: "Conflicts", value: String(consensusData.filter((c) => c.hasConflict).length) },
            ].map((stat) => (
              <div key={stat.label} className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">{stat.label}</p>
                <p className="font-display text-3xl text-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>

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

      {/* ═══ DINING TAB ═══ */}
      {activeTab === "dining" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Table</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Dining</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">Research the best tables, then track your bookings.</p>
          </motion.div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mb-12 border-b border-border">
            {[{ id: "discover" as const, label: "Discover" }, { id: "reservations" as const, label: "My Reservations", count: allDiningReservations.length }].map((st) => (
              <button key={st.id} onClick={() => setDiningSubTab(st.id)} className="relative px-5 py-3 transition-all duration-500">
                <span className={`uppercase tracking-[0.2em] text-[0.6875rem] transition-colors duration-500 ${diningSubTab === st.id ? "text-foreground" : "text-muted-foreground"}`}>{st.label}</span>
                {"count" in st && st.count !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em]" style={{ background: "hsl(var(--gold) / 0.15)", color: "hsl(var(--gold-dark))", border: "1px solid hsl(var(--gold) / 0.3)" }}>{st.count}</span>
                )}
                {diningSubTab === st.id && <motion.div className="absolute bottom-0 left-5 right-5 h-px" layoutId="dining-sub" style={{ background: "hsl(var(--gold))" }} />}
              </button>
            ))}
          </div>

          {diningSubTab === "discover" && (
            <>
              <motion.div {...fade(0.05)} className="mb-10 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] p-4 flex items-center gap-3">
                <span className="text-lg">⏰</span>
                <p className="font-editorial text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Booking windows open 60 days before arrival</span> for most table-service restaurants. Set your alarm for 6 AM ET on your window day — popular spots fill within seconds.
                </p>
              </motion.div>

              <div className="space-y-6">
                {diningVenues.map((venue, i) => {
                  const diffColors = difficultyColors[venue.bookingDifficulty];
                  return (
                    <motion.div key={venue.venueId} {...fade(0.1 + i * 0.03)} className="border border-border bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display text-xl text-foreground">{venue.name}</h3>
                              {venue.characterDining && <span className="text-xs" title="Character dining">👑</span>}
                            </div>
                            <p className="font-editorial text-sm text-muted-foreground">{venue.parkOrResort} · {venue.cuisine}</p>
                          </div>
                          <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium border" style={{ background: diffColors.bg, color: diffColors.text, borderColor: diffColors.border }}>{venue.bookingDifficulty}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 mb-5">
                          <StarRating rating={venue.rating} />
                          <span className="font-editorial text-xs text-muted-foreground">{venue.reviewCount.toLocaleString()} reviews</span>
                          <div className="flex items-center gap-1"><span className="label-text mr-1">Cost</span><div className="flex gap-0.5">{costDots(venue.costTier)}</div></div>
                          <div className="flex flex-wrap gap-1">{venue.mealTypes.map(m => (<span key={m} className="text-[0.5625rem] uppercase tracking-[0.1em] px-2 py-0.5 bg-[hsl(var(--warm))] text-muted-foreground border border-border">{m}</span>))}</div>
                        </div>
                        <div className="mb-4"><p className="label-text mb-2">The Vibe</p><p className="font-editorial text-sm text-foreground/80 leading-relaxed">{venue.vibes}</p></div>
                        <div className="mb-4 pl-4 border-l-2 border-[hsl(var(--gold)/0.4)]"><p className="label-text mb-1">✦ Insider Note</p><p className="font-editorial text-sm text-muted-foreground leading-relaxed">{venue.notableInsight}</p></div>
                        {venue.mustTry && <div className="mb-4"><p className="label-text mb-1">Must Try</p><p className="font-editorial text-sm text-foreground/80 italic">{venue.mustTry}</p></div>}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {venue.tags.map(tag => (<span key={tag} className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 bg-[hsl(var(--warm))] text-muted-foreground border border-border">{tag}</span>))}
                          {!venue.kidFriendly && <span className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 bg-[hsl(var(--destructive)/0.08)] text-destructive border border-[hsl(var(--destructive)/0.2)]">Adults Only</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-5">{venue.dietaryAccommodations.map(d => (<span key={d} className="text-[0.5rem] uppercase tracking-[0.1em] px-2 py-0.5 text-muted-foreground/60 border border-border/50">✓ {d}</span>))}</div>
                        <div className="flex gap-3 pt-4 border-t border-border">
                          <button onClick={() => setBookingModal({ type: "dining", venue })} className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-300 hover:opacity-90">
                            Book This
                          </button>
                          <button onClick={() => setAlertModal({ type: "dining", venueName: venue.name, opensDate: venue.bookingWindow.opensDate })} className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
                            Set Alert
                          </button>
                          <span className="ml-auto font-editorial text-xs text-muted-foreground/50 self-center">
                            {venue.bookingWindow.daysBeforeArrival > 0 ? `Opens ${venue.bookingWindow.opensDate}` : "No reservation needed"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {diningSubTab === "reservations" && (
            <>
              {/* Overlap warning banner */}
              {hasAnyOverlaps && allDiningReservations.some(d => overlapMap[d.reservationId]) && (
                <motion.div {...fade(0.02)} className="mb-6 border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.04)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div>
                      <p className="font-display text-sm text-destructive mb-1">Overlapping Reservations Detected</p>
                      <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-2">
                        You have dining reservations that overlap in time. This is fine if you're holding multiple options to decide later — but remember to cancel the ones you won't use.
                      </p>
                      <div className="border-t border-[hsl(var(--destructive)/0.15)] pt-2 mt-2">
                        <p className="font-display text-[0.625rem] text-destructive uppercase tracking-[0.1em] mb-1">💰 Disney No-Show Fee Policy</p>
                        <p className="font-editorial text-[0.6875rem] text-muted-foreground leading-relaxed">
                          Walt Disney World charges a <strong className="text-foreground">$10 per person no-show fee</strong> for table-service dining reservations not cancelled at least <strong className="text-foreground">2 hours before</strong> the reservation time. Signature & fine dining restaurants (Victoria & Albert's, Topolino's Terrace character breakfast, etc.) may charge <strong className="text-foreground">$25–$50 per person</strong> and require cancellation <strong className="text-foreground">24 hours in advance</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status summary bar */}
              <motion.div {...fade(0.05)} className="flex gap-3 mb-10">
                {(["confirmed", "pending", "cancelled"] as const).map((status) => {
                  const count = allDiningReservations.filter(d => d.status === status).length;
                  if (count === 0 && status === "cancelled") return null;
                  const colors = statusColors[status];
                  return (
                    <div key={status} className="flex items-center gap-2 px-4 py-2 border" style={{ background: colors.bg, borderColor: colors.border }}>
                      <span className="font-display text-xl" style={{ color: colors.text }}>{count}</span>
                      <span className="text-[0.625rem] uppercase tracking-[0.15em] font-medium" style={{ color: colors.text }}>{status}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 px-4 py-2 border border-border bg-card ml-auto">
                  <span className="label-text">Dietary Flags</span>
                  <span className="font-display text-xl text-foreground">{new Set(allDiningReservations.flatMap(d => d.dietaryFlags ?? [])).size}</span>
                </div>
              </motion.div>

              {/* Two-column: Confirmed | Pending */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Confirmed column */}
                <div>
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: statusColors.confirmed.text }} />
                    Confirmed ({allDiningReservations.filter(d => d.status === "confirmed").length})
                  </p>
                  <div className="space-y-3">
                    {allDiningReservations.filter(d => d.status === "confirmed").map((res) => (
                      <div key={res.reservationId} className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] p-4 transition-shadow duration-500 hover:shadow-[var(--shadow-hover)]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mealIcons[res.mealType]}</span>
                            <h4 className="font-display text-foreground">{res.restaurantName}</h4>
                          </div>
                          <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.12em] font-medium border" style={{ background: statusColors.confirmed.bg, color: statusColors.confirmed.text, borderColor: statusColors.confirmed.border }}>✓ Confirmed</span>
                        </div>
                        <p className="font-editorial text-xs text-muted-foreground mb-2">{res.parkOrResort} · {res.cuisine}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="font-editorial text-foreground">{res.date} · {res.time}</span>
                          <span className="font-editorial text-muted-foreground">Party of {res.partySize}</span>
                          <span className="font-editorial text-muted-foreground/60">#{res.confirmationNumber}</span>
                        </div>
                        {res.dietaryFlags && res.dietaryFlags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">{res.dietaryFlags.map((flag) => (<span key={flag} className="text-[0.5rem] uppercase tracking-[0.1em] px-2 py-0.5 bg-[hsl(var(--warm))] text-muted-foreground border border-border">⚠ {flag}</span>))}</div>
                        )}
                        {res.notes && <p className="font-editorial text-xs text-muted-foreground/60 italic mt-2">{res.notes}</p>}
                        {overlapMap[res.reservationId] && (
                          <div className="mt-3 pt-2 border-t border-[hsl(var(--destructive)/0.15)]">
                            <div className="flex items-start gap-2 px-2 py-1.5 bg-[hsl(var(--destructive)/0.04)]">
                              <span className="text-xs shrink-0">⚠️</span>
                              <div>
                                <p className="font-display text-[0.5625rem] text-destructive mb-0.5">Time Conflict</p>
                                <p className="font-editorial text-[0.625rem] text-muted-foreground">
                                  Overlaps with {overlapMap[res.reservationId].map(o => o.name).join(", ")}. Cancel unused reservations at least <strong className="text-foreground">2 hours before</strong> to avoid a <strong className="text-foreground">$10/person no-show fee</strong>.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {allDiningReservations.filter(d => d.status === "confirmed").length === 0 && (
                      <p className="font-editorial text-sm text-muted-foreground/40 italic py-6 text-center">No confirmed reservations yet.</p>
                    )}
                  </div>
                </div>

                {/* Pending column */}
                <div>
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Pending ({allDiningReservations.filter(d => d.status === "pending").length})
                  </p>
                  <div className="space-y-3">
                    {allDiningReservations.filter(d => d.status === "pending").map((res) => (
                      <div key={res.reservationId} className="border border-dashed border-border bg-card p-4 transition-shadow duration-500 hover:shadow-[var(--shadow-hover)]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mealIcons[res.mealType]}</span>
                            <h4 className="font-display text-foreground">{res.restaurantName}</h4>
                          </div>
                          <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.12em] font-medium border" style={{ background: statusColors.pending.bg, color: statusColors.pending.text, borderColor: statusColors.pending.border }}>Pending</span>
                        </div>
                        <p className="font-editorial text-xs text-muted-foreground mb-2">{res.parkOrResort} · {res.cuisine}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="font-editorial text-foreground">{res.date} · {res.time}</span>
                          <span className="font-editorial text-muted-foreground">Party of {res.partySize}</span>
                        </div>
                        {res.notes && <p className="font-editorial text-xs text-muted-foreground/60 italic mt-2">{res.notes}</p>}
                        {overlapMap[res.reservationId] && (
                          <div className="mt-2 flex items-start gap-2 px-2 py-1.5 bg-[hsl(var(--destructive)/0.04)] border border-[hsl(var(--destructive)/0.15)]">
                            <span className="text-xs shrink-0">⚠️</span>
                            <p className="font-editorial text-[0.625rem] text-muted-foreground">
                              Overlaps with <strong className="text-foreground">{overlapMap[res.reservationId].map(o => o.name).join(", ")}</strong>. Cancel at least <strong className="text-foreground">2 hrs before</strong> to avoid a <strong className="text-foreground">$10/person</strong> no-show fee.
                            </p>
                          </div>
                        )}
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="font-editorial text-[0.625rem] text-muted-foreground/50 italic">Add confirmation # once booked</p>
                        </div>
                      </div>
                    ))}
                    {allDiningReservations.filter(d => d.status === "pending").length === 0 && (
                      <p className="font-editorial text-sm text-muted-foreground/40 italic py-6 text-center">No pending reservations.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancelled (if any) */}
              {allDiningReservations.filter(d => d.status === "cancelled").length > 0 && (
                <motion.div {...fade(0.2)} className="mb-12">
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Cancelled
                  </p>
                  <div className="space-y-3 opacity-50">
                    {allDiningReservations.filter(d => d.status === "cancelled").map((res) => (
                      <div key={res.reservationId} className="border border-border bg-card rounded-lg p-4 line-through">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mealIcons[res.mealType]}</span>
                          <span className="font-display text-foreground">{res.restaurantName}</span>
                          <span className="font-editorial text-xs text-muted-foreground ml-2">{res.date} · {res.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

               <motion.div {...fade(0.3)} className="border border-dashed border-border rounded-lg py-10 text-center cursor-pointer hover:border-[hsl(var(--gold)/0.5)] transition-colors duration-500">
                <p className="font-display text-xl text-muted-foreground/40 mb-2">+ Add Reservation</p>
                <p className="font-editorial text-sm text-muted-foreground/30">Track a new dining booking for your trip.</p>
              </motion.div>
            </>
          )}
        </section>
      )}

      {/* ═══ EXPERIENCES TAB ═══ */}
      {activeTab === "experiences" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Enchantments</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Experiences</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">Discover extraordinary moments, then track the ones you've booked.</p>
          </motion.div>

          <div className="flex gap-1 mb-12 border-b border-border">
            {[{ id: "discover" as const, label: "Discover" }, { id: "reservations" as const, label: "My Bookings", count: allBookedExperiences.length }].map((st) => (
              <button key={st.id} onClick={() => setExperienceSubTab(st.id)} className="relative px-5 py-3 transition-all duration-500">
                <span className={`uppercase tracking-[0.2em] text-[0.6875rem] transition-colors duration-500 ${experienceSubTab === st.id ? "text-foreground" : "text-muted-foreground"}`}>{st.label}</span>
                {"count" in st && st.count !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em]" style={{ background: "hsl(var(--gold) / 0.15)", color: "hsl(var(--gold-dark))", border: "1px solid hsl(var(--gold) / 0.3)" }}>{st.count}</span>
                )}
                {experienceSubTab === st.id && <motion.div className="absolute bottom-0 left-5 right-5 h-px" layoutId="exp-sub" style={{ background: "hsl(var(--gold))" }} />}
              </button>
            ))}
          </div>

          {experienceSubTab === "discover" && (
            <>
              <motion.div {...fade(0.05)} className="mb-10 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] p-4 flex items-center gap-3">
                <span className="text-lg">⏰</span>
                <p className="font-editorial text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Booking windows vary by experience</span> — most open 60 days before arrival. Premium experiences like Savi's Workshop sell out immediately.
                </p>
              </motion.div>

              <div className="space-y-6">
                {experienceVenues.map((venue, i) => {
                  const diffColors = difficultyColors[venue.bookingDifficulty];
                  return (
                    <motion.div key={venue.venueId} {...fade(0.1 + i * 0.03)} className="border border-border bg-card shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3"><span className="text-2xl">{experienceIcons[venue.category]}</span><div><h3 className="font-display text-xl text-foreground">{venue.name}</h3><p className="font-editorial text-sm text-muted-foreground">{venue.parkOrResort} · {experienceLabels[venue.category]}</p></div></div>
                          <span className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.15em] font-medium border" style={{ background: diffColors.bg, color: diffColors.text, borderColor: diffColors.border }}>{venue.bookingDifficulty}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 mb-5">
                          <StarRating rating={venue.rating} />
                          <span className="font-editorial text-xs text-muted-foreground">{venue.reviewCount.toLocaleString()} reviews</span>
                          <div className="flex items-center gap-1"><span className="label-text mr-1">Cost</span><div className="flex gap-0.5">{costDots(venue.costTier)}</div></div>
                          <span className="font-editorial text-xs text-muted-foreground">{venue.priceRange}</span>
                          <span className="font-editorial text-xs text-muted-foreground">⏱ {venue.duration}</span>
                        </div>
                        <div className="mb-4"><p className="label-text mb-2">The Vibe</p><p className="font-editorial text-sm text-foreground/80 leading-relaxed">{venue.vibes}</p></div>
                        <div className="mb-4 pl-4 border-l-2 border-[hsl(var(--gold)/0.4)]"><p className="label-text mb-1">✦ Insider Note</p><p className="font-editorial text-sm text-muted-foreground leading-relaxed">{venue.notableInsight}</p></div>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {venue.tags.map(tag => (<span key={tag} className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 bg-[hsl(var(--warm))] text-muted-foreground border border-border">{tag}</span>))}
                          {venue.ageRequirement && <span className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 text-muted-foreground border border-border">📏 {venue.ageRequirement}</span>}
                          {venue.heightRequirement && <span className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 text-muted-foreground border border-border">📐 {venue.heightRequirement}"</span>}
                          {venue.maxPartySize && <span className="text-[0.5625rem] uppercase tracking-[0.12em] px-2.5 py-1 text-muted-foreground border border-border">👥 Max {venue.maxPartySize}</span>}
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-border">
                          <button onClick={() => setBookingModal({ type: "experience", venue })} className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-300 hover:opacity-90">
                            Book This
                          </button>
                          <button onClick={() => setAlertModal({ type: "experience", venueName: venue.name, opensDate: venue.bookingWindow.opensDate })} className="px-6 py-2.5 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
                            Set Alert
                          </button>
                          <span className="ml-auto font-editorial text-xs text-muted-foreground/50 self-center">
                            {venue.bookingWindow.daysBeforeArrival > 0 ? `Opens ${venue.bookingWindow.opensDate}` : "Walk-up only"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {experienceSubTab === "reservations" && (
            <>
              {/* Overlap warning banner */}
              {hasAnyOverlaps && allBookedExperiences.some(e => overlapMap[e.experienceId]) && (
                <motion.div {...fade(0.02)} className="mb-6 border border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.04)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div>
                      <p className="font-display text-sm text-destructive mb-1">Overlapping Bookings Detected</p>
                      <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-2">
                        Some of your experience bookings overlap in time. If you're holding options to decide later, be sure to cancel the unused ones before the deadline.
                      </p>
                      <div className="border-t border-[hsl(var(--destructive)/0.15)] pt-2 mt-2">
                        <p className="font-display text-[0.625rem] text-destructive uppercase tracking-[0.1em] mb-1">💰 Disney No-Show Fee Policy</p>
                        <p className="font-editorial text-[0.6875rem] text-muted-foreground leading-relaxed">
                          Premium experiences (Savi's Workshop, Bibbidi Bobbidi Boutique, etc.) charge <strong className="text-foreground">$10–$50 per person</strong> for no-shows. Most require cancellation at least <strong className="text-foreground">24 hours in advance</strong>. Standard recreation bookings typically require <strong className="text-foreground">1–2 hours notice</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status summary bar */}
              <motion.div {...fade(0.05)} className="flex gap-3 mb-10">
                {(["confirmed", "pending", "cancelled"] as const).map((status) => {
                  const count = allBookedExperiences.filter(e => e.status === status).length;
                  if (count === 0 && status === "cancelled") return null;
                  const colors = statusColors[status];
                  return (
                    <div key={status} className="flex items-center gap-2 px-4 py-2 border" style={{ background: colors.bg, borderColor: colors.border }}>
                      <span className="font-display text-xl" style={{ color: colors.text }}>{count}</span>
                      <span className="text-[0.625rem] uppercase tracking-[0.15em] font-medium" style={{ color: colors.text }}>{status}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 px-4 py-2 border border-border bg-card ml-auto">
                  <span className="label-text">Days</span>
                  <span className="font-display text-xl text-foreground">{new Set(allBookedExperiences.map(e => e.date)).size}</span>
                </div>
              </motion.div>

              {/* Two-column: Confirmed | Pending */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Confirmed column */}
                <div>
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: statusColors.confirmed.text }} />
                    Confirmed ({allBookedExperiences.filter(e => e.status === "confirmed").length})
                  </p>
                  <div className="space-y-3">
                    {allBookedExperiences.filter(e => e.status === "confirmed").map((exp) => (
                      <div key={exp.experienceId} className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] p-4 transition-shadow duration-500 hover:shadow-[var(--shadow-hover)]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{experienceIcons[exp.category]}</span>
                            <h4 className="font-display text-foreground">{exp.experienceName}</h4>
                          </div>
                          <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.12em] font-medium border" style={{ background: statusColors.confirmed.bg, color: statusColors.confirmed.text, borderColor: statusColors.confirmed.border }}>✓ Confirmed</span>
                        </div>
                        <p className="font-editorial text-xs text-muted-foreground mb-2">{exp.parkOrResort} · {experienceLabels[exp.category]}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="font-editorial text-foreground">{exp.date} · {exp.time}</span>
                          {exp.duration && <span className="font-editorial text-muted-foreground">⏱ {exp.duration}</span>}
                          <span className="font-editorial text-muted-foreground">Party of {exp.partySize}</span>
                          <span className="font-editorial text-muted-foreground/60">#{exp.confirmationNumber}</span>
                        </div>
                        {exp.notes && <p className="font-editorial text-xs text-muted-foreground/60 italic mt-2">{exp.notes}</p>}
                        {overlapMap[exp.experienceId] && (
                          <div className="mt-2 flex items-start gap-2 px-2 py-1.5 bg-[hsl(var(--destructive)/0.04)] border border-[hsl(var(--destructive)/0.15)]">
                            <span className="text-xs shrink-0">⚠️</span>
                            <p className="font-editorial text-[0.625rem] text-muted-foreground">
                              Overlaps with <strong className="text-foreground">{overlapMap[exp.experienceId].map(o => o.name).join(", ")}</strong>. Some experiences charge <strong className="text-foreground">$10–$50/person</strong> for no-shows. Cancel at least <strong className="text-foreground">24 hours before</strong> for premium experiences.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    {allBookedExperiences.filter(e => e.status === "confirmed").length === 0 && (
                      <p className="font-editorial text-sm text-muted-foreground/40 italic py-6 text-center">No confirmed experiences yet.</p>
                    )}
                  </div>
                </div>

                {/* Pending column */}
                <div>
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Pending ({allBookedExperiences.filter(e => e.status === "pending").length})
                  </p>
                  <div className="space-y-3">
                    {allBookedExperiences.filter(e => e.status === "pending").map((exp) => (
                      <div key={exp.experienceId} className="border border-dashed border-border bg-card p-4 transition-shadow duration-500 hover:shadow-[var(--shadow-hover)]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{experienceIcons[exp.category]}</span>
                            <h4 className="font-display text-foreground">{exp.experienceName}</h4>
                          </div>
                          <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.12em] font-medium border" style={{ background: statusColors.pending.bg, color: statusColors.pending.text, borderColor: statusColors.pending.border }}>Pending</span>
                        </div>
                        <p className="font-editorial text-xs text-muted-foreground mb-2">{exp.parkOrResort} · {experienceLabels[exp.category]}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="font-editorial text-foreground">{exp.date} · {exp.time}</span>
                          {exp.duration && <span className="font-editorial text-muted-foreground">⏱ {exp.duration}</span>}
                          <span className="font-editorial text-muted-foreground">Party of {exp.partySize}</span>
                        </div>
                        {exp.notes && <p className="font-editorial text-xs text-muted-foreground/60 italic mt-2">{exp.notes}</p>}
                        {overlapMap[exp.experienceId] && (
                          <div className="mt-2 flex items-start gap-2 px-2 py-1.5 bg-[hsl(var(--destructive)/0.04)] border border-[hsl(var(--destructive)/0.15)]">
                            <span className="text-xs shrink-0">⚠️</span>
                            <p className="font-editorial text-[0.625rem] text-muted-foreground">
                              Overlaps with <strong className="text-foreground">{overlapMap[exp.experienceId].map(o => o.name).join(", ")}</strong>. Cancel unused bookings to avoid no-show fees.
                            </p>
                          </div>
                        )}
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="font-editorial text-[0.625rem] text-muted-foreground/50 italic">Add confirmation # once booked</p>
                        </div>
                      </div>
                    ))}
                    {allBookedExperiences.filter(e => e.status === "pending").length === 0 && (
                      <p className="font-editorial text-sm text-muted-foreground/40 italic py-6 text-center">No pending experiences.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cancelled (if any) */}
              {allBookedExperiences.filter(e => e.status === "cancelled").length > 0 && (
                <motion.div {...fade(0.2)} className="mb-12">
                  <p className="label-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    Cancelled
                  </p>
                  <div className="space-y-3 opacity-50">
                    {allBookedExperiences.filter(e => e.status === "cancelled").map((exp) => (
                      <div key={exp.experienceId} className="border border-border bg-card rounded-lg p-4 line-through">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{experienceIcons[exp.category]}</span>
                          <span className="font-display text-foreground">{exp.experienceName}</span>
                          <span className="font-editorial text-xs text-muted-foreground ml-2">{exp.date} · {exp.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div {...fade(0.3)} className="border border-dashed border-border rounded-lg py-10 text-center cursor-pointer hover:border-[hsl(var(--gold)/0.5)] transition-colors duration-500">
                <p className="font-display text-xl text-muted-foreground/40 mb-2">+ Add Experience</p>
                <p className="font-editorial text-sm text-muted-foreground/30">Track a new booked experience for your trip.</p>
              </motion.div>
            </>
          )}
        </section>
      )}

      {/* ═══ DESIGNER TAB ═══ */}
      {activeTab === "designer" && (
        <ItineraryDesigner
          trip={trip}
          partyMembers={mockData.partyMembers}
          diningReservations={allDiningReservations}
          bookedExperiences={allBookedExperiences}
          surveyResponses={mockData.partySurvey.responses}
        />
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
                <h2 className="font-display text-4xl text-foreground leading-[1.1] mb-3">Packing</h2>
                <p className="font-editorial text-sm text-muted-foreground mb-10">{getTotalPacked()} of {getTotalItems()} items packed</p>
              </motion.div>
              <motion.div {...fade(0.05)} className="mb-10">
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[hsl(var(--gold))]" initial={{ width: 0 }} animate={{ width: `${(getTotalPacked() / getTotalItems()) * 100}%` }} transition={{ duration: 0.6, ease }} />
                </div>
              </motion.div>
              <motion.div {...slideRight(0.1)} className="space-y-4 mb-14">
                {trip.packingLists.map((list) => {
                  const isExpanded = expandedCategories[list.category] ?? false;
                  const packed = getPackedCount(list.category);
                  const total = list.items.length;
                  const allPacked = packed === total;
                  return (
                    <div key={list.category} className="border border-border bg-card shadow-[var(--shadow-soft)]">
                      <button onClick={() => toggleCategory(list.category)} className="w-full flex justify-between items-center p-4 hover:bg-[hsl(var(--warm))] transition-colors duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 flex items-center justify-center text-xs border ${allPacked ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))] text-background" : "border-border text-muted-foreground"}`}>{allPacked ? "✓" : ""}</div>
                          <p className="font-display text-lg text-foreground">{list.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="label-text">{packed}/{total}</p>
                          <span className="text-muted-foreground text-sm transition-transform duration-300" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="border-t border-border">
                          {list.items.map((item, itemIdx) => {
                            const isPacked = packedItems[list.category]?.[itemIdx] ?? false;
                            return (
                              <button key={item} onClick={() => togglePacked(list.category, itemIdx)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-[hsl(var(--warm))] transition-colors duration-200 text-left">
                                <div className={`w-4 h-4 flex items-center justify-center border transition-all duration-300 ${isPacked ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]" : "border-muted-foreground/30"}`}>{isPacked && <span className="text-background text-[0.5rem]">✓</span>}</div>
                                <span className={`font-editorial text-sm transition-all duration-300 ${isPacked ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"}`}>{item}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
              <motion.div {...fade(0.2)}><p className="label-text mb-6">Preparations</p></motion.div>
              <motion.div {...fade(0.25)} className="space-y-3">
                {prepState.map((t, i) => (
                  <button key={i} onClick={() => togglePrep(i)} className="w-full flex items-center gap-3 text-left group py-2">
                    <div className={`w-4 h-4 flex items-center justify-center border transition-all duration-300 shrink-0 ${t.isComplete ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold))]" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"}`}>{t.isComplete && <span className="text-background text-[0.5rem]">✓</span>}</div>
                    <span className={`font-editorial text-sm leading-relaxed transition-all duration-300 ${t.isComplete ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"}`}>{t.description}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </section>
          <section className="px-8 lg:px-16 py-16 lg:py-24">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Weather Outlook</p>
              <h2 className="font-display text-3xl text-foreground leading-[1.1] mb-4">Forecast-Driven Packing</h2>
              <p className="font-editorial text-muted-foreground max-w-xl mb-10">Your packing list includes weather-specific categories. Check the ☀️ Heat, 🌧 Rain, and ❄️ Cool sections above — they're tailored for Central Florida in late March.</p>
            </motion.div>
            <motion.div {...fade(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { icon: "☀️", title: "Heat & Sun", temp: "78–88°F", tip: "UV index peaks mid-day. Bring SPF 50+, hats, and cooling towels." },
                { icon: "🌧", title: "Rain & Storms", temp: "40% chance", tip: "Afternoon thunderstorms are common. Pack ponchos — they beat umbrellas in crowds." },
                { icon: "❄️", title: "Cool Evenings", temp: "62–68°F", tip: "Temps drop after sunset. A lightweight layer keeps fireworks comfortable." },
              ].map((w) => (
                <div key={w.title} className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{w.icon}</span>
                    <h4 className="font-display text-lg text-foreground">{w.title}</h4>
                  </div>
                  <p className="font-display text-2xl text-foreground mb-2">{w.temp}</p>
                  <p className="font-editorial text-sm text-muted-foreground leading-relaxed">{w.tip}</p>
                </div>
              ))}
            </motion.div>
          </section>
        </>
      )}

      {/* ═══ ALERTS SIDEBAR (floating) ═══ */}
      {alerts.length > 0 && (
        <section className="px-8 lg:px-16 py-8 border-t border-border bg-[hsl(var(--warm))]">
          <p className="label-text mb-4">🔔 Active Alerts ({alerts.length})</p>
          <div className="flex flex-wrap gap-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] px-4 py-2">
                <span className="text-sm">🔔</span>
                <div>
                  <p className="font-display text-sm text-foreground">{alert.venueName}</p>
                  <p className="font-editorial text-xs text-muted-foreground">{alert.opensDate ? `Opens ${alert.opensDate}` : "TBD"}{alert.note ? ` · ${alert.note}` : ""}</p>
                </div>
                <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-muted-foreground/40 hover:text-foreground transition-colors text-xs ml-2">✕</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {bookingModal && (
          <BookingModal
            type={bookingModal.type}
            venueName={bookingModal.venue.name}
            venueLocation={bookingModal.venue.parkOrResort}
            onClose={() => setBookingModal(null)}
            onBook={(data) => {
              if (bookingModal.type === "dining") {
                handleBookDining(bookingModal.venue as DiningVenue, data);
              } else {
                handleBookExperience(bookingModal.venue as ExperienceVenue, data);
              }
            }}
          />
        )}
        {alertModal && (
          <AlertModal
            venueName={alertModal.venueName}
            opensDate={alertModal.opensDate}
            onClose={() => setAlertModal(null)}
            onSetAlert={(note) => handleSetAlert(alertModal.type, alertModal.venueName, alertModal.opensDate, note)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetail;
