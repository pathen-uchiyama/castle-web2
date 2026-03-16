import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
  sampleItinerary,
  type ParkAttraction, type AttractionType, type ItineraryItem,
} from "@/data/attractionData";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease },
});

/* ─── Type badges ────────────────────────────────────────────────── */

const typeBadgeColor: Record<string, string> = {
  ride: "bg-foreground text-background",
  show: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]",
  parade: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]",
  character: "bg-accent text-accent-foreground",
  dining: "bg-accent text-accent-foreground",
  seasonal: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]",
  break: "bg-muted text-muted-foreground",
  snack: "bg-muted text-muted-foreground",
  pool: "bg-muted text-muted-foreground",
  hotel: "bg-muted text-muted-foreground",
  meal: "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]",
  "rope-drop": "bg-foreground text-background",
  walk: "bg-muted text-muted-foreground",
};

const typeEmoji: Record<string, string> = {
  ride: "🎢", show: "🎭", parade: "🎉", character: "👑",
  dining: "🍽", seasonal: "🌸", break: "😴", snack: "☕",
  pool: "🏊", hotel: "🏨", meal: "🍽", "rope-drop": "🌅", walk: "🚶",
};

/* ─── Quick-add buttons ──────────────────────────────────────────── */

const quickAdds = [
  { type: "snack" as const, label: "Snack", emoji: "☕" },
  { type: "break" as const, label: "Rest", emoji: "😴" },
  { type: "pool" as const, label: "Pool", emoji: "🏊" },
  { type: "hotel" as const, label: "Hotel", emoji: "🏨" },
  { type: "meal" as const, label: "Meal", emoji: "🍽" },
];

/* ─── Filter options ─────────────────────────────────────────────── */

const pacingOptions = ["Intense", "Moderate", "Relaxed"] as const;
const focusOptions = ["Thrill Seekers", "Toddler Friendly", "Classic Magic", "Shows & Characters"] as const;
const diningOptions = ["Snacks Only", "Quick Service", "Table Service", "Signature Dining"] as const;
const breakOptions = ["Power Through", "Hotel Break", "Pool Break"] as const;

interface DesignerProps {
  trip: BookedTrip;
  partyMembers: PartyMember[];
  diningReservations: DiningReservation[];
  bookedExperiences: BookedExperience[];
}

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences }: DesignerProps) => {
  // Filters
  const [pacing, setPacing] = useState<string>("Moderate");
  const [focus, setFocus] = useState<string>("Classic Magic");
  const [diningLevel, setDiningLevel] = useState<string>("Quick Service");
  const [midDayBreak, setMidDayBreak] = useState<string>("Hotel Break");

  // Park selection
  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType>("ride");
  const [searchQuery, setSearchQuery] = useState("");

  // Group
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  const [isLocked, setIsLocked] = useState(false);

  // Research panel attractions filtered
  const filteredAttractions = useMemo(() => {
    const allAttractions = selectedParks.flatMap(p => allParkAttractions[p] || []);
    return allAttractions.filter(a => {
      if (a.type !== researchCategory) return false;
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedParks, researchCategory, searchQuery]);

  // Park hours for selected parks (using trip's park guide data if available)
  const parkSchedules = useMemo(() => {
    const schedules: { parkId: string; name: string; hours: string; earlyEntry?: string; extHours?: string }[] = [];
    if (selectedParks.includes("mk")) {
      schedules.push({ parkId: "mk", name: "MAGIC KINGDOM", hours: "09:00 AM – 11:00 PM", earlyEntry: "08:30 AM", extHours: "11:00 PM - 1:00 AM" });
    }
    if (selectedParks.includes("epcot")) {
      schedules.push({ parkId: "epcot", name: "EPCOT", hours: "09:00 AM – 09:30 PM", earlyEntry: "08:30 AM", extHours: "9:30 PM - 11:30 PM" });
    }
    return schedules;
  }, [selectedParks]);

  const addToItinerary = (attraction: ParkAttraction) => {
    if (isLocked) return;
    const lastItem = itinerary[itinerary.length - 1];
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      startTime: "",
      duration: parseInt(attraction.duration) || 15,
      waitTime: 15,
      walkTime: 8,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
    };
    setItinerary(prev => [...prev, newItem]);
  };

  const addQuickItem = (type: ItineraryItem["type"], label: string) => {
    if (isLocked) return;
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      name: label,
      type,
      startTime: "",
      duration: type === "snack" ? 15 : type === "break" ? 30 : type === "pool" ? 90 : type === "hotel" ? 60 : 60,
      walkTime: 8,
    };
    setItinerary(prev => [...prev, newItem]);
  };

  const removeFromItinerary = (id: string) => {
    if (isLocked) return;
    setItinerary(prev => prev.filter(item => item.id !== id));
  };

  const toggleGroupMember = (memberId: string) => {
    setGroupMembers(prev =>
      prev.includes(memberId) ? prev.filter(m => m !== memberId) : [...prev, memberId]
    );
  };

  // Confirmed dining/experiences for the summary bar
  const confirmedDining = diningReservations.filter(d => d.status === "confirmed");
  const confirmedExperiences = bookedExperiences.filter(e => e.status === "confirmed");

  return (
    <section className="bg-background">
      {/* ═══ SUMMARY BAR ═══ */}
      <div className="border-b border-border bg-card">
        <div className="px-6 lg:px-10 py-5">
          {/* Trip identity row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl text-foreground mb-1">{trip.tripName}</h2>
              <p className="font-editorial text-sm text-muted-foreground">
                {selectedParks.map(p => parkLabels[p] || p).join(", ")} · 6/14/2026
              </p>
            </div>
            <button className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
              Edit Trip
            </button>
          </div>

          {/* Forecast + Filters row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Forecast */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background">
              <span className="label-text">Forecast</span>
              <span className="font-display text-sm text-foreground">74°F</span>
              <span className="font-editorial text-xs text-muted-foreground">Scattered Showers</span>
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Mid-day break */}
            <div className="flex items-center gap-0.5">
              <span className="label-text mr-2">Mid-Day Break</span>
              {breakOptions.map(opt => (
                <button key={opt} onClick={() => setMidDayBreak(opt)}
                  className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                    midDayBreak === opt
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}>{opt}</button>
              ))}
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Pacing */}
            <div className="flex items-center gap-0.5">
              <span className="label-text mr-2">Pacing</span>
              {pacingOptions.map(opt => (
                <button key={opt} onClick={() => setPacing(opt)}
                  className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                    pacing === opt
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Primary Focus */}
            <div className="flex items-center gap-0.5">
              <span className="label-text mr-2">Primary Focus</span>
              {focusOptions.map(opt => (
                <button key={opt} onClick={() => setFocus(opt)}
                  className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                    focus === opt
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}>{opt}</button>
              ))}
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Dining */}
            <div className="flex items-center gap-0.5">
              <span className="label-text mr-2">Dining</span>
              {diningOptions.map(opt => (
                <button key={opt} onClick={() => setDiningLevel(opt)}
                  className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                    diningLevel === opt
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Resort info */}
          <div className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)] px-4 py-3 flex items-start gap-3 mb-4">
            <span className="label-text !text-[hsl(var(--gold-dark))] shrink-0 mt-0.5">On-Site Resort Guest</span>
            <div>
              <p className="font-display text-sm text-foreground">Disney's Polynesian Village Resort</p>
              <p className="font-editorial text-xs text-muted-foreground mt-0.5">Travel times to hotel prioritized for midday breaks. Eligible for early park entry and 7-day advance LL.</p>
            </div>
          </div>

          {/* Confirmed bookings summary */}
          {(confirmedDining.length > 0 || confirmedExperiences.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {confirmedDining.map(d => (
                <div key={d.reservationId} className="flex items-center gap-1.5 px-2.5 py-1 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.06)]">
                  <span className="text-xs">🍽</span>
                  <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-foreground">{d.restaurantName}</span>
                  <span className="text-[0.5rem] text-muted-foreground">{d.time}</span>
                </div>
              ))}
              {confirmedExperiences.map(e => (
                <div key={e.experienceId} className="flex items-center gap-1.5 px-2.5 py-1 border border-border bg-card">
                  <span className="text-xs">✨</span>
                  <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-foreground">{e.experienceName}</span>
                  <span className="text-[0.5rem] text-muted-foreground">{e.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN LAYOUT: Left timeline + Right panels ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[80vh]">

        {/* ─── LEFT: Daily Itinerary ─────────────────────────────────── */}
        <div className="border-r border-border px-6 lg:px-10 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="label-text mb-2">Daily Itinerary</p>
              <p className="font-editorial text-xs text-muted-foreground">Drag and drop activities to organize your day.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-300 hover:opacity-90">
                Build for Me
              </button>
              <button onClick={() => setIsLocked(!isLocked)}
                className={`px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium border transition-all duration-300 ${
                  isLocked
                    ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {isLocked ? "Unlock Plan" : "Lock Plan"}
              </button>
            </div>
          </div>

          {/* Park hours bars */}
          <div className="mb-8 space-y-3">
            {parkSchedules.map(park => (
              <div key={park.parkId} className="border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm text-foreground">{park.name}</span>
                    <span className="font-editorial text-xs text-muted-foreground">{park.hours}</span>
                  </div>
                </div>
                <div className="flex gap-3 text-[0.5625rem] uppercase tracking-[0.1em]">
                  {park.earlyEntry && (
                    <span className="px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">
                      Early Entry {park.earlyEntry}
                    </span>
                  )}
                  {park.extHours && (
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground border border-border">
                      Ext Hrs {park.extHours}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[60px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-0">
              <AnimatePresence>
                {itinerary.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Time label */}
                    <div className="flex items-start gap-4">
                      <div className="w-[52px] shrink-0 text-right pt-3">
                        {item.startTime && (
                          <span className="font-display text-sm text-foreground">{item.startTime}</span>
                        )}
                      </div>

                      {/* Dot on timeline */}
                      <div className="relative shrink-0 pt-4">
                        <div className={`w-2.5 h-2.5 border-2 ${
                          item.type === "rope-drop" ? "bg-foreground border-foreground" :
                          item.type === "break" || item.type === "pool" || item.type === "hotel" ? "bg-muted border-muted-foreground/30" :
                          item.type === "meal" ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold-dark))]" :
                          "bg-background border-foreground"
                        }`} />
                      </div>

                      {/* Content card */}
                      <div className="flex-1 pb-1">
                        <div className={`border p-3 transition-all duration-300 ${
                          isLocked ? "" : "hover:shadow-[var(--shadow-hover)] cursor-grab"
                        } ${
                          item.isConfirmed ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.04)]" :
                          item.type === "break" || item.type === "pool" || item.type === "hotel" ? "border-dashed border-border bg-muted/30" :
                          "border-border bg-card"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-display text-sm text-foreground">{item.name}</h4>
                            </div>
                            {!isLocked && (
                              <button onClick={() => removeFromItinerary(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-xs transition-all duration-200">✕</button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Type badge */}
                            <span className={`px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] ${typeBadgeColor[item.type] || "bg-muted text-muted-foreground"}`}>
                              {item.type === "rope-drop" ? "Rope Drop" : item.type.replace("-", " ")}
                            </span>

                            {/* LL badge */}
                            {item.llType && item.llType !== "none" && (
                              <span className="px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] bg-accent text-accent-foreground border border-border">
                                {llLabels[item.llType]}
                              </span>
                            )}

                            {/* Wait category */}
                            {item.waitCategory && (
                              <span className={`px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] border ${
                                item.waitCategory === "ill-required" || item.waitCategory === "hard-to-get"
                                  ? "bg-[hsl(var(--destructive)/0.08)] text-destructive border-[hsl(var(--destructive)/0.2)]"
                                  : "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.2)]"
                              }`}>
                                {waitLabels[item.waitCategory]}
                              </span>
                            )}

                            {/* Duration */}
                            <span className="text-[0.5625rem] text-muted-foreground font-editorial">{item.duration} MIN</span>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <p className="font-editorial text-[0.625rem] text-muted-foreground/60 mt-1.5 italic">{item.notes}</p>
                          )}
                        </div>

                        {/* Walk time connector */}
                        {item.walkTime && idx < itinerary.length - 1 && (
                          <div className="flex items-center gap-2 pl-2 py-1">
                            <div className="h-px w-3 bg-border" />
                            <span className="text-[0.5rem] text-muted-foreground/40 uppercase tracking-[0.1em]">{item.walkTime} min walk</span>
                            {item.waitTime && (
                              <>
                                <span className="text-[0.5rem] text-muted-foreground/30">·</span>
                                <span className="text-[0.5rem] text-muted-foreground/40 uppercase tracking-[0.1em]">{item.waitTime} min wait</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick-add row */}
          <div className="flex items-center gap-2 mt-6 ml-[72px]">
            {quickAdds.map(qa => (
              <button key={qa.type} onClick={() => addQuickItem(qa.type, qa.label)}
                className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300">
                <span className="text-sm">{qa.emoji}</span>
                <span className="text-[0.5625rem] uppercase tracking-[0.12em]">{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Group + Research ───────────────────────────────── */}
        <div className="flex flex-col">
          {/* Group members panel */}
          <div className="border-b border-border px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="label-text mb-1">Adventure Group</p>
                <p className="font-editorial text-xs text-muted-foreground">{groupMembers.length} members</p>
              </div>
              <button className="px-3 py-1.5 text-[0.5625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
                Invite Members
              </button>
            </div>

            {groupMembers.length === 0 ? (
              <p className="font-editorial text-xs text-muted-foreground/40 italic mb-4">No group members added yet.</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {partyMembers.map(member => {
                const isAdded = groupMembers.includes(member.memberId);
                return (
                  <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                    className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 ${
                      isAdded
                        ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                        : "border-border bg-card hover:border-foreground/20"
                    }`}>
                    <div className={`w-6 h-6 flex items-center justify-center text-[0.5625rem] font-medium ${
                      isAdded ? "bg-[hsl(var(--gold))] text-background" : "bg-foreground text-background"
                    }`}>{member.initial}</div>
                    <span className="font-display text-xs text-foreground">{member.name}</span>
                    {isAdded && <span className="text-[0.5rem] text-[hsl(var(--gold-dark))]">✓</span>}
                  </button>
                );
              })}
              <button className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border text-muted-foreground hover:border-foreground/30 transition-all duration-300">
                <span className="text-sm">+</span>
                <span className="text-[0.5625rem] uppercase tracking-[0.12em]">New Member</span>
              </button>
            </div>
          </div>

          {/* Research Assistant panel */}
          <div className="flex-1 px-5 py-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 400px)" }}>
            <div className="mb-4">
              <p className="label-text mb-1">Research Assistant</p>
              <p className="font-editorial text-xs text-muted-foreground mb-4">Filter by park and category, then drag into your itinerary.</p>

              {/* Park selector */}
              <div className="flex gap-1 mb-3">
                {availableParks.map(parkId => (
                  <button key={parkId} onClick={() => {
                    setSelectedParks(prev =>
                      prev.includes(parkId)
                        ? prev.length > 1 ? prev.filter(p => p !== parkId) : prev
                        : [...prev, parkId]
                    );
                  }}
                    className={`px-3 py-1.5 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                      selectedParks.includes(parkId)
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}>
                    {parkId === "mk" ? "Magic" : parkId === "epcot" ? "EPCOT" : parkId.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(["ride", "show", "parade", "character", "dining", "seasonal"] as AttractionType[]).map(cat => (
                  <button key={cat} onClick={() => setResearchCategory(cat)}
                    className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                      researchCategory === cat
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    }`}>
                    {typeLabels[cat]}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search attractions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 font-editorial text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
              />
            </div>

            {/* Attraction cards */}
            <div className="space-y-3">
              {filteredAttractions.map(attraction => (
                <motion.div
                  key={attraction.id}
                  {...fade(0)}
                  className={`border bg-card transition-all duration-300 hover:shadow-[var(--shadow-hover)] ${
                    attraction.isClosed ? "opacity-50 border-border" : "border-border"
                  }`}
                >
                  <div className="p-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {attraction.isClosed && (
                            <span className="text-[0.5rem] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-muted text-muted-foreground">🔧 Closed</span>
                          )}
                          <h4 className="font-display text-sm text-foreground">{attraction.name}</h4>
                        </div>
                        <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{attraction.description}</p>
                      </div>
                      <span className="font-display text-sm text-foreground ml-2">{attraction.rating}</span>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] ${typeBadgeColor[attraction.type]}`}>
                        {typeLabels[attraction.type]}
                      </span>
                      {attraction.waitCategory && (
                        <span className={`px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] border ${
                          attraction.waitCategory === "ill-required" || attraction.waitCategory === "hard-to-get"
                            ? "bg-[hsl(var(--destructive)/0.08)] text-destructive border-[hsl(var(--destructive)/0.2)]"
                            : "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.2)]"
                        }`}>
                          {waitLabels[attraction.waitCategory]}
                        </span>
                      )}
                      {attraction.llType !== "none" && (
                        <span className="px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.12em] bg-accent text-accent-foreground border border-border">
                          {llLabels[attraction.llType]}
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 mb-2 text-[0.5625rem] text-muted-foreground">
                      <span>{attraction.duration}</span>
                      <span>{attraction.heightRequirement || "ANY"}</span>
                      <span className="uppercase">{attraction.thrillLevel} Thrill</span>
                      <span>{attraction.environment}</span>
                    </div>

                    {/* Rules & Warnings */}
                    {(attraction.rules.length > 0 || attraction.warnings.length > 0) && (
                      <div className="mb-2">
                        {attraction.rules.length > 0 && (
                          <div className="mb-1">
                            <span className="label-text !text-[0.5rem] mr-1">Rules & Options</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {attraction.rules.map(r => (
                                <span key={r} className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.1em] bg-accent text-accent-foreground border border-border">{r}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {attraction.warnings.length > 0 && (
                          <div>
                            <span className="label-text !text-[0.5rem] mr-1">Warnings</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {attraction.warnings.map(w => (
                                <span key={w} className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.1em] bg-[hsl(var(--destructive)/0.08)] text-destructive border border-[hsl(var(--destructive)/0.2)]">{w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notable + Add button */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-editorial text-[0.625rem] text-muted-foreground italic">Notable: {attraction.notableInsight}</span>
                      {!attraction.isClosed && (
                        <button onClick={() => addToItinerary(attraction)}
                          className="px-3 py-1.5 text-[0.5625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background transition-opacity duration-300 hover:opacity-90">
                          Add to Itinerary
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredAttractions.length === 0 && (
                <div className="py-10 text-center">
                  <p className="font-editorial text-sm text-muted-foreground/40 italic">No {typeLabels[researchCategory].toLowerCase()}s found for the selected park(s).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryDesigner;
