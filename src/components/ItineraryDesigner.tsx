import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
  sampleItinerary,
  type ParkAttraction, type AttractionType, type ItineraryItem,
} from "@/data/attractionData";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── Constants ──────────────────────────────────────────────────── */

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

const quickAdds = [
  { type: "snack" as const, label: "Snack", emoji: "☕" },
  { type: "break" as const, label: "Rest", emoji: "😴" },
  { type: "pool" as const, label: "Pool", emoji: "🏊" },
  { type: "hotel" as const, label: "Hotel", emoji: "🏨" },
  { type: "meal" as const, label: "Meal", emoji: "🍽" },
];

interface DesignerProps {
  trip: BookedTrip;
  partyMembers: PartyMember[];
  diningReservations: DiningReservation[];
  bookedExperiences: BookedExperience[];
}

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences }: DesignerProps) => {
  /* ── State ──────────────────────────────────────────────────────── */
  const [pacing, setPacing] = useState("Moderate");
  const [focus, setFocus] = useState("Classic Magic");
  const [diningLevel, setDiningLevel] = useState("Quick Service");
  const [midDayBreak, setMidDayBreak] = useState("Hotel Break");

  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType>("ride");
  const [searchQuery, setSearchQuery] = useState("");

  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [showGroup, setShowGroup] = useState(false);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Derived ────────────────────────────────────────────────────── */
  const filteredAttractions = useMemo(() => {
    const all = selectedParks.flatMap(p => allParkAttractions[p] || []);
    return all.filter(a => {
      if (a.type !== researchCategory) return false;
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedParks, researchCategory, searchQuery]);

  const confirmedDining = diningReservations.filter(d => d.status === "confirmed");
  const confirmedExperiences = bookedExperiences.filter(e => e.status === "confirmed");

  const parkSchedules = useMemo(() => {
    const s: { parkId: string; name: string; hours: string; earlyEntry?: string; extHours?: string }[] = [];
    if (selectedParks.includes("mk")) s.push({ parkId: "mk", name: "Magic Kingdom", hours: "9:00 AM – 11:00 PM", earlyEntry: "8:30 AM", extHours: "11:00 PM – 1:00 AM" });
    if (selectedParks.includes("epcot")) s.push({ parkId: "epcot", name: "Epcot", hours: "9:00 AM – 9:30 PM", earlyEntry: "8:30 AM", extHours: "9:30 PM – 11:30 PM" });
    return s;
  }, [selectedParks]);

  /* ── Handlers ───────────────────────────────────────────────────── */
  const addToItinerary = (attraction: ParkAttraction) => {
    if (isLocked) return;
    setItinerary(prev => [...prev, {
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
    }]);
  };

  const addQuickItem = (type: ItineraryItem["type"], label: string) => {
    if (isLocked) return;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      name: label,
      type,
      startTime: "",
      duration: type === "snack" ? 15 : type === "break" ? 30 : type === "pool" ? 90 : 60,
      walkTime: 8,
    }]);
  };

  const removeFromItinerary = (id: string) => {
    if (isLocked) return;
    setItinerary(prev => prev.filter(i => i.id !== id));
  };

  const toggleGroupMember = (id: string) => {
    setGroupMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <section className="bg-background">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER BAR — compact summary + dropdown filters
         ═══════════════════════════════════════════════════════════════ */}
      <div className="border-b border-border">
        <div className="px-6 lg:px-10 py-6">

          {/* Row 1: Trip name + actions */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="label-text mb-2">Itinerary Designer</p>
              <h2 className="font-display text-2xl text-foreground">{trip.tripName}</h2>
              <p className="font-editorial text-sm text-muted-foreground mt-1">
                {selectedParks.map(p => parkLabels[p] || p).join(" · ")} · June 14, 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGroup(!showGroup)}
                className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300"
              >
                Group ({groupMembers.length})
              </button>
              <button className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
                Edit Trip
              </button>
            </div>
          </div>

          {/* Row 2: Resort + Forecast + Confirmed bookings */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)]">
              <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-[hsl(var(--gold-dark))]">Resort</span>
              <span className="font-display text-xs text-foreground">Polynesian Village</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-border">
              <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground">Forecast</span>
              <span className="font-display text-xs text-foreground">74°F</span>
              <span className="font-editorial text-xs text-muted-foreground">Scattered Showers</span>
            </div>
            {confirmedDining.map(d => (
              <div key={d.reservationId} className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)]">
                <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-foreground">{d.restaurantName}</span>
                <span className="text-[0.5rem] text-muted-foreground">{d.time}</span>
              </div>
            ))}
            {confirmedExperiences.map(e => (
              <div key={e.experienceId} className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border">
                <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-foreground">{e.experienceName}</span>
                <span className="text-[0.5rem] text-muted-foreground">{e.time}</span>
              </div>
            ))}
          </div>

          {/* Row 3: Dropdown filters in a clean row */}
          <div className="flex flex-wrap items-end gap-4">
            <FilterDropdown label="Mid-Day Break" value={midDayBreak} onChange={setMidDayBreak}
              options={["Power Through", "Hotel Break", "Pool Break"]} />
            <FilterDropdown label="Pacing" value={pacing} onChange={setPacing}
              options={["Intense", "Moderate", "Relaxed"]} />
            <FilterDropdown label="Primary Focus" value={focus} onChange={setFocus}
              options={["Thrill Seekers", "Toddler Friendly", "Classic Magic", "Shows & Characters"]} />
            <FilterDropdown label="Dining" value={diningLevel} onChange={setDiningLevel}
              options={["Snacks Only", "Quick Service", "Table Service", "Signature Dining"]} />
          </div>
        </div>

        {/* Group members drawer */}
        <AnimatePresence>
          {showGroup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="px-6 lg:px-10 py-5">
                <p className="label-text mb-3">Adventure Group</p>
                <div className="flex flex-wrap gap-2">
                  {partyMembers.map(member => {
                    const isAdded = groupMembers.includes(member.memberId);
                    return (
                      <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                        className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 ${
                          isAdded
                            ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                            : "border-border hover:border-foreground/20"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TWO-COLUMN BODY — Timeline (left) + Research (right)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">

        {/* ─── LEFT: Daily Itinerary ─────────────────────────────────── */}
        <div className="border-r border-border px-6 lg:px-8 py-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <p className="label-text">Your Day</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity duration-300">
                Build for Me
              </button>
              <button onClick={() => setIsLocked(!isLocked)}
                className={`px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium border transition-all duration-300 ${
                  isLocked
                    ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {isLocked ? "Unlock" : "Lock Plan"}
              </button>
            </div>
          </div>

          {/* Park hours */}
          <div className="space-y-2 mb-6">
            {parkSchedules.map(park => (
              <div key={park.parkId} className="flex items-center gap-3 px-3 py-2 border border-border">
                <span className="font-display text-xs text-foreground">{park.name}</span>
                <span className="font-editorial text-[0.625rem] text-muted-foreground">{park.hours}</span>
                {park.earlyEntry && (
                  <span className="px-1.5 py-0.5 text-[0.5rem] uppercase tracking-[0.1em] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">
                    Early {park.earlyEntry}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Timeline items */}
          <div className="relative">
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {itinerary.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="relative group"
                >
                  <div className="flex items-start gap-3">
                    {/* Time */}
                    <div className="w-[44px] shrink-0 text-right pt-2.5">
                      {item.startTime && (
                        <span className="font-display text-[0.6875rem] text-foreground">{item.startTime}</span>
                      )}
                    </div>

                    {/* Dot */}
                    <div className="relative shrink-0 pt-3.5">
                      <div className={`w-2 h-2 border-2 ${
                        item.type === "rope-drop" ? "bg-foreground border-foreground" :
                        item.type === "meal" ? "bg-[hsl(var(--gold))] border-[hsl(var(--gold-dark))]" :
                        ["break","pool","hotel","snack"].includes(item.type) ? "bg-muted border-muted-foreground/30" :
                        "bg-background border-foreground"
                      }`} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 pb-1">
                      <div className={`border px-3 py-2.5 transition-all duration-300 ${
                        !isLocked ? "hover:shadow-[var(--shadow-hover)] cursor-grab" : ""
                      } ${
                        item.isConfirmed ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.04)]" :
                        ["break","pool","hotel"].includes(item.type) ? "border-dashed border-border bg-muted/20" :
                        "border-border"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xs text-foreground">{item.name}</span>
                            <span className={`px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] ${typeBadgeColor[item.type]}`}>
                              {item.type === "rope-drop" ? "Arrive" : item.type}
                            </span>
                            {item.llType && item.llType !== "none" && (
                              <span className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] bg-accent text-accent-foreground border border-border">
                                {llLabels[item.llType]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[0.5rem] text-muted-foreground">{item.duration}m</span>
                            {!isLocked && (
                              <button onClick={() => removeFromItinerary(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-xs transition-all duration-200">✕</button>
                            )}
                          </div>
                        </div>
                        {item.notes && (
                          <p className="font-editorial text-[0.5625rem] text-muted-foreground/50 mt-1 italic">{item.notes}</p>
                        )}
                      </div>

                      {/* Walk connector */}
                      {item.walkTime && idx < itinerary.length - 1 && (
                        <div className="flex items-center gap-1.5 pl-1 py-0.5">
                          <div className="h-px w-2 bg-border" />
                          <span className="text-[0.45rem] text-muted-foreground/30 uppercase tracking-[0.1em]">
                            {item.walkTime}m walk
                            {item.waitTime ? ` · ${item.waitTime}m wait` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick-add */}
          <div className="flex items-center gap-2 mt-5 ml-[64px]">
            {quickAdds.map(qa => (
              <button key={qa.type} onClick={() => addQuickItem(qa.type, qa.label)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300">
                <span className="text-xs">{qa.emoji}</span>
                <span className="text-[0.5rem] uppercase tracking-[0.12em]">{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Research Assistant ──────────────────────────────── */}
        <div className="px-6 lg:px-8 py-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>

          {/* Header */}
          <p className="label-text mb-3">Research Assistant</p>
          <p className="font-editorial text-xs text-muted-foreground mb-5">
            Browse and add activities to your itinerary.
          </p>

          {/* Park toggle */}
          <div className="flex gap-1 mb-4">
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
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {parkId === "mk" ? "Magic Kingdom" : parkId === "epcot" ? "Epcot" : parkId.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 mb-4">
            {(["ride", "show", "parade", "character", "dining", "seasonal"] as AttractionType[]).map(cat => (
              <button key={cat} onClick={() => setResearchCategory(cat)}
                className={`px-2.5 py-1 text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                  researchCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {typeLabels[cat]}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-border bg-background px-3 py-2 font-editorial text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors mb-5"
          />

          {/* Attraction list */}
          <div className="space-y-2">
            {filteredAttractions.map(attraction => (
              <div
                key={attraction.id}
                className={`border bg-card transition-all duration-300 hover:shadow-[var(--shadow-hover)] ${
                  attraction.isClosed ? "opacity-40" : ""
                }`}
              >
                <div className="p-3">
                  {/* Name + rating + add */}
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {attraction.isClosed && (
                          <span className="text-[0.45rem] uppercase tracking-[0.1em] px-1 py-0.5 bg-muted text-muted-foreground">Closed</span>
                        )}
                        <h4 className="font-display text-sm text-foreground">{attraction.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-display text-xs text-muted-foreground">{attraction.rating}</span>
                      {!attraction.isClosed && (
                        <button onClick={() => addToItinerary(attraction)}
                          className="px-2.5 py-1 text-[0.5rem] tracking-[0.15em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity duration-300">
                          + Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-editorial text-[0.6875rem] text-muted-foreground leading-relaxed mb-2">{attraction.description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    <span className={`px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] ${typeBadgeColor[attraction.type]}`}>
                      {typeLabels[attraction.type]}
                    </span>
                    {attraction.waitCategory && (
                      <span className={`px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] border ${
                        attraction.waitCategory === "ill-required" || attraction.waitCategory === "hard-to-get"
                          ? "bg-[hsl(var(--destructive)/0.08)] text-destructive border-[hsl(var(--destructive)/0.2)]"
                          : "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.2)]"
                      }`}>
                        {waitLabels[attraction.waitCategory]}
                      </span>
                    )}
                    {attraction.llType !== "none" && (
                      <span className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.12em] bg-accent text-accent-foreground border border-border">
                        {llLabels[attraction.llType]}
                      </span>
                    )}
                  </div>

                  {/* Compact stats */}
                  <div className="flex gap-3 text-[0.5rem] text-muted-foreground">
                    <span>{attraction.duration}</span>
                    <span>{attraction.heightRequirement || "Any height"}</span>
                    <span className="capitalize">{attraction.thrillLevel}</span>
                    <span>{attraction.environment}</span>
                  </div>

                  {/* Notable */}
                  {attraction.notableInsight && (
                    <p className="font-editorial text-[0.5625rem] text-muted-foreground/50 italic mt-1.5">
                      {attraction.notableInsight}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {filteredAttractions.length === 0 && (
              <div className="py-12 text-center">
                <p className="font-editorial text-sm text-muted-foreground/40 italic">
                  No {typeLabels[researchCategory].toLowerCase()}s found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Filter dropdown sub-component ──────────────────────────────── */

function FilterDropdown({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label-text">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[160px] border-border bg-background text-xs font-display text-foreground focus:ring-0 focus:ring-offset-0 focus:border-[hsl(var(--gold))]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(opt => (
            <SelectItem key={opt} value={opt} className="text-xs font-editorial">{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ItineraryDesigner;
