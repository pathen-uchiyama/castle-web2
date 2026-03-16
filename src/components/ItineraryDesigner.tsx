import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronDown, Plus, X, Search, Star, Lock, Unlock, Sparkles } from "lucide-react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
  sampleItinerary,
  type ParkAttraction, type AttractionType, type ItineraryItem,
} from "@/data/attractionData";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

/* ─── Types ──────────────────────────────────────────────────────── */

interface SurveyResponse {
  memberId: string;
  memberName: string;
  topFiveMustDos: string[];
  rankings: Record<string, string>;
  status: string;
}

interface DesignerProps {
  trip: BookedTrip;
  partyMembers: PartyMember[];
  diningReservations: DiningReservation[];
  bookedExperiences: BookedExperience[];
  surveyResponses?: SurveyResponse[];
}

/* ─── Quick-add items ────────────────────────────────────────────── */

const quickAdds = [
  { type: "snack" as const, label: "Snack", emoji: "☕" },
  { type: "break" as const, label: "Rest", emoji: "😴" },
  { type: "pool" as const, label: "Pool", emoji: "🏊" },
  { type: "hotel" as const, label: "Hotel", emoji: "🏨" },
  { type: "meal" as const, label: "Meal", emoji: "🍽" },
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences, surveyResponses = [] }: DesignerProps) => {

  /* ── State ──────────────────────────────────────────────────────── */
  const [pacing, setPacing] = useState("Moderate");
  const [focus, setFocus] = useState("Classic Magic");
  const [diningLevel, setDiningLevel] = useState("Quick Service");
  const [midDayBreak, setMidDayBreak] = useState("Hotel Break");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>(partyMembers.map(m => m.memberId));

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Derived ────────────────────────────────────────────────────── */

  // Collect all top-5 must-dos from survey
  const topFiveIds = useMemo(() => {
    const ids = new Set<string>();
    surveyResponses.forEach(r => {
      if (r.status === "completed") {
        r.topFiveMustDos.forEach(id => ids.add(id));
      }
    });
    return ids;
  }, [surveyResponses]);

  // Who voted for what
  const topFiveVoters = useMemo(() => {
    const map: Record<string, string[]> = {};
    surveyResponses.forEach(r => {
      if (r.status === "completed") {
        r.topFiveMustDos.forEach(id => {
          if (!map[id]) map[id] = [];
          map[id].push(r.memberName);
        });
      }
    });
    return map;
  }, [surveyResponses]);

  const filteredAttractions = useMemo(() => {
    const all = selectedParks.flatMap(p => allParkAttractions[p] || []);
    return all
      .filter(a => {
        if (researchCategory !== "all" && a.type !== researchCategory) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        // Top-5 items float to top
        const aTop = topFiveIds.has(a.id) ? 1 : 0;
        const bTop = topFiveIds.has(b.id) ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return b.rating - a.rating;
      });
  }, [selectedParks, researchCategory, searchQuery, topFiveIds]);

  const confirmedDining = diningReservations.filter(d => d.status === "confirmed" || d.status === "pending");
  const confirmedExperiences = bookedExperiences.filter(e => e.status === "confirmed" || e.status === "pending");

  const parkSchedules = useMemo(() => {
    const s: { parkId: string; name: string; hours: string; earlyEntry?: string; extHours?: string }[] = [];
    if (selectedParks.includes("mk")) s.push({ parkId: "mk", name: "Magic Kingdom", hours: "9:00 AM – 11:00 PM", earlyEntry: "8:30 AM", extHours: "11:00 PM – 1:00 AM" });
    if (selectedParks.includes("epcot")) s.push({ parkId: "epcot", name: "EPCOT", hours: "9:00 AM – 9:30 PM", earlyEntry: "8:30 AM", extHours: "9:30 PM – 11:30 PM" });
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

  const togglePark = (parkId: string) => {
    setSelectedParks(prev =>
      prev.includes(parkId)
        ? prev.length > 1 ? prev.filter(p => p !== parkId) : prev
        : [...prev, parkId]
    );
  };

  return (
    <section className="bg-background">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER — 4 Widget Cards
         ═══════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 py-8 border-b border-border">

        {/* Title row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="label-text mb-2">Itinerary Designer</p>
            <h2 className="font-display text-2xl text-foreground">{trip.tripName}</h2>
            <p className="font-editorial text-sm text-muted-foreground mt-1">
              {selectedParks.map(p => parkLabels[p] || p).join(" · ")} · June 14, 2026
            </p>
          </div>
          <button className="px-4 py-2 text-[0.625rem] tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-foreground/30 transition-all duration-300">
            Edit Trip
          </button>
        </div>

        {/* 4 Widgets grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Widget 1: Forecast */}
          <div className="border border-border p-4">
            <p className="label-text mb-2">Forecast</p>
            <p className="font-display text-lg text-foreground">74°F</p>
            <p className="font-editorial text-xs text-muted-foreground">Scattered Showers</p>
          </div>

          {/* Widget 2: Resort */}
          <div className="border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.03)] p-4">
            <p className="label-text mb-2">On-Site Resort</p>
            <p className="font-display text-sm text-foreground">Polynesian Village</p>
            <p className="font-editorial text-[0.625rem] text-muted-foreground mt-1">Early entry · 7-day LL advance</p>
          </div>

          {/* Widget 3: Today's Bookings */}
          <div className="border border-border p-4">
            <p className="label-text mb-2">Today's Bookings</p>
            {confirmedDining.length === 0 && confirmedExperiences.length === 0 ? (
              <p className="font-editorial text-xs text-muted-foreground italic">No bookings for this date</p>
            ) : (
              <div className="space-y-1">
                {confirmedDining.slice(0, 2).map(d => (
                  <div key={d.reservationId} className="flex items-center justify-between">
                    <span className="font-display text-xs text-foreground truncate">{d.restaurantName}</span>
                    <span className="text-[0.5625rem] text-muted-foreground ml-2 shrink-0">{d.time}</span>
                  </div>
                ))}
                {confirmedExperiences.slice(0, 2).map(e => (
                  <div key={e.experienceId} className="flex items-center justify-between">
                    <span className="font-display text-xs text-foreground truncate">{e.experienceName}</span>
                    <span className="text-[0.5625rem] text-muted-foreground ml-2 shrink-0">{e.time}</span>
                  </div>
                ))}
                {(confirmedDining.length + confirmedExperiences.length > 4) && (
                  <p className="text-[0.5rem] text-muted-foreground">+{confirmedDining.length + confirmedExperiences.length - 4} more</p>
                )}
              </div>
            )}
          </div>

          {/* Widget 4: Filters (collapsible) */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <div className="border border-border p-4">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <p className="label-text">Preferences</p>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${filtersOpen ? "rotate-180" : ""}`} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 text-[0.5rem] tracking-[0.1em] uppercase bg-muted text-muted-foreground">{pacing}</span>
                  <span className="px-2 py-0.5 text-[0.5rem] tracking-[0.1em] uppercase bg-muted text-muted-foreground">{focus}</span>
                  <span className="px-2 py-0.5 text-[0.5rem] tracking-[0.1em] uppercase bg-muted text-muted-foreground">{midDayBreak}</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <FilterDropdown label="Pacing" value={pacing} onChange={setPacing} options={["Intense", "Moderate", "Relaxed"]} />
                  <FilterDropdown label="Focus" value={focus} onChange={setFocus} options={["Thrill Seekers", "Toddler Friendly", "Classic Magic", "Shows & Characters"]} />
                  <FilterDropdown label="Mid-Day" value={midDayBreak} onChange={setMidDayBreak} options={["Power Through", "Hotel Break", "Pool Break"]} />
                  <FilterDropdown label="Dining" value={diningLevel} onChange={setDiningLevel} options={["Snacks Only", "Quick Service", "Table Service", "Signature Dining"]} />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GROUP MEMBERS — collapsible strip
         ═══════════════════════════════════════════════════════════════ */}
      <Collapsible open={groupOpen} onOpenChange={setGroupOpen}>
        <div className="border-b border-border">
          <CollapsibleTrigger className="w-full px-6 lg:px-10 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <p className="label-text">Adventure Group</p>
              <div className="flex -space-x-1">
                {partyMembers.filter(m => groupMembers.includes(m.memberId)).map(m => (
                  <div key={m.memberId} className="w-5 h-5 flex items-center justify-center text-[0.45rem] font-medium bg-foreground text-background border border-background">
                    {m.initial}
                  </div>
                ))}
              </div>
              <span className="text-[0.5625rem] text-muted-foreground">{groupMembers.length} members</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${groupOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 lg:px-10 pb-4">
              <div className="flex flex-wrap gap-2">
                {partyMembers.map(member => {
                  const isAdded = groupMembers.includes(member.memberId);
                  return (
                    <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                      className={`flex items-center gap-2 px-3 py-2 border transition-all duration-300 ${
                        isAdded
                          ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                          : "border-border hover:border-foreground/20 opacity-50"
                      }`}>
                      <div className={`w-6 h-6 flex items-center justify-center text-[0.5625rem] font-medium ${
                        isAdded ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      }`}>{member.initial}</div>
                      <div className="text-left">
                        <span className="font-display text-xs text-foreground block">{member.name}</span>
                        <span className="text-[0.5rem] text-muted-foreground">{member.role}</span>
                      </div>
                    </button>
                  );
                })}
                <button className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border text-muted-foreground hover:border-foreground/30 transition-all duration-300">
                  <Plus className="w-3 h-3" />
                  <span className="text-[0.5625rem] uppercase tracking-[0.12em]">Invite</span>
                </button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* ═══════════════════════════════════════════════════════════════
          TWO COLUMNS — Itinerary (left) | Research (right)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ─── LEFT: Daily Itinerary ─────────────────────────────────── */}
        <div className="border-r border-border px-6 lg:px-8 py-8 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)]">

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <p className="label-text">Your Day</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[0.5625rem] tracking-[0.12em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity duration-300">
                <Sparkles className="w-3 h-3" />
                Build for Me
              </button>
              <button onClick={() => setIsLocked(!isLocked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.5625rem] tracking-[0.12em] uppercase font-medium border transition-all duration-300 ${
                  isLocked
                    ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {isLocked ? "Locked" : "Lock"}
              </button>
            </div>
          </div>

          {/* Park hours — compact */}
          <div className="space-y-1.5 mb-6">
            {parkSchedules.map(park => (
              <div key={park.parkId} className="flex items-center gap-2 text-[0.5625rem]">
                <span className="font-display text-foreground">{park.name}</span>
                <span className="text-muted-foreground">{park.hours}</span>
                {park.earlyEntry && (
                  <span className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.1em] bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.15)]">
                    Early {park.earlyEntry}
                  </span>
                )}
                {park.extHours && (
                  <span className="px-1.5 py-0.5 text-[0.45rem] uppercase tracking-[0.1em] bg-muted text-muted-foreground">
                    Ext {park.extHours}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[48px] top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {itinerary.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group mb-1"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Time */}
                    <div className="w-[40px] shrink-0 text-right pt-2">
                      {item.startTime && (
                        <span className="font-display text-[0.625rem] text-foreground leading-none">{item.startTime}</span>
                      )}
                    </div>

                    {/* Dot */}
                    <div className="relative shrink-0 pt-3">
                      <div className={`w-1.5 h-1.5 ${
                        item.type === "rope-drop" ? "bg-foreground" :
                        item.type === "meal" || item.isConfirmed ? "bg-[hsl(var(--gold))]" :
                        ["break","pool","hotel","snack"].includes(item.type) ? "bg-muted-foreground/30" :
                        "bg-foreground/40"
                      }`} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 pb-0.5">
                      <div className={`border px-3 py-2 transition-all duration-300 ${
                        !isLocked ? "hover:shadow-[var(--shadow-hover)] cursor-grab" : ""
                      } ${
                        item.isConfirmed ? "border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.03)]" :
                        ["break","pool","hotel"].includes(item.type) ? "border-dashed border-border" :
                        "border-border"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-display text-xs text-foreground truncate">{item.name}</span>
                            <span className={`px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] shrink-0 ${
                              item.type === "ride" ? "bg-foreground text-background" :
                              item.type === "meal" || item.type === "rope-drop" ? "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold-dark))]" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {item.type === "rope-drop" ? "Arrive" : item.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                            <span className="text-[0.5rem] text-muted-foreground">{item.duration}m</span>
                            {!isLocked && (
                              <button onClick={() => removeFromItinerary(item.id)}
                                className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* LL badge */}
                        {item.llType && item.llType !== "none" && (
                          <span className="inline-block mt-1 px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] bg-accent text-accent-foreground border border-border">
                            {llLabels[item.llType]}
                          </span>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="font-editorial text-[0.5rem] text-muted-foreground mt-1 italic">{item.notes}</p>
                        )}
                      </div>

                      {/* Walk connector */}
                      {item.walkTime && idx < itinerary.length - 1 && (
                        <div className="flex items-center gap-1 pl-1 py-0.5">
                          <div className="h-px w-1.5 bg-border" />
                          <span className="text-[0.4rem] text-muted-foreground/40 uppercase tracking-[0.08em]">
                            {item.walkTime}m walk{item.waitTime ? ` · ${item.waitTime}m wait` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick-add strip */}
          <div className="flex items-center gap-1.5 mt-4 ml-[56px]">
            {quickAdds.map(qa => (
              <button key={qa.type} onClick={() => addQuickItem(qa.type, qa.label)}
                className="flex items-center gap-1 px-2 py-1 border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300">
                <span className="text-[0.625rem]">{qa.emoji}</span>
                <span className="text-[0.45rem] uppercase tracking-[0.1em]">{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Research Assistant ──────────────────────────────── */}
        <div className="px-6 lg:px-8 py-8 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)]">

          <p className="label-text mb-1">Research Assistant</p>
          <p className="font-editorial text-xs text-muted-foreground mb-4">
            Browse attractions and add them to your day.
          </p>

          {/* Park toggle + search row */}
          <div className="flex items-center gap-2 mb-3">
            {availableParks.map(parkId => (
              <button key={parkId} onClick={() => togglePark(parkId)}
                className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  selectedParks.includes(parkId)
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {parkId === "mk" ? "Magic" : parkId === "epcot" ? "Epcot" : parkId.toUpperCase()}
              </button>
            ))}
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-32 border border-border bg-background pl-6 pr-2 py-1 font-editorial text-[0.625rem] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
              />
            </div>
          </div>

          {/* Category filter row */}
          <div className="flex gap-1 mb-4 flex-wrap">
            <button onClick={() => setResearchCategory("all")}
              className={`px-2 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                researchCategory === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-border hover:border-foreground/30"
              }`}>All</button>
            {(["ride", "show", "parade", "character", "seasonal"] as AttractionType[]).map(cat => (
              <button key={cat} onClick={() => setResearchCategory(cat)}
                className={`px-2 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  researchCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:border-foreground/30"
                }`}>
                {typeLabels[cat]}
              </button>
            ))}
          </div>

          {/* Attraction list */}
          <div className="space-y-1.5">
            {filteredAttractions.map(attraction => {
              const isTopFive = topFiveIds.has(attraction.id);
              const voters = topFiveVoters[attraction.id];
              const alreadyAdded = itinerary.some(i => i.attractionId === attraction.id);

              return (
                <div
                  key={attraction.id}
                  className={`border transition-all duration-300 ${
                    attraction.isClosed ? "opacity-30 pointer-events-none" :
                    isTopFive ? "border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.03)] hover:shadow-[var(--shadow-hover)]" :
                    "border-border hover:shadow-[var(--shadow-hover)]"
                  }`}
                >
                  <div className="px-3 py-2.5">
                    {/* Row 1: Name + add button */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isTopFive && <Star className="w-3 h-3 text-[hsl(var(--gold))] shrink-0 fill-[hsl(var(--gold))]" />}
                        <h4 className="font-display text-xs text-foreground truncate">{attraction.name}</h4>
                        <span className="font-display text-[0.5625rem] text-muted-foreground shrink-0">{attraction.rating}</span>
                      </div>
                      {!attraction.isClosed && (
                        <button
                          onClick={() => addToItinerary(attraction)}
                          disabled={alreadyAdded || isLocked}
                          className={`shrink-0 ml-2 px-2 py-0.5 text-[0.45rem] tracking-[0.12em] uppercase font-medium transition-all duration-300 ${
                            alreadyAdded
                              ? "bg-muted text-muted-foreground cursor-default"
                              : "bg-foreground text-background hover:opacity-90"
                          }`}
                        >
                          {alreadyAdded ? "Added" : "+ Add"}
                        </button>
                      )}
                    </div>

                    {/* Row 2: Badges */}
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] bg-foreground/5 text-muted-foreground">
                        {attraction.duration}
                      </span>
                      <span className="px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] bg-foreground/5 text-muted-foreground capitalize">
                        {attraction.thrillLevel}
                      </span>
                      {attraction.heightRequirement && attraction.heightRequirement !== "ANY" && (
                        <span className="px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] bg-foreground/5 text-muted-foreground">
                          {attraction.heightRequirement}
                        </span>
                      )}
                      {attraction.waitCategory && (
                        <span className={`px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] ${
                          attraction.waitCategory === "ill-required" || attraction.waitCategory === "hard-to-get"
                            ? "bg-destructive/8 text-destructive"
                            : "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]"
                        }`}>
                          {waitLabels[attraction.waitCategory]}
                        </span>
                      )}
                      {attraction.llType !== "none" && (
                        <span className="px-1 py-0.5 text-[0.4rem] uppercase tracking-[0.1em] bg-accent text-accent-foreground">
                          {llLabels[attraction.llType]}
                        </span>
                      )}
                    </div>

                    {/* Row 3: Description + notable */}
                    <p className="font-editorial text-[0.625rem] text-muted-foreground leading-relaxed">{attraction.description}</p>

                    {/* Top-5 voters */}
                    {isTopFive && voters && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-2.5 h-2.5 text-[hsl(var(--gold))]" />
                        <span className="font-editorial text-[0.5rem] text-[hsl(var(--gold-dark))] italic">
                          Top 5 for {voters.join(" & ")}
                        </span>
                      </div>
                    )}

                    {attraction.isClosed && (
                      <span className="inline-block mt-1 text-[0.45rem] uppercase tracking-[0.1em] px-1 py-0.5 bg-muted text-muted-foreground">Closed</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredAttractions.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-editorial text-sm text-muted-foreground/40 italic">
                  No attractions found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Filter dropdown ────────────────────────────────────────────── */

function FilterDropdown({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[0.5625rem] text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 w-[130px] border-border bg-background text-[0.625rem] font-display text-foreground focus:ring-0 focus:ring-offset-0">
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
