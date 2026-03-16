import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Plus, X, Search, Star, Lock, Unlock, Sparkles, Clock, Ruler, Zap, Shield, Info, GripVertical, Users, Baby } from "lucide-react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
  crowdImpactLabels, attractionStatusLabels, getWalkBuffer, DURATION_DEFAULTS,
  type ParkAttraction, type AttractionType, type ItineraryItem, type RibbonItem, type ParkZone,
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
  { type: "break" as const, label: "Bathroom", emoji: "🚻", dur: 10 },
  { type: "pool" as const, label: "Pool Time", emoji: "🏊", dur: 90 },
  { type: "walk" as const, label: "Walk / Explore", emoji: "🚶", dur: 20 },
  { type: "break" as const, label: "Photo Stop", emoji: "📸", dur: 10 },
  { type: "snack" as const, label: "Water / Refill", emoji: "💧", dur: 5 },
  { type: "meal" as const, label: "Meal", emoji: "🍽", dur: 60 },
];

/* ─── Thrill icons ───────────────────────────────────────────────── */
const thrillEmoji: Record<string, string> = { mild: "🟢", moderate: "🟡", high: "🔴" };

/* ─── Default wait time estimates by category ────────────────────── */
const defaultWaitByCategory: Record<string, number> = {
  "walk-on": 5,
  "walk-on-am": 10,
  "fast-walk-on": 10,
  "hard-to-get": 45,
  "ill-required": 60,
};

/* ─── Time helpers ───────────────────────────────────────────────── */
function toMinutes(t: string) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function formatMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* ─── Ribbon Engine ──────────────────────────────────────────────── */

function getCheckinTime(item: ItineraryItem) {
  if (["show", "parade", "seasonal"].includes(item.type)) return 15;
  if (item.type === "character") return 10;
  return 0;
}

function getStrollerParkTime(item: ItineraryItem, hasStroller: boolean) {
  if (!hasStroller) return 0;
  if (["ride", "show", "character"].includes(item.type)) return 5;
  return 0;
}

function computeRibbon(items: ItineraryItem[], ropeDropMin: number, hasStroller: boolean): RibbonItem[] {
  const result: RibbonItem[] = [];
  let currentMin = ropeDropMin;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const prevZone = i > 0 ? items[i - 1].zone : undefined;
    const walkBuffer = i === 0 ? 0 : getWalkBuffer(prevZone as ParkZone, item.zone as ParkZone, hasStroller);
    const startMin = currentMin + walkBuffer;
    const checkinTime = getCheckinTime(item);
    const strollerTime = getStrollerParkTime(item, hasStroller);
    const totalBlockMin = strollerTime + checkinTime + (item.waitTime || 0) + item.duration;
    const endMin = startMin + totalBlockMin;

    result.push({ item, startMin, endMin, walkBuffer, checkinTime, strollerTime, totalBlockMin });
    currentMin = endMin;
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences, surveyResponses = [] }: DesignerProps) => {

  /* ── State ──────────────────────────────────────────────────────── */
  const [pacing, setPacing] = useState("Moderate");
  const [focus, setFocus] = useState("Classic Magic");

  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>(partyMembers.map(m => m.memberId));

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const [ropeDrop, setRopeDrop] = useState("7:30 AM");
  const [leavePark, setLeavePark] = useState("10:00 PM");

  /* ── Stroller toggle ───────────────────────────────────────────── */
  const activeMembers = useMemo(
    () => partyMembers.filter(m => groupMembers.includes(m.memberId)),
    [partyMembers, groupMembers]
  );

  const autoDetectStroller = useMemo(
    () => activeMembers.some(m => m.age !== undefined && m.age <= 7),
    [activeMembers]
  );

  const [hasStroller, setHasStroller] = useState(autoDetectStroller);

  // Seed itinerary with confirmed bookings
  const seededBookings = useMemo((): ItineraryItem[] => {
    const items: ItineraryItem[] = [];
    diningReservations.forEach(d => {
      items.push({
        id: `booked-${d.reservationId}`,
        name: d.restaurantName,
        type: "meal",
        duration: 60,
        isConfirmed: d.status === "confirmed",
        notes: d.status === "confirmed" ? `✓ CONFIRMED · ${d.confirmationNumber}` : "PENDING",
      });
    });
    bookedExperiences.forEach(e => {
      items.push({
        id: `booked-${e.experienceId}`,
        name: e.experienceName,
        type: "show",
        duration: parseInt(e.duration) || 45,
        isConfirmed: e.status === "confirmed",
        notes: e.status === "confirmed" ? `✓ CONFIRMED · ${e.confirmationNumber}` : "PENDING",
      });
    });
    return items;
  }, [diningReservations, bookedExperiences]);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(seededBookings);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Drop zone for research drag ───────────────────────────────── */
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  /* ── Computed ribbon ───────────────────────────────────────────── */
  const ropeDropMin = toMinutes(ropeDrop);
  const leaveMin = toMinutes(leavePark);

  const ribbon = useMemo(
    () => computeRibbon(itinerary, ropeDropMin, hasStroller),
    [itinerary, ropeDropMin, hasStroller]
  );

  /* ── Day summary ───────────────────────────────────────────────── */
  const daySummary = useMemo(() => {
    let totalRideTime = 0, totalWaitTime = 0, totalWalkTime = 0, totalBreakTime = 0;
    ribbon.forEach(({ item, walkBuffer }) => {
      if (["ride", "show", "character", "parade", "seasonal"].includes(item.type)) totalRideTime += item.duration;
      if (["break", "pool", "hotel", "walk", "snack", "meal"].includes(item.type)) totalBreakTime += item.duration;
      totalWaitTime += item.waitTime || 0;
      totalWalkTime += walkBuffer;
    });
    const dayLength = Math.max(0, leaveMin - ropeDropMin);
    const totalPlanned = ribbon.length > 0 ? (ribbon[ribbon.length - 1].endMin - ropeDropMin) : 0;
    const freeTime = Math.max(0, dayLength - totalPlanned);
    return { totalRideTime, totalWaitTime, totalWalkTime, totalBreakTime, totalPlanned, dayLength, freeTime };
  }, [ribbon, leaveMin, ropeDropMin]);

  /* ── Derived (survey data) ─────────────────────────────────────── */

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

  const attractionSatisfies = useMemo(() => {
    const map: Record<string, { name: string; memberId: string; reason: string }[]> = {};
    surveyResponses.forEach(r => {
      if (r.status !== "completed") return;
      r.topFiveMustDos.forEach(id => {
        if (!map[id]) map[id] = [];
        if (!map[id].some(m => m.memberId === r.memberId)) {
          map[id].push({ name: r.memberName, memberId: r.memberId, reason: "Top 5 Must-Do" });
        }
      });
      Object.entries(r.rankings).forEach(([id, ranking]) => {
        if (ranking === "must-do" || ranking === "want-to-do") {
          if (!map[id]) map[id] = [];
          if (!map[id].some(m => m.memberId === r.memberId)) {
            map[id].push({ name: r.memberName, memberId: r.memberId, reason: ranking === "must-do" ? "Must-Do" : "Want to Do" });
          }
        }
      });
    });
    return map;
  }, [surveyResponses]);

  const filteredAttractions = useMemo(() => {
    const all = selectedParks.flatMap(p => allParkAttractions[p] || []);
    return all
      .filter(a => {
        if (researchCategory !== "all" && a.type !== researchCategory) return false;
        if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const hasSurveyVotes = topFiveIds.has(a.id) || !!attractionSatisfies[a.id]?.length;
        if (hasSurveyVotes) return true;
        if (focus === "Thrill Seekers" && a.thrillLevel === "mild" && a.type === "ride") return false;
        if (focus === "Toddler Friendly") {
          if (a.thrillLevel === "high") return false;
          if (a.heightRequirement && a.heightRequirement !== "ANY") {
            const reqInches = parseInt(a.heightRequirement);
            if (reqInches >= 44) return false;
          }
        }
        if (focus === "Shows & Characters" && a.type === "ride" && a.rating < 4.5) return false;
        return true;
      })
      .sort((a, b) => {
        const aMustDo = topFiveIds.has(a.id) || attractionSatisfies[a.id]?.some(s => s.reason === "Must-Do" || s.reason === "Top 5 Must-Do") ? 1 : 0;
        const bMustDo = topFiveIds.has(b.id) || attractionSatisfies[b.id]?.some(s => s.reason === "Must-Do" || s.reason === "Top 5 Must-Do") ? 1 : 0;
        if (aMustDo !== bMustDo) return bMustDo - aMustDo;
        return b.rating - a.rating;
      });
  }, [selectedParks, researchCategory, searchQuery, topFiveIds, focus, attractionSatisfies]);

  /* ── Handlers ───────────────────────────────────────────────────── */

  const addToItinerary = useCallback((attraction: ParkAttraction) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
      waitTime: estWait,
      zone: attraction.zone,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
    }]);
  }, [isLocked]);

  const insertAtIndex = useCallback((attraction: ParkAttraction, idx: number) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    setItinerary(prev => {
      const next = [...prev];
      next.splice(idx, 0, {
        id: `it-${Date.now()}`,
        attractionId: attraction.id,
        name: attraction.name,
        type: attraction.type,
        duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
        waitTime: estWait,
        zone: attraction.zone,
        llType: attraction.llType,
        waitCategory: attraction.waitCategory,
      });
      return next;
    });
  }, [isLocked]);

  const addQuickItem = useCallback((type: ItineraryItem["type"], label: string, dur: number) => {
    if (isLocked) return;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      name: label,
      type,
      duration: dur,
    }]);
  }, [isLocked]);

  const removeFromItinerary = useCallback((id: string) => {
    if (isLocked) return;
    setItinerary(prev => prev.filter(i => i.id !== id));
  }, [isLocked]);

  const toggleGroupMember = (id: string) => {
    setGroupMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const togglePark = (parkId: string) => {
    setSelectedParks(prev =>
      prev.includes(parkId) ? (prev.length > 1 ? prev.filter(p => p !== parkId) : prev) : [...prev, parkId]
    );
  };

  /* ── Research panel drag → ribbon ──────────────────────────────── */
  const handleDropOnZone = useCallback((e: React.DragEvent, insertIdx: number) => {
    e.preventDefault();
    const attractionId = e.dataTransfer.getData("attractionId");
    if (!attractionId) return;
    const allAttractions = selectedParks.flatMap(p => allParkAttractions[p] || []);
    const attraction = allAttractions.find(a => a.id === attractionId);
    if (attraction) insertAtIndex(attraction, insertIdx);
    setDropTargetIdx(null);
  }, [selectedParks, insertAtIndex]);

  /* ── Zone label helper ─────────────────────────────────────────── */
  const zoneLabel = (z?: string) => {
    if (!z) return "";
    return z.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <section className="bg-[#F9F7F2]">

      {/* ═══════════════════════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pt-8 pb-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[hsl(var(--ink-light))] font-medium mb-2" style={{ letterSpacing: "0.2em" }}>Intended Itinerary</p>
            <h2 className="font-display text-3xl text-[hsl(var(--ink))] leading-[1.05]">{trip.tripName}</h2>
            <p className="font-sans text-sm text-[hsl(var(--ink-light))] mt-1" style={{ letterSpacing: "-0.02em" }}>
              {selectedParks.map(p => parkLabels[p] || p).join(" · ")} · {ropeDrop} → {leavePark}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 text-[0.5625rem] tracking-[0.12em] uppercase font-medium bg-[hsl(var(--ink))] text-[#F9F7F2] hover:opacity-90 transition-opacity duration-300" style={{ borderRadius: 0 }}>
              <Sparkles className="w-3 h-3" />
              Build for Me
            </button>
            <button onClick={() => setIsLocked(!isLocked)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[0.5625rem] tracking-[0.12em] uppercase font-medium border transition-all duration-300 ${
                isLocked
                  ? "bg-[hsl(var(--gold))] text-[#F9F7F2] border-[hsl(var(--gold))]"
                  : "text-[hsl(var(--ink-light))] border-[hsl(var(--border))] hover:border-[hsl(var(--ink))/0.3]"
              }`}
              style={{ borderRadius: 0 }}>
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLocked ? "Unlock Plan" : "Lock Plan"}
            </button>
          </div>
        </div>

        {/* 4 widget cards — Sovereign sharp corners + boutique shadows */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 flex items-center gap-3" style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
            <span className="text-2xl">⛅</span>
            <div>
              <p className="font-display text-base text-[hsl(var(--ink))]">74°F · Showers</p>
              <p className="text-[0.625rem] text-[hsl(var(--ink-light))] uppercase tracking-[0.1em]">Pack ponchos</p>
            </div>
          </div>
          <div className="bg-white p-4" style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)", borderLeft: "3px solid hsl(var(--gold))" }}>
            <p className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--gold-dark))] mb-1">On-Site Resort</p>
            <p className="font-display text-base text-[hsl(var(--ink))]">Polynesian Village</p>
            <p className="text-[0.625rem] text-[hsl(var(--ink-light))] mt-1">Early Entry · Extended Hours</p>
          </div>
          {/* Wait Time Widget */}
          <div className="bg-white p-4" style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)", borderLeft: "3px solid hsl(var(--destructive))" }}>
            <p className="text-[0.625rem] uppercase tracking-[0.12em] text-destructive/70 mb-1">Est. Wait Time Today</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl text-destructive font-bold">{daySummary.totalWaitTime}</span>
              <span className="text-xs text-destructive/60">min total</span>
            </div>
            <p className="text-[0.625rem] text-[hsl(var(--ink-light))] mt-1">
              {ribbon.length > 0
                ? `~${Math.round(daySummary.totalWaitTime / Math.max(1, ribbon.filter(r => (r.item.waitTime || 0) > 0).length))}m avg per ride`
                : "Add rides to estimate"}
            </p>
          </div>
          <div className="bg-white p-4" style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-[hsl(var(--ink-light))] mb-0.5">Pace</p>
                <Select value={pacing} onValueChange={setPacing}>
                  <SelectTrigger className="h-7 border-[hsl(var(--border))] bg-[#F9F7F2] text-xs font-display text-[hsl(var(--ink))] focus:ring-0 focus:ring-offset-0 px-2 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Intense", "Moderate", "Relaxed"].map(o => (
                      <SelectItem key={o} value={o} className="text-sm font-sans">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-[hsl(var(--ink-light))] mb-0.5">Focus</p>
                <Select value={focus} onValueChange={setFocus}>
                  <SelectTrigger className="h-7 border-[hsl(var(--border))] bg-[#F9F7F2] text-xs font-display text-[hsl(var(--ink))] focus:ring-0 focus:ring-offset-0 px-2 rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Thrill Seekers", "Toddler Friendly", "Classic Magic", "Shows & Characters"].map(o => (
                      <SelectItem key={o} value={o} className="text-sm font-sans">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Stroller toggle */}
            <div className="mt-2 flex items-center justify-between px-2 py-1.5 bg-[#F9F7F2]">
              <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] flex items-center gap-1">
                <Baby className="w-3.5 h-3.5" /> Stroller
              </span>
              <button
                onClick={() => setHasStroller(!hasStroller)}
                className={`relative w-8 h-4 transition-colors duration-200 ${hasStroller ? "bg-[hsl(var(--gold))]" : "bg-[hsl(var(--border))]"}`}
                style={{ borderRadius: 0 }}
              >
                <span className={`absolute top-0.5 w-3 h-3 bg-white transition-transform duration-200 ${hasStroller ? "translate-x-4" : "translate-x-0.5"}`} style={{ borderRadius: 0 }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GROUP MEMBERS — collapsible
         ═══════════════════════════════════════════════════════════════ */}
      <Collapsible open={groupOpen} onOpenChange={setGroupOpen}>
        <div className="border-y border-[hsl(var(--border))] bg-white" style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
          <CollapsibleTrigger className="w-full px-6 lg:px-10 py-3.5 flex items-center justify-between hover:bg-[#F9F7F2] transition-colors duration-200">
            <div className="flex items-center gap-4">
              <p className="text-[0.5625rem] uppercase tracking-[0.15em] text-[hsl(var(--ink))] font-medium">Adventure Group</p>
              <div className="flex -space-x-1.5">
                {partyMembers.filter(m => groupMembers.includes(m.memberId)).map(m => (
                  <div key={m.memberId} className="w-7 h-7 flex items-center justify-center text-[0.5625rem] font-medium bg-[hsl(var(--ink))] text-[#F9F7F2] border-2 border-white" style={{ borderRadius: 0 }}>
                    {m.initial}
                  </div>
                ))}
              </div>
              <span className="font-sans text-xs text-[hsl(var(--ink-light))]" style={{ letterSpacing: "-0.02em" }}>{groupMembers.length} of {partyMembers.length} going today</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[hsl(var(--ink-light))] transition-transform duration-300 ${groupOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 lg:px-10 pb-4 pt-1 border-t border-[hsl(var(--border))]/50">
              <div className="flex flex-wrap gap-2.5">
                {partyMembers.map(member => {
                  const isAdded = groupMembers.includes(member.memberId);
                  return (
                    <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 border transition-all duration-300 ${
                        isAdded
                          ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 hover:border-[hsl(var(--ink))]/20 opacity-50"
                      }`}
                      style={{ borderRadius: 0 }}>
                      <div className={`w-7 h-7 flex items-center justify-center text-[0.5625rem] font-medium ${
                        isAdded ? "bg-[hsl(var(--ink))] text-[#F9F7F2]" : "bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))]"
                      }`} style={{ borderRadius: 0 }}>{member.initial}</div>
                      <div className="text-left">
                        <span className="font-display text-sm text-[hsl(var(--ink))] block leading-tight">{member.name}</span>
                        <span className="text-[0.5rem] text-[hsl(var(--ink-light))]">{member.role}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* ═══════════════════════════════════════════════════════════════
          TWO-COLUMN: RIBBON + RESEARCH
         ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">

        {/* ─── LEFT: The Ribbon ────────────────────────────────────── */}
        <div className="px-6 lg:px-10 py-8 border-r border-[hsl(var(--border))]">

          {/* Day Summary */}
          {ribbon.length > 0 && (
            <div className="mb-6 p-5 bg-white" style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}>
              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--ink-light))] mb-3">
                Day Summary · {ropeDrop} → {leavePark} · {Math.floor(daySummary.dayLength / 60)}h {daySummary.dayLength % 60}m
              </p>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <span className="font-display text-base text-[hsl(var(--ink))]">{daySummary.totalRideTime}m</span>
                  <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] block uppercase tracking-[0.1em]">🎢 Rides & Shows</span>
                </div>
                <div>
                  <span className="font-display text-base text-destructive">{daySummary.totalWaitTime}m</span>
                  <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] block uppercase tracking-[0.1em]">⏱ In Line</span>
                </div>
                <div>
                  <span className="font-display text-base text-[hsl(var(--ink))]">{daySummary.totalWalkTime}m</span>
                  <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] block uppercase tracking-[0.1em]">🚶 Walking{hasStroller ? " (×1.35)" : ""}</span>
                </div>
                <div>
                  <span className="font-display text-base text-[hsl(var(--ink))]">{daySummary.totalBreakTime}m</span>
                  <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] block uppercase tracking-[0.1em]">⏸ Breaks & Meals</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[0.625rem] text-[hsl(var(--ink-light))]" style={{ letterSpacing: "-0.02em" }}>
                  {Math.round((daySummary.totalPlanned / daySummary.dayLength) * 100)}% of day planned
                </span>
                {daySummary.freeTime > 0 && (
                  <span className="text-[0.625rem] text-[hsl(var(--gold-dark))] font-medium">
                    ⏳ {daySummary.freeTime}m unplanned — room for {Math.floor(daySummary.freeTime / 25)} more rides
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Drop zone at top of ribbon */}
          <DropZone
            idx={0}
            isActive={dropTargetIdx === 0}
            onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(0); }}
            onDragLeave={() => setDropTargetIdx(null)}
            onDrop={(e) => handleDropOnZone(e, 0)}
          />

          {/* Rope Drop / Park Arrival */}
          <div className="flex items-center gap-3 mb-4 p-4 bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.2)]" style={{ borderRadius: 0 }}>
            <div className="text-center shrink-0 w-16">
              <span className="font-display text-lg text-[hsl(var(--gold-dark))] font-bold block leading-none">{ropeDrop}</span>
              <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-[hsl(var(--gold-dark))]/70">Gates Open</span>
            </div>
            <div className="border-l border-[hsl(var(--gold)/0.3)] pl-3 flex-1">
              <p className="font-display text-sm text-[hsl(var(--ink))]">🏰 Rope Drop · {selectedParks.map(p => parkLabels[p] || p).join(" & ")}</p>
              <p className="text-xs text-[hsl(var(--ink-light))] mt-1">
                🚌 <strong>On-site guests:</strong> Leave resort by <strong>{formatMin(ropeDropMin - 60)}</strong> (Disney transport)
              </p>
              <p className="text-xs text-[hsl(var(--ink-light))] mt-0.5">
                🚗 <strong>Off-site guests:</strong> Arrive at park by <strong>{formatMin(ropeDropMin - 30)}</strong> (30 min before opening)
              </p>
            </div>
          </div>

          {/* The Ribbon — Reorder list */}
          <Reorder.Group
            axis="y"
            values={itinerary}
            onReorder={isLocked ? () => {} : setItinerary}
            className="space-y-0"
          >
            {ribbon.map((ri, idx) => {
              const { item, startMin, endMin, walkBuffer, checkinTime, strollerTime, totalBlockMin } = ri;
              const isBooked = item.id.startsWith("booked-");
              const isMeal = item.type === "meal" || item.type === "snack";
              const isExperience = ["show", "character", "parade", "seasonal"].includes(item.type);
              const isBreak = ["break", "pool", "hotel", "walk"].includes(item.type);
              const wait = item.waitTime || 0;

              return (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  dragListener={!isLocked && !isBooked}
                  className="list-none"
                >
                  {/* Walk buffer connector */}
                  {walkBuffer > 0 && (
                    <motion.div
                      layout
                      className="flex items-center gap-2 py-1.5 pl-6 ml-4 border-l-2 border-dashed border-[hsl(var(--gold)/0.3)]"
                    >
                      <span className="text-[0.625rem] text-[hsl(var(--ink-light))] font-sans flex items-center gap-1" style={{ letterSpacing: "-0.02em" }}>
                        🚶 {walkBuffer}m walk
                        {item.zone && <span className="text-[hsl(var(--ink-light))]/50">→ {zoneLabel(item.zone)}</span>}
                        {hasStroller && <span className="text-[hsl(var(--gold-dark))]">· 🍼 ×1.35</span>}
                      </span>
                    </motion.div>
                  )}

                  {/* Item card */}
                  <motion.div
                    layout
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`group flex border-l-[3px] border transition-all duration-200 ${
                      isMeal
                        ? "bg-white border-[hsl(var(--gold)/0.3)] border-l-[hsl(var(--gold))]"
                        : isExperience
                        ? "bg-white border-[hsl(280,30%,55%,0.2)] border-l-[hsl(280,30%,55%)]"
                        : isBreak
                        ? "bg-[#F9F7F2] border-dashed border-[hsl(var(--border))] border-l-[hsl(var(--ink-light))]/30"
                        : item.isConfirmed
                        ? "bg-white border-[hsl(var(--gold)/0.3)] border-l-[hsl(var(--gold))]"
                        : "bg-white border-[hsl(var(--border))] border-l-[hsl(var(--ink))]/40"
                    } ${!isLocked && !isBooked ? "hover:shadow-[0_10px_30px_rgba(26,26,27,0.08)] cursor-grab active:cursor-grabbing" : ""}`}
                    style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                  >
                    {/* Time column */}
                    <div className="shrink-0 w-16 flex flex-col items-center justify-center border-r border-[hsl(var(--border))]/30 py-3 px-2">
                      <span className="font-display text-sm text-[hsl(var(--ink))] font-bold leading-none">{formatMin(startMin)}</span>
                      <span className="text-[0.5rem] text-[hsl(var(--ink-light))]/60 mt-0.5">→ {formatMin(endMin)}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 py-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      {!isLocked && !isBooked && (
                        <GripVertical className="w-3 h-3 text-[hsl(var(--ink-light))]/30 shrink-0 cursor-grab" />
                      )}
                      <span className="font-display text-base text-[hsl(var(--ink))] truncate flex-1 font-bold">{item.name}</span>
                      <span className={`px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em] shrink-0 ${
                        item.type === "ride" ? "bg-[hsl(var(--ink))] text-[#F9F7F2]" :
                        isMeal ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.1)] text-[hsl(280,30%,45%)]" :
                        "bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))]"
                      }`} style={{ borderRadius: 0 }}>
                        {isMeal ? "🍽 Dining" : isExperience ? "✨ Experience" : item.type}
                      </span>
                      <div className="flex-1" />
                      {wait > 0 && (
                        <div className="shrink-0 px-4 py-2.5 bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] flex items-center gap-2 ml-auto" style={{ borderRadius: 0 }}>
                          <span className="font-display text-lg text-destructive font-bold leading-none">{wait}m</span>
                          <span className="font-display text-sm text-destructive/80">est. wait</span>
                        </div>
                      )}
                      {!isLocked && !isBooked && (
                        <button onClick={() => removeFromItinerary(item.id)}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-[hsl(var(--ink-light))] hover:text-destructive transition-all duration-200">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Computed time span */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[0.625rem] text-[hsl(var(--ink-light))]" style={{ letterSpacing: "-0.02em" }}>
                      <Clock className="w-2.5 h-2.5" />
                      <span className="font-medium text-[hsl(var(--ink))]">{formatMin(startMin)}</span>
                      <span>→</span>
                      <span className="font-medium text-[hsl(var(--ink))]">{formatMin(endMin)}</span>
                      <span className="text-[hsl(var(--ink))]/30 mx-0.5">·</span>
                      <span className="font-display text-[hsl(var(--ink))]">{totalBlockMin}m block</span>
                    </div>

                    {/* Time breakdown chips */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {strollerTime > 0 && (
                        <span className="flex items-center gap-0.5 px-2 py-1 bg-[hsl(var(--gold)/0.08)] text-[0.5625rem] text-[hsl(var(--gold-dark))] font-medium" style={{ borderRadius: 0 }}>
                          🍼 Park {strollerTime}m
                        </span>
                      )}
                      {checkinTime > 0 && (
                        <span className="flex items-center gap-0.5 px-2 py-1 bg-[hsl(280,30%,55%,0.08)] text-[0.5625rem] text-[hsl(280,30%,45%)] font-medium" style={{ borderRadius: 0 }}>
                          📋 Check-in {checkinTime}m
                        </span>
                      )}
                      {wait > 0 && (
                        <span className="flex items-center gap-0.5 px-2 py-1 bg-[hsl(var(--destructive)/0.06)] text-[0.5625rem] text-destructive font-medium" style={{ borderRadius: 0 }}>
                          ⏱ Wait {wait}m
                        </span>
                      )}
                      <span className={`flex items-center gap-0.5 px-2 py-1 text-[0.5625rem] font-medium ${
                        isMeal ? "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.08)] text-[hsl(280,30%,45%)]" :
                        isBreak ? "bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))]" :
                        "bg-[hsl(var(--ink))]/5 text-[hsl(var(--ink))]"
                      }`} style={{ borderRadius: 0 }}>
                        {isBreak ? "⏸" : isMeal ? "🍽" : isExperience ? "🎭" : "🎢"} {item.duration}m
                      </span>
                      {item.llType && item.llType !== "none" && (
                        <span className="px-2 py-1 text-[0.5rem] uppercase tracking-[0.08em] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--border))]" style={{ borderRadius: 0 }}>
                          {llLabels[item.llType]}
                        </span>
                      )}
                    </div>

                    {/* Visual time bar */}
                    <div className="mt-1.5 flex h-1.5 overflow-hidden bg-[#F9F7F2]">
                      {strollerTime > 0 && <div className="bg-[hsl(var(--gold)/0.3)]" style={{ width: `${(strollerTime / totalBlockMin) * 100}%` }} />}
                      {checkinTime > 0 && <div className="bg-[hsl(280,30%,55%,0.3)]" style={{ width: `${(checkinTime / totalBlockMin) * 100}%` }} />}
                      {wait > 0 && <div className="bg-destructive/25" style={{ width: `${(wait / totalBlockMin) * 100}%` }} />}
                      <div className={`${
                        isMeal ? "bg-[hsl(var(--gold)/0.4)]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.4)]" :
                        isBreak ? "bg-[hsl(var(--ink-light))]/20" :
                        "bg-[hsl(var(--ink))]/20"
                      }`} style={{ width: `${(item.duration / totalBlockMin) * 100}%` }} />
                    </div>

                    {item.notes && (
                      <p className="font-sans text-xs text-[hsl(var(--ink-light))] mt-2 italic" style={{ letterSpacing: "-0.02em" }}>{item.notes}</p>
                    )}
                    </div>{/* end content */}
                  </motion.div>

                  {/* Gap analysis between items */}
                  {(() => {
                    const nextRi = ribbon[idx + 1];
                    const gapMin = nextRi ? nextRi.startMin - endMin - (nextRi.walkBuffer || 0) : (leaveMin - endMin);
                    const isLastItem = idx === ribbon.length - 1;
                    const showGap = gapMin >= 15 && !isLastItem;
                    const currentZone = item.zone;
                    const nextZone = nextRi?.item?.zone;
                    const sameZone = currentZone && nextZone && currentZone === nextZone;
                    
                    return showGap ? (
                      <div className="my-1 mx-2 border-2 border-dashed border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.04)] p-3 flex items-center justify-between"
                        style={{ borderRadius: 0 }}
                        onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(idx + 1); }}
                        onDragLeave={() => setDropTargetIdx(null)}
                        onDrop={(e) => handleDropOnZone(e, idx + 1)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⏳</span>
                          <div>
                            <span className="font-display text-sm text-[hsl(var(--gold-dark))] font-bold">{gapMin}m open</span>
                            <span className="text-[0.625rem] text-[hsl(var(--ink-light))] ml-2">
                              ~{Math.floor(gapMin / 25)} rides could fit
                            </span>
                          </div>
                        </div>
                        {currentZone && (
                          <span className="text-[0.5625rem] uppercase tracking-[0.1em] px-2 py-1 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))]" style={{ borderRadius: 0 }}>
                            📍 Near {zoneLabel(currentZone)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <DropZone
                        idx={idx + 1}
                        isActive={dropTargetIdx === idx + 1}
                        onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(idx + 1); }}
                        onDragLeave={() => setDropTargetIdx(null)}
                        onDrop={(e) => handleDropOnZone(e, idx + 1)}
                      />
                    );
                  })()}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* End of day marker */}
          {ribbon.length > 0 && (
            <div className="flex items-center gap-2 mt-4 ml-4">
              <div className="flex-1 border-t-2 border-[hsl(var(--ink))]" />
              <span className="px-3 py-1.5 bg-[hsl(var(--ink))] text-[#F9F7F2] text-xs uppercase tracking-[0.12em] font-medium" style={{ borderRadius: 0 }}>
                🚗 End of Day · {ribbon.length > 0 ? formatMin(ribbon[ribbon.length - 1].endMin) : leavePark}
              </span>
            </div>
          )}

          {/* Quick-add strip */}
          {!isLocked && (
            <div className="mt-6">
              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--ink-light))] mb-2">Quick Add</p>
              <div className="flex items-center gap-2 flex-wrap">
                {quickAdds.map((qa, i) => (
                  <button key={`${qa.label}-${i}`} onClick={() => addQuickItem(qa.type, qa.label, qa.dur)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-dashed border-[hsl(var(--border))] text-[hsl(var(--ink-light))] hover:border-[hsl(var(--ink))]/30 hover:text-[hsl(var(--ink))] transition-all duration-300"
                    style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.03)" }}>
                    <span className="text-sm">{qa.emoji}</span>
                    <span className="text-[0.625rem] uppercase tracking-[0.1em]">{qa.label}</span>
                    <span className="text-[0.5625rem] text-[hsl(var(--ink-light))]/50">{qa.dur}m</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {ribbon.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-xl text-[hsl(var(--ink-light))]/30 mb-2">Your itinerary is empty</p>
              <p className="font-sans text-sm text-[hsl(var(--ink-light))]/20" style={{ letterSpacing: "-0.02em" }}>
                Drag attractions from the Research Assistant or use Quick Add to start building your day.
              </p>
            </div>
          )}

          {/* Color legend */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {[
              { color: "bg-[hsl(var(--ink))]/20", label: "Ride/Show" },
              { color: "bg-destructive/30", label: "Wait" },
              { color: "bg-[hsl(var(--gold)/0.4)]", label: "Walk / Stroller" },
              { color: "bg-[hsl(280,30%,55%,0.3)]", label: "Check-in" },
              { color: "bg-[hsl(var(--muted))]", label: "Break/Meal" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 ${l.color}`} style={{ borderRadius: 0 }} />
                <span className="text-xs text-[hsl(var(--ink-light))]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Research Assistant ──────────────────────────────── */}
        <div className="px-6 lg:px-8 py-8 lg:overflow-y-auto lg:sticky lg:top-0 lg:max-h-screen bg-[#F9F7F2]">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[hsl(var(--ink-light))] font-medium mb-1">Research Assistant</p>
              <p className="font-sans text-xs text-[hsl(var(--ink-light))]" style={{ letterSpacing: "-0.02em" }}>
                Drag cards into the ribbon to schedule · Top 5 picks float up ✦
              </p>
            </div>
          </div>

          {/* Park toggle + search */}
          <div className="flex items-center gap-2 mb-3">
            {availableParks.map(parkId => (
              <button key={parkId} onClick={() => togglePark(parkId)}
                className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  selectedParks.includes(parkId)
                    ? "bg-[hsl(var(--ink))] text-[#F9F7F2] border-[hsl(var(--ink))]"
                    : "text-[hsl(var(--ink-light))] border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--ink))]/30"
                }`}
                style={{ borderRadius: 0 }}>
                {parkLabels[parkId] || parkId.toUpperCase()}
              </button>
            ))}
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--ink-light))]/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-36 border border-[hsl(var(--border))] bg-white pl-6 pr-2 py-1 font-sans text-[0.625rem] text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-light))]/30 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                style={{ borderRadius: 0, letterSpacing: "-0.02em" }}
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {(["all", "ride", "show", "parade", "character", "seasonal"] as (AttractionType | "all")[]).map(cat => (
              <button key={cat} onClick={() => setResearchCategory(cat)}
                className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.1em] border transition-all duration-300 ${
                  researchCategory === cat
                    ? "bg-[hsl(var(--ink))] text-[#F9F7F2] border-[hsl(var(--ink))]"
                    : "text-[hsl(var(--ink-light))] border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--ink))]/30"
                }`}
                style={{ borderRadius: 0 }}>
                {cat === "all" ? "All" : typeLabels[cat]}
              </button>
            ))}
          </div>

          {/* Attraction cards */}
          <div className="space-y-2.5">
            {filteredAttractions.filter(a => !itinerary.some(i => i.attractionId === a.id)).map(attraction => {
              const isTopFive = topFiveIds.has(attraction.id);
              const voters = topFiveVoters[attraction.id];
              const satisfies = attractionSatisfies[attraction.id];
              const isExpanded = expandedCardId === attraction.id;
              const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
              const rideDur = parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20;
              const totalBlockEst = estWait + rideDur;

              return (
                <motion.div
                  key={attraction.id}
                  layout
                  draggable={!attraction.isClosed && !isLocked}
                  onDragStart={(e: any) => {
                    if (isLocked) return;
                    e.dataTransfer.setData("attractionId", attraction.id);
                  }}
                  className={`border transition-all duration-300 ${
                    attraction.isClosed ? "opacity-30 pointer-events-none" :
                    isTopFive ? "border-[hsl(var(--gold)/0.35)] bg-white" :
                    "border-[hsl(var(--border))] bg-white"
                  } ${!attraction.isClosed && !isLocked ? "cursor-grab" : ""}`}
                  style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedCardId(isExpanded ? null : attraction.id)}
                    className="w-full text-left px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {isTopFive && <Star className="w-3.5 h-3.5 text-[hsl(var(--gold))] shrink-0 fill-[hsl(var(--gold))]" />}
                        <h4 className="font-display text-base text-[hsl(var(--ink))] truncate">{attraction.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-display text-sm text-[hsl(var(--ink))]">{attraction.rating.toFixed(1)}</span>
                        <span className="text-[hsl(var(--gold))] text-xs">★</span>
                        <ChevronDown className={`w-3 h-3 text-[hsl(var(--ink-light))] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {/* Quick summary — wait time + LL class prominent */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-sm">{thrillEmoji[attraction.thrillLevel]}</span>
                      <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--ink))]/5 text-[hsl(var(--ink-light))]" style={{ borderRadius: 0 }}>
                        {typeLabels[attraction.type]}
                      </span>
                      {/* Prominent wait time */}
                      <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--destructive)/0.08)] text-destructive font-bold" style={{ borderRadius: 0 }}>
                        ⏱ {estWait}m wait
                      </span>
                      {/* Prominent LL class */}
                      {attraction.llType && attraction.llType !== "none" && (
                        <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--border))] font-medium" style={{ borderRadius: 0 }}>
                          🎟 {llLabels[attraction.llType]}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--ink))]/8 text-[hsl(var(--ink))] font-medium" style={{ borderRadius: 0 }}>
                        📅 {totalBlockEst}m block
                      </span>
                    </div>

                    {/* Time breakdown bar */}
                    <div className="w-full mt-2 flex items-center gap-2">
                      <div className="flex-1 flex h-2.5 overflow-hidden bg-[#F9F7F2]">
                        <div className="bg-destructive/25" style={{ width: `${(estWait / totalBlockEst) * 100}%` }} />
                        <div className="bg-[hsl(var(--ink))]/10" style={{ width: `${(rideDur / totalBlockEst) * 100}%` }} />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[0.5625rem] text-destructive font-medium">⏱ {estWait}m</span>
                        <span className="text-[hsl(var(--ink-light))]/30 text-[0.5625rem]">·</span>
                        <span className="text-[0.5625rem] text-[hsl(var(--ink))] font-medium">🎢 {rideDur}m</span>
                      </div>
                    </div>

                    {/* Zone badge */}
                    {attraction.zone && (
                      <div className="mt-1.5">
                        <span className="text-[0.5625rem] text-[hsl(var(--ink-light))]/60 uppercase tracking-[0.08em]">📍 {zoneLabel(attraction.zone)}</span>
                      </div>
                    )}

                    {/* Status badge */}
                    {attraction.attractionStatus && attraction.attractionStatus.status !== "operating" && (
                      <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 ${
                        attraction.attractionStatus.status === "new" ? "bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)]" :
                        attraction.attractionStatus.status === "recently-opened" ? "bg-[hsl(var(--gold)/0.08)] border border-[hsl(var(--gold)/0.2)]" :
                        "bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
                      }`} style={{ borderRadius: 0 }}>
                        <span className="text-sm">
                          {attraction.attractionStatus.status === "new" ? "🆕" : attraction.attractionStatus.status === "recently-opened" ? "✨" : "🔧"}
                        </span>
                        <span className="font-display text-xs text-[hsl(var(--ink))]">{attraction.attractionStatus.label}</span>
                        {attraction.attractionStatus.crowdImpact && attraction.attractionStatus.crowdImpact !== "none" && (
                          <span className={`px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.08em] ${
                            attraction.attractionStatus.crowdImpact === "extreme" ? "bg-[hsl(var(--destructive)/0.1)] text-destructive" :
                            "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))]"
                          }`} style={{ borderRadius: 0 }}>
                            {crowdImpactLabels[attraction.attractionStatus.crowdImpact].label}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Who this satisfies */}
                    {satisfies && satisfies.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-[hsl(var(--gold)/0.04)] border border-[hsl(var(--gold)/0.15)]" style={{ borderRadius: 0 }}>
                        <Users className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0" />
                        <div className="flex items-center gap-1 flex-wrap">
                          {satisfies.map(s => (
                            <span key={s.memberId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[0.625rem] text-[hsl(var(--gold-dark))]" style={{ borderRadius: 0 }}>
                              {s.name} · <span className="italic">{s.reason}</span>
                            </span>
                          ))}
                        </div>
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
                        <div className="px-4 pb-4 border-t border-[hsl(var(--border))]/50 pt-3">
                          <p className="font-sans text-sm text-[hsl(var(--ink))] leading-relaxed mb-3" style={{ letterSpacing: "-0.02em" }}>
                            {attraction.description}
                          </p>

                          <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-[#F9F7F2] border border-[hsl(var(--border))]/40" style={{ borderRadius: 0 }}>
                            <Info className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0 mt-0.5" />
                            <p className="font-sans text-xs text-[hsl(var(--ink))] italic" style={{ letterSpacing: "-0.02em" }}>{attraction.notableInsight}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[hsl(var(--ink-light))]" />
                              <span className="text-xs text-[hsl(var(--ink-light))]">Duration: <strong className="text-[hsl(var(--ink))]">{attraction.duration}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[hsl(var(--ink-light))]" />
                              <span className="text-xs text-[hsl(var(--ink-light))]">Thrill: <strong className="text-[hsl(var(--ink))] capitalize">{attraction.thrillLevel}</strong></span>
                            </div>
                            {attraction.heightRequirement && (
                              <div className="flex items-center gap-1.5">
                                <Ruler className="w-3.5 h-3.5 text-[hsl(var(--ink-light))]" />
                                <span className="text-xs text-[hsl(var(--ink-light))]">Height: <strong className="text-[hsl(var(--ink))]">{attraction.heightRequirement === "ANY" ? "Any" : attraction.heightRequirement}</strong></span>
                              </div>
                            )}
                            {attraction.llType !== "none" && (
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-[hsl(var(--ink-light))]" />
                                <span className="text-xs text-[hsl(var(--ink-light))]">{llLabels[attraction.llType]}</span>
                              </div>
                            )}
                          </div>

                          {attraction.rules.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--ink-light))] mb-1.5">Options</p>
                              <div className="flex flex-wrap gap-1.5">
                                {attraction.rules.map(rule => (
                                  <span key={rule} className="px-2 py-1 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--border))]" style={{ borderRadius: 0 }}>
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {attraction.warnings.length > 0 && (
                            <div className="mb-3">
                              <p className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--ink-light))] mb-1.5">Warnings</p>
                              <div className="flex flex-wrap gap-1.5">
                                {attraction.warnings.map(w => (
                                  <span key={w} className="px-2 py-1 text-[0.5625rem] uppercase tracking-[0.08em] bg-[hsl(var(--destructive)/0.06)] text-destructive border border-[hsl(var(--destructive)/0.15)]" style={{ borderRadius: 0 }}>
                                    ⚠ {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add button */}
                          {!attraction.isClosed && (
                            <button
                              onClick={(e) => { e.stopPropagation(); addToItinerary(attraction); }}
                              disabled={isLocked}
                              className="w-full py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 bg-[hsl(var(--ink))] text-[#F9F7F2] hover:opacity-90"
                              style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                            >
                              + Add to Itinerary
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {attraction.isClosed && (
                    <div className="px-4 pb-2">
                      <span className="text-[0.625rem] uppercase tracking-[0.1em] px-2 py-1 bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))]" style={{ borderRadius: 0 }}>Temporarily Closed</span>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredAttractions.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-sans text-sm text-[hsl(var(--ink-light))]/40 italic" style={{ letterSpacing: "-0.02em" }}>
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

/* ── Drop Zone Component ─────────────────────────────────────────── */
function DropZone({ idx, isActive, onDragOver, onDragLeave, onDrop }: {
  idx: number;
  isActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`transition-all duration-200 ${
        isActive
          ? "h-12 border-2 border-dashed border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] flex items-center justify-center"
          : "h-1"
      }`}
      style={{ borderRadius: 0 }}
    >
      {isActive && (
        <span className="text-[0.5rem] text-[hsl(var(--gold-dark))] font-medium uppercase tracking-[0.12em] animate-pulse">
          Drop here to insert
        </span>
      )}
    </div>
  );
}

export default ItineraryDesigner;
