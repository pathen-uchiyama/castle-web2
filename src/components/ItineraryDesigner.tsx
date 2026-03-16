import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronDown, Plus, X, Search, Star, Lock, Unlock, Sparkles, AlertTriangle, Clock, Ruler, Zap, Shield, Info } from "lucide-react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
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
  { type: "snack" as const, label: "Snack Stop", emoji: "☕", dur: 15 },
  { type: "break" as const, label: "Rest", emoji: "😴", dur: 30 },
  { type: "pool" as const, label: "Pool Time", emoji: "🏊", dur: 90 },
  { type: "walk" as const, label: "Walk / Explore", emoji: "🚶", dur: 20 },
];

/* ─── Thrill icons ───────────────────────────────────────────────── */
const thrillEmoji: Record<string, string> = { mild: "🟢", moderate: "🟡", high: "🔴" };

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences, surveyResponses = [] }: DesignerProps) => {

  /* ── State ──────────────────────────────────────────────────────── */
  const [pacing, setPacing] = useState("Moderate");
  const [focus, setFocus] = useState("Classic Magic");
  const [midDayBreak, setMidDayBreak] = useState("Hotel Break");

  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>(partyMembers.map(m => m.memberId));

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Seed itinerary with confirmed bookings
  const seededBookings = useMemo((): ItineraryItem[] => {
    const items: ItineraryItem[] = [];
    // Add dining
    diningReservations.forEach(d => {
      items.push({
        id: `booked-${d.reservationId}`,
        name: d.restaurantName,
        type: "meal",
        startTime: d.time,
        duration: 75,
        walkTime: 10,
        isConfirmed: d.status === "confirmed",
        notes: d.status === "confirmed" ? `✓ CONFIRMED · ${d.confirmationNumber}` : "PENDING",
      });
    });
    // Add experiences
    bookedExperiences.forEach(e => {
      items.push({
        id: `booked-${e.experienceId}`,
        name: e.experienceName,
        type: "show",
        startTime: e.time,
        duration: parseInt(e.duration) || 30,
        walkTime: 10,
        isConfirmed: e.status === "confirmed",
        notes: e.status === "confirmed" ? `✓ CONFIRMED · ${e.confirmationNumber}` : "PENDING",
      });
    });
    return items.sort((a, b) => {
      const toMin = (t: string) => {
        const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!m) return 0;
        let h = parseInt(m[1]);
        const min = parseInt(m[2]);
        if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
        if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
        return h * 60 + min;
      };
      return toMin(a.startTime) - toMin(b.startTime);
    });
  }, [diningReservations, bookedExperiences]);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(seededBookings);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Derived ────────────────────────────────────────────────────── */

  const topFiveIds = useMemo(() => {
    const ids = new Set<string>();
    surveyResponses.forEach(r => {
      if (r.status === "completed") r.topFiveMustDos.forEach(id => ids.add(id));
    });
    return ids;
  }, [surveyResponses]);

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
        const aTop = topFiveIds.has(a.id) ? 1 : 0;
        const bTop = topFiveIds.has(b.id) ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return b.rating - a.rating;
      });
  }, [selectedParks, researchCategory, searchQuery, topFiveIds]);

  const parkSchedules = useMemo(() => {
    const s: { parkId: string; name: string; hours: string; earlyEntry?: string }[] = [];
    if (selectedParks.includes("mk")) s.push({ parkId: "mk", name: "Magic Kingdom", hours: "9 AM – 11 PM", earlyEntry: "8:30 AM" });
    if (selectedParks.includes("epcot")) s.push({ parkId: "epcot", name: "EPCOT", hours: "9 AM – 9:30 PM", earlyEntry: "8:30 AM" });
    return s;
  }, [selectedParks]);

  // Overbooking warning
  const rideCount = itinerary.filter(i => i.type === "ride").length;
  const showOverbookingWarning = pacing !== "Intense" && rideCount > 8;

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

  const addQuickItem = (type: ItineraryItem["type"], label: string, dur: number) => {
    if (isLocked) return;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      name: label,
      type,
      startTime: "",
      duration: dur,
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
      prev.includes(parkId) ? (prev.length > 1 ? prev.filter(p => p !== parkId) : prev) : [...prev, parkId]
    );
  };

  return (
    <section className="bg-[hsl(var(--warm))]">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER — Compact editorial strip
         ═══════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pt-8 pb-6">

        {/* Title row */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-text mb-2">The Designer</p>
            <h2 className="font-display text-3xl text-foreground leading-[1.05]">{trip.tripName}</h2>
            <p className="font-editorial text-sm text-muted-foreground mt-1">
              {selectedParks.map(p => parkLabels[p] || p).join(" · ")} · June 14, 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-[0.5625rem] tracking-[0.12em] uppercase font-medium bg-foreground text-background hover:opacity-90 transition-opacity duration-300">
              <Sparkles className="w-3 h-3" />
              Build for Me
            </button>
            <button onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[0.5625rem] tracking-[0.12em] uppercase font-medium border transition-all duration-300 ${
                isLocked
                  ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]"
                  : "text-muted-foreground border-border hover:border-foreground/30"
              }`}>
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLocked ? "Unlock Plan" : "Lock Plan"}
            </button>
          </div>
        </div>

        {/* 3 widget cards */}
        <div className="grid grid-cols-3 gap-3">

          {/* Forecast — compact */}
          <div className="bg-card border border-border p-3 shadow-soft flex items-center gap-3">
            <span className="text-xl">⛅</span>
            <div>
              <p className="font-display text-sm text-foreground">74°F · Showers</p>
              <p className="text-[0.5rem] text-muted-foreground uppercase tracking-[0.1em]">Pack ponchos</p>
            </div>
          </div>

          {/* Resort */}
          <div className="bg-card border border-[hsl(var(--gold)/0.25)] p-3 shadow-soft">
            <p className="text-[0.5rem] uppercase tracking-[0.12em] text-[hsl(var(--gold-dark))] mb-0.5">On-Site Resort</p>
            <p className="font-display text-sm text-foreground">Polynesian Village</p>
            <p className="text-[0.5rem] text-muted-foreground mt-0.5">Early Entry · Extended Hours</p>
          </div>

          {/* Preferences — inline */}
          <div className="bg-card border border-border p-3 shadow-soft">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[0.45rem] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Pace</p>
                <Select value={pacing} onValueChange={setPacing}>
                  <SelectTrigger className="h-6 border-border bg-background text-[0.5625rem] font-display text-foreground focus:ring-0 focus:ring-offset-0 px-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Intense", "Moderate", "Relaxed"].map(o => (
                      <SelectItem key={o} value={o} className="text-xs font-editorial">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[0.45rem] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Focus</p>
                <Select value={focus} onValueChange={setFocus}>
                  <SelectTrigger className="h-6 border-border bg-background text-[0.5625rem] font-display text-foreground focus:ring-0 focus:ring-offset-0 px-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Thrill Seekers", "Toddler Friendly", "Classic Magic", "Shows & Characters"].map(o => (
                      <SelectItem key={o} value={o} className="text-xs font-editorial">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[0.45rem] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Mid-Day</p>
                <Select value={midDayBreak} onValueChange={setMidDayBreak}>
                  <SelectTrigger className="h-6 border-border bg-background text-[0.5625rem] font-display text-foreground focus:ring-0 focus:ring-offset-0 px-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Power Through", "Hotel Break", "Pool Break"].map(o => (
                      <SelectItem key={o} value={o} className="text-xs font-editorial">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Overbooking warning */}
        <AnimatePresence>
          {showOverbookingWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.2)]">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="font-editorial text-[0.6875rem] text-destructive">
                  <strong>{rideCount} rides</strong> is ambitious for a <strong>{pacing.toLowerCase()}</strong> pace. Consider swapping some for shows or rest. Unless your goal is to conquer everything — in which case, godspeed. ✨
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GROUP MEMBERS — collapsible
         ═══════════════════════════════════════════════════════════════ */}
      <Collapsible open={groupOpen} onOpenChange={setGroupOpen}>
        <div className="border-y border-border/60 bg-card">
          <CollapsibleTrigger className="w-full px-6 lg:px-10 py-2.5 flex items-center justify-between hover:bg-[hsl(var(--warm))] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <p className="text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground font-medium">Adventure Group</p>
              <div className="flex -space-x-1">
                {partyMembers.filter(m => groupMembers.includes(m.memberId)).map(m => (
                  <div key={m.memberId} className="w-5 h-5 flex items-center justify-center text-[0.45rem] font-medium bg-foreground text-background border border-background">
                    {m.initial}
                  </div>
                ))}
              </div>
              <span className="text-[0.5rem] text-muted-foreground">{groupMembers.length} going</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${groupOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 lg:px-10 pb-3">
              <div className="flex flex-wrap gap-2">
                {partyMembers.map(member => {
                  const isAdded = groupMembers.includes(member.memberId);
                  return (
                    <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                      className={`flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 ${
                        isAdded
                          ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                          : "border-border hover:border-foreground/20 opacity-40"
                      }`}>
                      <div className={`w-5 h-5 flex items-center justify-center text-[0.5rem] font-medium ${
                        isAdded ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      }`}>{member.initial}</div>
                      <span className="font-display text-xs text-foreground">{member.name}</span>
                    </button>
                  );
                })}
                <button className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-border text-muted-foreground hover:border-foreground/30 transition-all duration-300">
                  <Plus className="w-3 h-3" />
                  <span className="text-[0.5rem] uppercase tracking-[0.1em]">Invite</span>
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
        <div className="border-r border-border/60 px-6 lg:px-8 py-8 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] bg-card">

          {/* Park hours — compact */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <p className="label-text">Your Day</p>
            <div className="gold-rule" />
            {parkSchedules.map(park => (
              <div key={park.parkId} className="flex items-center gap-1.5 text-[0.5625rem]">
                <span className="font-display text-foreground">{park.name}</span>
                <span className="text-muted-foreground">{park.hours}</span>
                {park.earlyEntry && (
                  <span className="px-1.5 py-0.5 text-[0.4rem] uppercase tracking-[0.08em] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.15)]">
                    Early {park.earlyEntry}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[44px] top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {itinerary.map((item, idx) => {
                const isBooked = item.id.startsWith("booked-");
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="relative group mb-1.5"
                  >
                    <div className="flex items-start gap-2">
                      {/* Time */}
                      <div className="w-[36px] shrink-0 text-right pt-2.5">
                        {item.startTime && (
                          <span className="font-display text-[0.5625rem] text-foreground leading-none">{item.startTime}</span>
                        )}
                      </div>

                      {/* Dot */}
                      <div className="relative shrink-0 pt-3.5 z-10">
                        <div className={`w-2 h-2 ${
                          item.isConfirmed ? "bg-[hsl(var(--gold))]" :
                          item.type === "rope-drop" ? "bg-foreground" :
                          ["break","pool","hotel","snack","walk"].includes(item.type) ? "bg-muted-foreground/30" :
                          "bg-foreground/50"
                        }`} />
                      </div>

                      {/* Card */}
                      <div className="flex-1 pb-0.5">
                        <div className={`border px-3.5 py-2.5 transition-all duration-300 shadow-soft ${
                          !isLocked && !isBooked ? "hover:shadow-soft-hover cursor-grab" : ""
                        } ${
                          item.isConfirmed ? "border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)]" :
                          isBooked ? "border-dashed border-[hsl(var(--gold)/0.2)] bg-[hsl(var(--gold)/0.02)]" :
                          ["break","pool","hotel","walk"].includes(item.type) ? "border-dashed border-border bg-[hsl(var(--warm))]" :
                          "border-border bg-background"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-display text-[0.8125rem] text-foreground truncate">{item.name}</span>
                              <span className={`px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.1em] shrink-0 ${
                                item.type === "ride" ? "bg-foreground text-background" :
                                item.type === "meal" ? "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold-dark))]" :
                                item.type === "show" ? "bg-accent text-accent-foreground" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {item.type === "rope-drop" ? "Arrive" : item.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[0.5rem] text-muted-foreground">{item.duration}m</span>
                              {!isLocked && !isBooked && (
                                <button onClick={() => removeFromItinerary(item.id)}
                                  className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* LL badge */}
                          {item.llType && item.llType !== "none" && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.1em] bg-accent text-accent-foreground border border-border">
                              {llLabels[item.llType]}
                            </span>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <p className="font-editorial text-[0.5625rem] text-muted-foreground mt-1 italic">{item.notes}</p>
                          )}
                        </div>

                        {/* Walk connector */}
                        {item.walkTime && idx < itinerary.length - 1 && (
                          <div className="flex items-center gap-1 pl-1.5 py-0.5">
                            <div className="h-px w-2 bg-border" />
                            <span className="text-[0.375rem] text-muted-foreground/40 uppercase tracking-[0.08em]">
                              {item.walkTime}m walk{item.waitTime ? ` · ${item.waitTime}m wait` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {itinerary.length === 0 && (
              <div className="py-16 text-center ml-12">
                <p className="font-editorial text-sm text-muted-foreground/40 italic">Your itinerary is empty.</p>
                <p className="font-editorial text-xs text-muted-foreground/30 mt-1">Add attractions from the research panel →</p>
              </div>
            )}
          </div>

          {/* Quick-add strip */}
          {!isLocked && (
            <div className="flex items-center gap-1.5 mt-5 ml-[52px]">
              {quickAdds.map(qa => (
                <button key={qa.type} onClick={() => addQuickItem(qa.type, qa.label, qa.dur)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-background border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300 shadow-soft">
                  <span className="text-[0.625rem]">{qa.emoji}</span>
                  <span className="text-[0.4375rem] uppercase tracking-[0.1em]">{qa.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Research Assistant ──────────────────────────────── */}
        <div className="px-6 lg:px-8 py-8 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] bg-[hsl(var(--warm))]">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="label-text mb-1">Research Assistant</p>
              <p className="font-editorial text-xs text-muted-foreground">
                Tap a card to reveal details · Top 5 picks float up ✦
              </p>
            </div>
          </div>

          {/* Park toggle + search row */}
          <div className="flex items-center gap-2 mb-3">
            {availableParks.map(parkId => (
              <button key={parkId} onClick={() => togglePark(parkId)}
                className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  selectedParks.includes(parkId)
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border bg-card hover:border-foreground/30"
                }`}>
                {parkId === "mk" ? "Magic Kingdom" : parkId === "epcot" ? "EPCOT" : parkId.toUpperCase()}
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
                className="w-36 border border-border bg-card pl-6 pr-2 py-1 font-editorial text-[0.625rem] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors shadow-soft"
              />
            </div>
          </div>

          {/* Category filter row */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {(["all", "ride", "show", "parade", "character", "seasonal"] as (AttractionType | "all")[]).map(cat => (
              <button key={cat} onClick={() => setResearchCategory(cat)}
                className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  researchCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border bg-card hover:border-foreground/30"
                }`}>
                {cat === "all" ? "All" : typeLabels[cat]}
              </button>
            ))}
          </div>

          {/* Attraction cards */}
          <div className="space-y-2.5">
            {filteredAttractions.map(attraction => {
              const isTopFive = topFiveIds.has(attraction.id);
              const voters = topFiveVoters[attraction.id];
              const alreadyAdded = itinerary.some(i => i.attractionId === attraction.id);
              const isExpanded = expandedCardId === attraction.id;

              return (
                <motion.div
                  key={attraction.id}
                  layout
                  className={`border transition-all duration-300 shadow-soft hover:shadow-soft-hover ${
                    attraction.isClosed ? "opacity-30 pointer-events-none" :
                    isTopFive ? "border-[hsl(var(--gold)/0.35)] bg-card" :
                    "border-border bg-card"
                  }`}
                >
                  {/* Header — always visible */}
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : attraction.id)}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isTopFive && <Star className="w-3.5 h-3.5 text-[hsl(var(--gold))] shrink-0 fill-[hsl(var(--gold))]" />}
                        <h4 className="font-display text-sm text-foreground truncate">{attraction.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-display text-[0.6875rem] text-foreground">{attraction.rating.toFixed(1)}</span>
                        <span className="text-[hsl(var(--gold))] text-xs">★</span>
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {/* Quick summary row */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[0.5rem]">{thrillEmoji[attraction.thrillLevel]}</span>
                      <span className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-foreground/5 text-muted-foreground">
                        {typeLabels[attraction.type]}
                      </span>
                      <span className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-foreground/5 text-muted-foreground">
                        {attraction.duration}
                      </span>
                      <span className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-foreground/5 text-muted-foreground">
                        {attraction.environment}
                      </span>
                      {attraction.heightRequirement && attraction.heightRequirement !== "ANY" && (
                        <span className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-foreground/5 text-muted-foreground">
                          ↕ {attraction.heightRequirement}
                        </span>
                      )}
                      {attraction.waitCategory && (
                        <span className={`px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] ${
                          attraction.waitCategory === "ill-required" || attraction.waitCategory === "hard-to-get"
                            ? "bg-[hsl(var(--destructive)/0.08)] text-destructive"
                            : "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]"
                        }`}>
                          {waitLabels[attraction.waitCategory]}
                        </span>
                      )}
                    </div>

                    {/* Top-5 voters */}
                    {isTopFive && voters && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-2.5 h-2.5 text-[hsl(var(--gold))]" />
                        <span className="font-editorial text-[0.5rem] text-[hsl(var(--gold-dark))] italic">
                          Top 5 for {voters.join(" & ")}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-border/50 pt-3">
                          {/* Description */}
                          <p className="font-editorial text-[0.75rem] text-foreground leading-relaxed mb-3">
                            {attraction.description}
                          </p>

                          {/* Notable insight */}
                          <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-[hsl(var(--warm))] border border-border/40">
                            <Info className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0 mt-0.5" />
                            <p className="font-editorial text-[0.6875rem] text-foreground italic">{attraction.notableInsight}</p>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[0.5625rem] text-muted-foreground">Duration: <strong className="text-foreground">{attraction.duration}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[0.5625rem] text-muted-foreground">Thrill: <strong className="text-foreground capitalize">{attraction.thrillLevel}</strong></span>
                            </div>
                            {attraction.heightRequirement && (
                              <div className="flex items-center gap-1.5">
                                <Ruler className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[0.5625rem] text-muted-foreground">Height: <strong className="text-foreground">{attraction.heightRequirement === "ANY" ? "Any height" : attraction.heightRequirement}</strong></span>
                              </div>
                            )}
                            {attraction.llType !== "none" && (
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[0.5625rem] text-muted-foreground">{llLabels[attraction.llType]}</span>
                              </div>
                            )}
                          </div>

                          {/* Rules */}
                          {attraction.rules.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">Available Options</p>
                              <div className="flex flex-wrap gap-1">
                                {attraction.rules.map(rule => (
                                  <span key={rule} className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-accent text-accent-foreground border border-border">
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Warnings */}
                          {attraction.warnings.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">Warnings</p>
                              <div className="flex flex-wrap gap-1">
                                {attraction.warnings.map(w => (
                                  <span key={w} className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-[hsl(var(--destructive)/0.06)] text-destructive border border-[hsl(var(--destructive)/0.15)]">
                                    ⚠ {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {attraction.tags && attraction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {attraction.tags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.15)]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Add button */}
                          {!attraction.isClosed && (
                            <button
                              onClick={(e) => { e.stopPropagation(); addToItinerary(attraction); }}
                              disabled={alreadyAdded || isLocked}
                              className={`w-full py-2 text-[0.5625rem] tracking-[0.15em] uppercase font-medium transition-all duration-300 ${
                                alreadyAdded
                                  ? "bg-muted text-muted-foreground border border-border cursor-default"
                                  : "bg-foreground text-background hover:opacity-90 shadow-soft"
                              }`}
                            >
                              {alreadyAdded ? "✓ Added to Itinerary" : "+ Add to Itinerary"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attraction.isClosed && (
                    <div className="px-4 pb-2">
                      <span className="text-[0.4375rem] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-muted text-muted-foreground">Temporarily Closed</span>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredAttractions.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-editorial text-sm text-muted-foreground/40 italic">
                  No attractions match your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryDesigner;
