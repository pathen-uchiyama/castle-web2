import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useMemo, useCallback, useRef } from "react";
import { ChevronDown, Plus, X, Search, Star, Lock, Unlock, Sparkles, Clock, Ruler, Zap, Shield, Info, GripVertical, Users, Baby, CalendarClock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

/* ─── Early access wait times (30 min before open — much lower waits) ── */
const earlyAccessWaitByCategory: Record<string, number> = {
  "walk-on": 0,
  "walk-on-am": 5,
  "fast-walk-on": 5,
  "hard-to-get": 10,
  "ill-required": 15,
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
  const use24h = localStorage.getItem("pref-use24h") === "true";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (use24h) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
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

/** Check if an item is a fixed-time anchor (reservations, confirmed experiences, scheduled shows) */
function isFixedAnchor(item: ItineraryItem): boolean {
  if (item.isConfirmed && item.scheduledStartMin != null) return true;
  if (["meal", "dining"].includes(item.type) && item.scheduledStartMin != null) return true;
  if (["show", "parade"].includes(item.type) && item.scheduledStartMin != null) return true;
  return false;
}

function computeRibbon(items: ItineraryItem[], ropeDropMin: number, hasStroller: boolean): RibbonItem[] {
  const result: RibbonItem[] = [];
  let currentMin = ropeDropMin;

  // First pass: sort items so fixed anchors are in time order while flexible items 
  // stay in their relative user-defined order between anchors
  const sortedItems = [...items];
  // Stable sort: fixed anchors go to their scheduled position, flex items stay in insertion order
  sortedItems.sort((a, b) => {
    const aFixed = isFixedAnchor(a);
    const bFixed = isFixedAnchor(b);
    if (aFixed && bFixed) return (a.scheduledStartMin || 0) - (b.scheduledStartMin || 0);
    if (aFixed && !bFixed) {
      // If the flex item was before this anchor in original order, keep it before
      const aOrig = items.indexOf(a);
      const bOrig = items.indexOf(b);
      return aOrig - bOrig;
    }
    if (!aFixed && bFixed) {
      const aOrig = items.indexOf(a);
      const bOrig = items.indexOf(b);
      return aOrig - bOrig;
    }
    // Both flexible — keep original insertion order
    return items.indexOf(a) - items.indexOf(b);
  });

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const prevZone = i > 0 ? sortedItems[i - 1].zone : undefined;
    const walkBuffer = i === 0 ? 0 : getWalkBuffer(prevZone as ParkZone, item.zone as ParkZone, hasStroller);
    const checkinTime = getCheckinTime(item);
    const strollerTime = getStrollerParkTime(item, hasStroller);

    let startMin = currentMin + walkBuffer;

    if (isFixedAnchor(item) && item.scheduledStartMin != null) {
      // Fixed anchor: ALWAYS starts at its scheduled time — never pushed later
      const arrivalNeeded = item.scheduledStartMin - checkinTime;
      startMin = arrivalNeeded;
    } else if (item.scheduledStartMin != null) {
      // Non-confirmed scheduled item — try to honor time but don't go backwards
      const arrivalNeeded = item.scheduledStartMin - checkinTime;
      if (arrivalNeeded > currentMin) {
        startMin = arrivalNeeded;
      }
    }

    // Check if this flexible item would overflow into the next fixed anchor
    const totalBlockMin = strollerTime + checkinTime + (item.waitTime || 0) + item.duration;
    const endMin = startMin + totalBlockMin;

    result.push({ item, startMin, endMin, walkBuffer, checkinTime, strollerTime, totalBlockMin });
    currentMin = endMin;
  }
  return result;
}

/** Check if adding an item would conflict with fixed anchors or exceed park hours */
function wouldConflictWithAnchor(
  items: ItineraryItem[], 
  newItem: ItineraryItem, 
  ropeDropMin: number, 
  hasStroller: boolean,
  leaveMin: number
): { conflicts: boolean; anchorName?: string; anchorTime?: string } {
  const testItems = [...items, newItem];
  const ribbon = computeRibbon(testItems, ropeDropMin, hasStroller);
  
  // Check each fixed anchor — did it get pushed from its scheduled time?
  for (let i = 0; i < ribbon.length; i++) {
    const ri = ribbon[i];
    if (isFixedAnchor(ri.item) && ri.item.scheduledStartMin != null) {
      const expectedArrival = ri.item.scheduledStartMin - ri.checkinTime;
      if (ri.startMin > expectedArrival + 2) {
        return { 
          conflicts: true, 
          anchorName: ri.item.name, 
          anchorTime: formatMin(ri.item.scheduledStartMin) 
        };
      }
    }
  }
  
  // Check if any flexible item overflows into a fixed anchor
  for (let i = 0; i < ribbon.length - 1; i++) {
    const current = ribbon[i];
    const next = ribbon[i + 1];
    if (isFixedAnchor(next.item) && next.item.scheduledStartMin != null) {
      const nextArrival = next.item.scheduledStartMin - next.checkinTime;
      if (current.endMin > nextArrival) {
        return {
          conflicts: true,
          anchorName: next.item.name,
          anchorTime: formatMin(next.item.scheduledStartMin)
        };
      }
    }
  }
  
  // Check if the last item extends past park hours
  if (ribbon.length > 0) {
    const lastEnd = ribbon[ribbon.length - 1].endMin;
    if (lastEnd > leaveMin) {
      return {
        conflicts: true,
        anchorName: "Park Close",
        anchorTime: formatMin(leaveMin)
      };
    }
  }
  
  return { conflicts: false };
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const ItineraryDesigner = ({ trip, partyMembers, diningReservations, bookedExperiences, surveyResponses = [] }: DesignerProps) => {

  /* ── State ──────────────────────────────────────────────────────── */
  const [pacing, setPacing] = useState("Moderate");
  const [focus, setFocus] = useState("Classic Magic");
  const [minimizeWalking, setMinimizeWalking] = useState(false);

  const availableParks = Object.keys(allParkAttractions);
  const [selectedParks, setSelectedParks] = useState<string[]>(["mk"]);
  const [researchCategory, setResearchCategory] = useState<AttractionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>(partyMembers.map(m => m.memberId));

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const [ropeDrop, setRopeDrop] = useState("7:30 AM");
  const [leavePark, setLeavePark] = useState("10:00 PM");
  const [hasEarlyEntry, setHasEarlyEntry] = useState(true);
  const [hasExtendedHours, setHasExtendedHours] = useState(false); // Deluxe resort guests get +2 hrs

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
      // All dining reservations are pinned to their booked time
      const diningTimeMin = toMinutes(d.time);
      const scheduledStartMin = diningTimeMin >= 0 ? diningTimeMin : undefined;
      let linkedNote = "";
      let zone: string | undefined;
      if (d.linkedShowId) {
        const allAttr = Object.values(allParkAttractions).flat();
        const linkedShow = allAttr.find(a => a.id === d.linkedShowId);
        if (linkedShow) {
          const showTimes = linkedShow.scheduledTimes?.join(" / ") || "";
          linkedNote = ` · 🎆 Linked to ${linkedShow.name}${showTimes ? ` @ ${showTimes}` : ""}`;
          zone = linkedShow.zone;
        }
      }
      const mealLabel = d.mealType === "breakfast" ? "🌅 Breakfast" : d.mealType === "lunch" ? "☀️ Lunch" : d.mealType === "snack" ? "🍿 Snack" : "🌙 Dinner";
      items.push({
        id: `booked-${d.reservationId}`,
        name: d.restaurantName,
        type: "meal",
        duration: d.mealType === "breakfast" ? 50 : d.mealType === "snack" ? 30 : 60,
        isConfirmed: d.status === "confirmed",
        notes: `${mealLabel} · ${d.time}` + (d.status === "confirmed" ? ` · ✓ ${d.confirmationNumber}` : " · PENDING") + linkedNote,
        scheduledStartMin,
        zone: zone as ParkZone | undefined,
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
    // Sort seeded items by scheduledStartMin so linked dining lands in the right order
    return items.sort((a, b) => {
      if (a.scheduledStartMin !== undefined && b.scheduledStartMin !== undefined) return a.scheduledStartMin - b.scheduledStartMin;
      if (a.scheduledStartMin !== undefined) return -1;
      if (b.scheduledStartMin !== undefined) return 1;
      return 0;
    });
  }, [diningReservations, bookedExperiences]);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(seededBookings);
  const [isLocked, setIsLocked] = useState(false);

  /* ── Drop zone for research drag ───────────────────────────────── */
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  /* ── Scheduled show placement modal ────────────────────────────── */
  const [scheduledPlacement, setScheduledPlacement] = useState<{
    attraction: ParkAttraction;
    times: string[];
  } | null>(null);

  /* ── Computed ribbon ───────────────────────────────────────────── */
  const baseRopeDropMin = toMinutes(ropeDrop);
  const ropeDropMin = hasEarlyEntry ? baseRopeDropMin - 30 : baseRopeDropMin;
  const parkCloseMin = toMinutes(leavePark);
  const extendedCloseMin = parkCloseMin + 120;
  const leaveMin = hasExtendedHours ? extendedCloseMin : parkCloseMin;

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
        // Zone-aware: prioritize attractions in the same zone as last itinerary item
        if (minimizeWalking && itinerary.length > 0) {
          const lastZone = itinerary[itinerary.length - 1].zone;
          if (lastZone) {
            const aInZone = a.zone === lastZone ? 1 : 0;
            const bInZone = b.zone === lastZone ? 1 : 0;
            if (aInZone !== bInZone) return bInZone - aInZone;
          }
        }
        return b.rating - a.rating;
      });
  }, [selectedParks, researchCategory, searchQuery, topFiveIds, focus, attractionSatisfies, minimizeWalking, itinerary]);

  /* ── Handlers ───────────────────────────────────────────────────── */

  /** Insert an item at the correct ribbon position based on a target start time (in minutes) */
  const insertAtTimePosition = useCallback((attraction: ParkAttraction, targetMin: number) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
      waitTime: estWait,
      zone: attraction.zone,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
      notes: `🕐 Scheduled: ${formatMin(targetMin)}`,
      scheduledStartMin: targetMin,
    };
    setItinerary(prev => {
      // Find the right insertion index based on the ribbon timeline
      const currentRibbon = computeRibbon(prev, ropeDropMin, hasStroller);
      let insertIdx = currentRibbon.length; // default: end
      for (let i = 0; i < currentRibbon.length; i++) {
        if (currentRibbon[i].startMin >= targetMin) {
          insertIdx = i;
          break;
        }
        // If the target falls between this item's end and the next item's start
        if (i < currentRibbon.length - 1 && currentRibbon[i].endMin <= targetMin) {
          insertIdx = i + 1;
        }
      }
      const next = [...prev];
      next.splice(insertIdx, 0, newItem);
      return next;
    });
  }, [isLocked, ropeDropMin, hasStroller]);

  const addToItinerary = useCallback((attraction: ParkAttraction) => {
    if (isLocked) return;
    // If this attraction has scheduled times, show the placement modal
    if (attraction.scheduledTimes && attraction.scheduledTimes.length > 0) {
      setScheduledPlacement({ attraction, times: attraction.scheduledTimes });
      return;
    }
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
      waitTime: estWait,
      zone: attraction.zone,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
    };
    // Check for conflict with fixed anchors
    const conflict = wouldConflictWithAnchor(itinerary, newItem, ropeDropMin, hasStroller, leaveMin);
    if (conflict.conflicts) {
      toast({
        title: "⚠️ Reservation Conflict",
        description: `Adding ${attraction.name} would push into your ${conflict.anchorName} reservation at ${conflict.anchorTime}. Remove a ride or pick a shorter one to fit.`,
        variant: "destructive",
      });
      return;
    }
    setItinerary(prev => [...prev, newItem]);
  }, [isLocked, itinerary, ropeDropMin, hasStroller]);

  /** Add a ride specifically into the early access window — inserts at the right position with reduced waits */
  const addToEarlyAccess = useCallback((attraction: ParkAttraction) => {
    if (isLocked) return;
    const earlyWait = attraction.waitCategory ? (earlyAccessWaitByCategory[attraction.waitCategory] || 5) : 5;
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
      waitTime: earlyWait,
      zone: attraction.zone,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
      notes: "✨ Early Access — reduced wait",
    };
    // Check for conflict with fixed anchors
    const conflict = wouldConflictWithAnchor(itinerary, newItem, ropeDropMin, hasStroller, leaveMin);
    if (conflict.conflicts) {
      toast({
        title: "⚠️ Reservation Conflict",
        description: `Adding ${attraction.name} would push into your ${conflict.anchorName} reservation at ${conflict.anchorTime}. Remove a ride or pick a shorter one.`,
        variant: "destructive",
      });
      return;
    }
    setItinerary(prev => {
      // Find the insertion point: after any existing early-window items but before regular items
      const currentRibbon = computeRibbon(prev, ropeDropMin, hasStroller);
      let insertIdx = 0;
      for (let i = 0; i < currentRibbon.length; i++) {
        if (currentRibbon[i].endMin <= baseRopeDropMin) {
          insertIdx = i + 1;
        } else {
          break;
        }
      }
      const next = [...prev];
      next.splice(insertIdx, 0, newItem);
      return next;
    });
  }, [isLocked, itinerary, ropeDropMin, baseRopeDropMin, hasStroller]);

  const insertAtIndex = useCallback((attraction: ParkAttraction, idx: number) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    const newItem: ItineraryItem = {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      duration: parseInt(attraction.duration) || DURATION_DEFAULTS[attraction.type] || 20,
      waitTime: estWait,
      zone: attraction.zone,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
    };
    const conflict = wouldConflictWithAnchor(itinerary, newItem, ropeDropMin, hasStroller);
    if (conflict.conflicts) {
      toast({
        title: "⚠️ Reservation Conflict",
        description: `Adding ${attraction.name} would push into your ${conflict.anchorName} reservation at ${conflict.anchorTime}. Remove a ride or pick a shorter one.`,
        variant: "destructive",
      });
      return;
    }
    setItinerary(prev => {
      const next = [...prev];
      next.splice(idx, 0, newItem);
      return next;
    });
  }, [isLocked, itinerary, ropeDropMin, hasStroller]);

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
    if (!attraction) return;

    // Timed shows/parades MUST go through the showtime picker
    if (attraction.scheduledTimes && attraction.scheduledTimes.length > 0) {
      // Check if any showtime is still available (not already in itinerary)
      const availableTimes = attraction.scheduledTimes.filter(t => {
        const tMin = toMinutes(t);
        return !itinerary.some(i => i.attractionId === attraction.id && i.scheduledStartMin === tMin);
      });

      if (availableTimes.length === 0) {
        toast({
          title: "All showtimes filled",
          description: `Every available time for ${attraction.name} is already in your plan.`,
          variant: "destructive",
        });
      } else {
        setScheduledPlacement({ attraction, times: availableTimes });
        toast({
          title: "Timed event — pick a showtime",
          description: `${attraction.name} only runs at published times. Choose one from the picker.`,
        });
      }
      setDropTargetIdx(null);
      return;
    }

    insertAtIndex(attraction, insertIdx);
    setDropTargetIdx(null);
  }, [selectedParks, insertAtIndex, itinerary]);

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
            {/* Minimize Walking toggle */}
            <div className="mt-1 flex items-center justify-between px-2 py-1.5 bg-[#F9F7F2]">
              <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] flex items-center gap-1">
                🚶 Min. Walking
              </span>
              <button
                onClick={() => setMinimizeWalking(!minimizeWalking)}
                className={`relative w-8 h-4 transition-colors duration-200 ${minimizeWalking ? "bg-[hsl(var(--gold))]" : "bg-[hsl(var(--border))]"}`}
                style={{ borderRadius: 0 }}
              >
                <span className={`absolute top-0.5 w-3 h-3 bg-white transition-transform duration-200 ${minimizeWalking ? "translate-x-4" : "translate-x-0.5"}`} style={{ borderRadius: 0 }} />
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
              <span className="font-display text-lg text-[hsl(var(--gold-dark))] font-bold block leading-none">{formatMin(ropeDropMin)}</span>
              <span className="text-[0.5625rem] uppercase tracking-[0.1em] text-[hsl(var(--gold-dark))]/70">
                {hasEarlyEntry ? "Early Entry" : "Gates Open"}
              </span>
            </div>
            <div className="border-l border-[hsl(var(--gold)/0.3)] pl-3 flex-1">
              <p className="font-display text-sm text-[hsl(var(--ink))]">
                🏰 {hasEarlyEntry ? "Early Theme Park Entry" : "Rope Drop"} · {selectedParks.map(p => parkLabels[p] || p).join(" & ")}
              </p>
              {hasEarlyEntry && (
                <p className="text-xs text-[hsl(var(--gold-dark))] mt-1 font-medium">
                  ✨ 30 min head start — ride EARLY MORNING ACCESS attractions with shorter waits
                </p>
              )}
              <p className="text-xs text-[hsl(var(--ink-light))] mt-1">
                🚌 <strong>Leave resort by {formatMin(ropeDropMin - 60)}</strong> (Disney transport)
              </p>
              {!hasEarlyEntry && (
                <p className="text-xs text-[hsl(var(--ink-light))] mt-0.5">
                  🚗 <strong>Off-site guests:</strong> Arrive at park by <strong>{formatMin(baseRopeDropMin - 30)}</strong>
                </p>
              )}
              {/* Early Entry toggle */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[hsl(var(--gold)/0.15)]">
                <button
                  onClick={() => setHasEarlyEntry(!hasEarlyEntry)}
                  className={`w-9 h-[18px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300 ${
                    hasEarlyEntry ? "bg-[hsl(var(--gold))]" : "bg-muted"
                  }`}
                >
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full bg-background shadow"
                    animate={{ x: hasEarlyEntry ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className="text-[0.625rem] uppercase tracking-[0.1em] text-[hsl(var(--ink-light))]">
                  Early Theme Park Entry (Resort Guest)
                </span>
              </div>
              {/* Extended Evening Hours toggle */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setHasExtendedHours(!hasExtendedHours)}
                  className={`w-9 h-[18px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300 ${
                    hasExtendedHours ? "bg-[hsl(280,30%,55%)]" : "bg-muted"
                  }`}
                >
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full bg-background shadow"
                    animate={{ x: hasExtendedHours ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className="text-[0.625rem] uppercase tracking-[0.1em] text-[hsl(var(--ink-light))]">
                  Extended Evening Hours (Deluxe Resort)
                </span>
              </div>
            </div>
          </div>

          {/* Early Access Window — shows eligible rides when early entry is on and no rides are in the window yet */}
          {hasEarlyEntry && (() => {
            const earlyWindowEnd = baseRopeDropMin;
            const earlyWindowStart = ropeDropMin;
            const earlyWindowTotal = 30; // minutes
            const earlyRidesInWindow = ribbon.filter(ri => ri.startMin < earlyWindowEnd);
            const earlyTimeUsed = earlyRidesInWindow.length > 0
              ? Math.min(earlyWindowTotal, earlyRidesInWindow[earlyRidesInWindow.length - 1].endMin - earlyWindowStart)
              : 0;
            const earlyTimeLeft = Math.max(0, earlyWindowTotal - earlyTimeUsed);
            
            // Get the zone of the last ride in the early window for proximity sorting
            const lastEarlyZone = earlyRidesInWindow.length > 0 
              ? earlyRidesInWindow[earlyRidesInWindow.length - 1].item.zone 
              : undefined;
            
            const earlyAccessAttractions = selectedParks
              .flatMap(p => allParkAttractions[p] || [])
              .filter(a => a.rules.includes("EARLY MORNING ACCESS") && !a.isClosed && !itinerary.some(i => i.attractionId === a.id))
              .map(a => {
                const earlyWait = a.waitCategory ? (earlyAccessWaitByCategory[a.waitCategory] || 5) : 5;
                const rideDur = parseInt(a.duration) || DURATION_DEFAULTS[a.type] || 20;
                const totalTime = earlyWait + rideDur;
                const walkToRide = lastEarlyZone ? getWalkBuffer(lastEarlyZone as ParkZone, a.zone as ParkZone, hasStroller) : 0;
                const totalWithWalk = totalTime + (earlyRidesInWindow.length > 0 ? walkToRide : 0);
                const fitsWithWalk = totalWithWalk <= earlyTimeLeft;
                const isSameZone = lastEarlyZone ? a.zone === lastEarlyZone : false;
                const isNearby = walkToRide <= 6;
                // Survey priority
                const isTopFive = topFiveIds.has(a.id);
                const voters = topFiveVoters[a.id];
                const satisfies = attractionSatisfies[a.id];
                const isSurveyPick = isTopFive || (satisfies && satisfies.length > 0);
                const surveyWeight = (isTopFive ? 2 : 0) + (satisfies ? satisfies.length : 0);
                return { attraction: a, earlyWait, rideDur, totalTime, fitsWithWalk, walkToRide, totalWithWalk, isSameZone, isNearby, isTopFive, voters, satisfies, isSurveyPick, surveyWeight };
              })
              .sort((a, b) => {
                // 1. Fits first
                if (a.fitsWithWalk !== b.fitsWithWalk) return a.fitsWithWalk ? -1 : 1;
                // 2. Survey picks always above non-survey
                if (a.isSurveyPick !== b.isSurveyPick) return a.isSurveyPick ? -1 : 1;
                if (a.surveyWeight !== b.surveyWeight) return b.surveyWeight - a.surveyWeight;
                // 3. Zone proximity (after first ride)
                if (earlyRidesInWindow.length > 0) {
                  if (a.isSameZone !== b.isSameZone) return a.isSameZone ? -1 : 1;
                  if (a.isNearby !== b.isNearby) return a.isNearby ? -1 : 1;
                  return a.totalWithWalk - b.totalWithWalk;
                }
                return b.attraction.rating - a.attraction.rating;
              });
            
            if (earlyAccessAttractions.length > 0 || earlyRidesInWindow.length > 0) {
              const fittingRides = earlyAccessAttractions.filter(a => a.fitsWithWalk);
              const nonFittingRides = earlyAccessAttractions.filter(a => !a.fitsWithWalk);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-4 bg-[hsl(var(--gold)/0.08)] border-2 border-[hsl(var(--gold)/0.3)]"
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">✨</span>
                    <span className="font-display text-sm text-[hsl(var(--gold-dark))] font-bold uppercase tracking-[0.08em]">
                      Early Access Window
                    </span>
                    <span className="text-[0.5625rem] text-[hsl(var(--gold-dark))]/60 ml-auto">
                      {formatMin(earlyWindowStart)} – {formatMin(earlyWindowEnd)}
                    </span>
                  </div>
                  
                  {/* Time budget bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-[hsl(var(--gold)/0.12)] overflow-hidden" style={{ borderRadius: 0 }}>
                      <div 
                        className="h-full bg-[hsl(var(--gold))] transition-all duration-500" 
                        style={{ width: `${(earlyTimeUsed / earlyWindowTotal) * 100}%` }} 
                      />
                    </div>
                    <span className={`text-[0.625rem] font-display font-bold ${earlyTimeLeft <= 5 ? "text-destructive" : "text-[hsl(var(--gold-dark))]"}`}>
                      {earlyTimeLeft}m left
                    </span>
                  </div>

                  {earlyTimeLeft <= 0 ? (
                    <p className="text-[0.625rem] text-[hsl(var(--gold-dark))] font-medium">
                      ✓ Early access window is fully planned
                    </p>
                  ) : (
                    <>
                      <p className="text-[0.625rem] text-[hsl(var(--ink-light))] mb-2">
                        {earlyRidesInWindow.length === 0 
                          ? "Pick 1-2 headliners — you won't have time for all of them"
                          : fittingRides.length > 0
                          ? `${fittingRides.length} ride${fittingRides.length > 1 ? "s" : ""} can fill your remaining ${earlyTimeLeft}m`
                          : "No more rides fit in the remaining time"
                        }
                      </p>
                      
                      {/* Zone context when rides are already placed */}
                      {earlyRidesInWindow.length > 0 && lastEarlyZone && fittingRides.some(r => r.isSameZone || r.isNearby) && (
                        <p className="text-[0.5625rem] uppercase tracking-[0.1em] text-[hsl(var(--gold-dark))] font-medium flex items-center gap-1.5 mb-2">
                          📍 Sorted by proximity to {zoneLabel(lastEarlyZone)}
                        </p>
                      )}
                      
                      {/* Rides that fit */}
                      {fittingRides.length > 0 && (
                        <div className="space-y-1.5 mb-2">
                          {fittingRides.map(({ attraction: a, earlyWait, rideDur, totalTime, walkToRide, totalWithWalk, isSameZone, isNearby, isTopFive, voters, satisfies, isSurveyPick }) => (
                            <button
                              key={a.id}
                              onClick={() => addToEarlyAccess(a)}
                              disabled={isLocked}
                              className={`w-full flex flex-col gap-1.5 px-3 py-2.5 bg-white border text-left transition-all duration-200 hover:border-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.04)] ${
                                isSurveyPick ? "border-[hsl(var(--gold)/0.5)] ring-1 ring-[hsl(var(--gold)/0.15)]" : "border-[hsl(var(--gold)/0.3)]"
                              }`}
                              style={{ borderRadius: 0, boxShadow: isSurveyPick ? "0 4px 16px rgba(26,26,27,0.08)" : "0 4px 12px rgba(26,26,27,0.04)" }}
                            >
                              {/* Top row: name + badges + time chips */}
                              <div className="flex items-center gap-2 w-full">
                                <Plus className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    {isTopFive && <Star className="w-3 h-3 text-[hsl(var(--gold))] shrink-0 fill-[hsl(var(--gold))]" />}
                                    <span className="text-[0.6875rem] font-display font-medium text-[hsl(var(--ink))] truncate">{a.name}</span>
                                    {isSameZone && earlyRidesInWindow.length > 0 && (
                                      <span className="px-1.5 py-0.5 text-[0.5rem] bg-[hsl(140,40%,45%,0.1)] text-[hsl(140,40%,35%)] font-semibold uppercase tracking-[0.08em] shrink-0" style={{ borderRadius: 0 }}>
                                        Same zone ✓
                                      </span>
                                    )}
                                    {!isSameZone && isNearby && earlyRidesInWindow.length > 0 && (
                                      <span className="px-1.5 py-0.5 text-[0.5rem] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] font-medium uppercase tracking-[0.08em] shrink-0" style={{ borderRadius: 0 }}>
                                        {walkToRide}m walk
                                      </span>
                                    )}
                                    {!isSameZone && !isNearby && earlyRidesInWindow.length > 0 && (
                                      <span className="px-1.5 py-0.5 text-[0.5rem] bg-[hsl(var(--ink))]/5 text-[hsl(var(--ink-light))] font-medium uppercase tracking-[0.08em] shrink-0" style={{ borderRadius: 0 }}>
                                        🚶 {walkToRide}m away
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="px-1.5 py-0.5 text-[0.5625rem] bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] font-medium" style={{ borderRadius: 0 }}>
                                    ⏱ {earlyWait}m
                                  </span>
                                  <span className="px-1.5 py-0.5 text-[0.5625rem] bg-[hsl(var(--ink))]/5 text-[hsl(var(--ink))] font-medium" style={{ borderRadius: 0 }}>
                                    🎢 {rideDur}m
                                  </span>
                                  <span className="px-1.5 py-0.5 text-[0.5625rem] font-bold bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]" style={{ borderRadius: 0 }}>
                                    {earlyRidesInWindow.length > 0 ? `${totalWithWalk}m` : `${totalTime}m`}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Walk breakdown for non-same-zone */}
                              {earlyRidesInWindow.length > 0 && walkToRide > 0 && !isSameZone && (
                                <span className="text-[0.5rem] text-[hsl(var(--ink-light))]/60 ml-5">
                                  {walkToRide}m walk + {earlyWait}m wait + {rideDur}m ride
                                </span>
                              )}
                              
                              {/* Survey attribution row */}
                              {isSurveyPick && (
                                <div className="flex items-center gap-1.5 ml-5 flex-wrap">
                                  <Users className="w-2.5 h-2.5 text-[hsl(var(--gold-dark))] shrink-0" />
                                  {satisfies && satisfies.map(s => (
                                    <span key={s.memberId} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[0.5rem] text-[hsl(var(--gold-dark))]" style={{ borderRadius: 0 }}>
                                      {s.name} · <span className="italic">{s.reason}</span>
                                    </span>
                                  ))}
                                  {isTopFive && voters && !satisfies?.length && voters.map(v => (
                                    <span key={v} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[0.5rem] text-[hsl(var(--gold-dark))]" style={{ borderRadius: 0 }}>
                                      {v} · <span className="italic">Top 5</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Rides that don't fit — dimmed */}
                      {nonFittingRides.length > 0 && (
                        <div className={`${fittingRides.length > 0 ? "mt-2 pt-2 border-t border-[hsl(var(--gold)/0.15)]" : ""}`}>
                          <p className="text-[0.5rem] uppercase tracking-[0.1em] text-[hsl(var(--ink-light))]/50 mb-1.5">
                            {fittingRides.length > 0 ? `Won't fit in remaining ${earlyTimeLeft}m` : `These need more than ${earlyTimeLeft}m`}
                          </p>
                          <div className="space-y-1">
                            {nonFittingRides.slice(0, 4).map(({ attraction: a, totalWithWalk }) => (
                              <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 opacity-35">
                                <span className="text-[0.625rem] text-[hsl(var(--ink-light))] truncate flex-1">{a.name}</span>
                                <span className="text-[0.5rem] text-destructive">{totalWithWalk}m needed</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              );
            }
            return null;
          })()}

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
                      {isFixedAnchor(item) && (
                        <span className="px-2 py-0.5 text-[0.5rem] uppercase tracking-[0.1em] bg-[hsl(var(--ink))]/8 text-[hsl(var(--ink-light))] flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <Lock className="w-2.5 h-2.5" /> Fixed
                        </span>
                      )}
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
                      <span className={`flex items-center gap-0.5 px-2 py-1 text-[0.5625rem] font-medium ${
                        isMeal ? "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.08)] text-[hsl(280,30%,45%)]" :
                        isBreak ? "bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))]" :
                        "bg-[hsl(var(--ink))]/5 text-[hsl(var(--ink))]"
                      }`} style={{ borderRadius: 0 }}>
                        {isBreak ? "⏸" : isMeal ? "🍽" : isExperience ? "🎭" : "🎢"} {item.duration}m ride
                      </span>
                      {item.llType && item.llType !== "none" && (
                        <span className="px-2 py-1 text-[0.5rem] uppercase tracking-[0.08em] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--border))]" style={{ borderRadius: 0 }}>
                          {llLabels[item.llType]}
                        </span>
                      )}
                    </div>

                    {/* Separator line */}
                    <div className="mt-2 h-px bg-[hsl(var(--border))]" />

                    {item.notes && (
                      <p className="font-sans text-xs text-[hsl(var(--ink-light))] mt-2 italic" style={{ letterSpacing: "-0.02em" }}>{item.notes}</p>
                    )}
                    </div>{/* end content */}
                  </motion.div>

                  {/* Gap analysis between items */}
                  {(() => {
                    const nextRi = ribbon[idx + 1];
                    if (!nextRi) return (
                      <DropZone
                        idx={idx + 1}
                        isActive={dropTargetIdx === idx + 1}
                        onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(idx + 1); }}
                        onDragLeave={() => setDropTargetIdx(null)}
                        onDrop={(e) => handleDropOnZone(e, idx + 1)}
                      />
                    );
                    
                    const gapMin = nextRi.startMin - endMin;
                    const nextWalk = nextRi.walkBuffer;
                    // Free time = gap minus the walk to the next item
                    // (walk is already shown by the next item's walk connector, so don't double-count)
                    const actualFreeTime = Math.max(0, gapMin - nextWalk);
                    
                    // No meaningful gap — just show a drop zone
                    if (actualFreeTime <= 2) {
                      return (
                        <DropZone
                          idx={idx + 1}
                          isActive={dropTargetIdx === idx + 1}
                          onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(idx + 1); }}
                          onDragLeave={() => setDropTargetIdx(null)}
                          onDrop={(e) => handleDropOnZone(e, idx + 1)}
                        />
                      );
                    }
                    
                    const currentZone = item.zone;
                    const isShortGap = actualFreeTime < 15;
                    const gapHeight = isShortGap 
                      ? Math.max(48, Math.min(actualFreeTime * 2, 100))
                      : Math.max(56, Math.min(actualFreeTime * 1.8, 200));
                    const ridesFit = Math.floor(actualFreeTime / 25);
                    
                    // Party context for short-gap suggestions
                    const hasToddlers = activeMembers.some(m => m.age !== undefined && m.age <= 4);
                    const hasYoungKids = activeMembers.some(m => m.age !== undefined && m.age <= 7);
                    const partySize = activeMembers.length;
                    
                    const suggestions: string[] = [];
                    if (isShortGap) {
                      if (hasToddlers) suggestions.push("🚻 Bathroom break (toddlers)");
                      else if (hasYoungKids && partySize >= 3) suggestions.push("🚻 Bathroom break");
                      else if (partySize >= 5) suggestions.push("🚻 Bathroom stop (large group)");
                      if (actualFreeTime >= 5) suggestions.push("📸 Photo op / PhotoPass");
                      if (actualFreeTime >= 5) suggestions.push("💧 Water / hydration refill");
                      if (actualFreeTime >= 10 && hasYoungKids) suggestions.push("🍦 Quick snack stop");
                      if (actualFreeTime >= 10) suggestions.push("🗺 Explore nearby area");
                    }
                    
                    return (
                      <div
                        className={`my-2 border-2 border-dashed flex flex-col items-center justify-center transition-colors duration-200 ${
                          dropTargetIdx === idx + 1
                            ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.15)]"
                            : isShortGap
                            ? "border-[hsl(var(--ink-light)/0.25)] bg-[hsl(var(--ink)/0.02)]"
                            : "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                        }`}
                        style={{ borderRadius: "0.75rem", minHeight: `${gapHeight}px` }}
                        onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(idx + 1); }}
                        onDragLeave={() => setDropTargetIdx(null)}
                        onDrop={(e) => handleDropOnZone(e, idx + 1)}
                      >
                        {isShortGap ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">⏱</span>
                              <span className="font-display text-sm text-[hsl(var(--ink))] font-medium">
                                {actualFreeTime}m free
                              </span>
                            </div>
                            <p className="text-[0.625rem] text-[hsl(var(--ink-light))]">
                              {formatMin(endMin + nextWalk)} → {formatMin(nextRi.startMin)}
                            </p>
                            {suggestions.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-2 justify-center px-3">
                                {suggestions.slice(0, 3).map((s, si) => (
                                  <span key={si} className="px-2 py-1 text-[0.5625rem] bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))] border border-[hsl(var(--border))]/50" style={{ borderRadius: 0 }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[0.5625rem] text-[hsl(var(--ink-light))]/60 mt-1 italic">
                                Too short for a ride — enjoy the moment
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">⏳</span>
                              <span className="font-display text-base text-[hsl(var(--gold-dark))] font-bold">
                                {actualFreeTime}m open
                              </span>
                            </div>
                            <p className="text-[0.6875rem] text-[hsl(var(--ink-light))] font-medium">
                              {formatMin(endMin + nextWalk)} → {formatMin(nextRi.startMin)}
                            </p>
                            {ridesFit > 0 && (
                              <p className="text-[0.625rem] text-[hsl(var(--ink-light))] mt-0.5">
                                ~{ridesFit} ride{ridesFit > 1 ? "s" : ""} could fit
                              </p>
                            )}
                            {currentZone && (
                              <span className="mt-2 text-[0.5625rem] uppercase tracking-[0.1em] px-2.5 py-1 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold-dark))]" style={{ borderRadius: "0.5rem" }}>
                                📍 Near {zoneLabel(currentZone)} · Drag here to fill
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {/* Remaining time until park close + planned departure */}
          {ribbon.length > 0 && (() => {
            const lastEnd = ribbon[ribbon.length - 1].endMin;
            const lastZone = ribbon[ribbon.length - 1].item.zone;
            const remainingMin = Math.max(0, leaveMin - lastEnd);
            const remainingHeight = remainingMin >= 10 ? Math.max(60, Math.min(remainingMin * 1.2, 220)) : 0;

            return (
              <>
                {/* Gap until park close */}
                {remainingMin >= 5 && remainingMin < 15 ? (
                  /* Short remaining gap — suggest quick activities */
                  <div className="my-2 border-2 border-dashed flex flex-col items-center justify-center border-[hsl(var(--ink-light)/0.25)] bg-[hsl(var(--ink)/0.02)]"
                    style={{ borderRadius: "0.75rem", minHeight: "56px" }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">⏱</span>
                      <span className="font-display text-sm text-[hsl(var(--ink))] font-medium">{remainingMin}m until departure</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 justify-center px-3">
                      <span className="px-2 py-1 text-[0.5625rem] bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))] border border-[hsl(var(--border))]/50" style={{ borderRadius: 0 }}>🚶 Walk toward exit</span>
                      <span className="px-2 py-1 text-[0.5625rem] bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))] border border-[hsl(var(--border))]/50" style={{ borderRadius: 0 }}>📸 Last photos</span>
                      <span className="px-2 py-1 text-[0.5625rem] bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))] border border-[hsl(var(--border))]/50" style={{ borderRadius: 0 }}>🛍 Gift shop stop</span>
                    </div>
                  </div>
                ) : remainingMin >= 15 ? (
                  <div
                    className={`my-2 border-2 border-dashed flex flex-col items-center justify-center transition-colors duration-200 ${
                      dropTargetIdx === ribbon.length
                        ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.15)]"
                        : "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                    }`}
                    style={{ borderRadius: "0.75rem", minHeight: `${remainingHeight}px` }}
                    onDragOver={(e) => { e.preventDefault(); setDropTargetIdx(ribbon.length); }}
                    onDragLeave={() => setDropTargetIdx(null)}
                    onDrop={(e) => handleDropOnZone(e, ribbon.length)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">⏳</span>
                      <span className="font-display text-base text-[hsl(var(--gold-dark))] font-bold">{remainingMin}m open</span>
                    </div>
                    <p className="text-[0.6875rem] text-[hsl(var(--ink-light))] font-medium">
                      {formatMin(lastEnd)} → {formatMin(leaveMin)}
                    </p>
                    {Math.floor(remainingMin / 25) > 0 && (
                      <p className="text-[0.625rem] text-[hsl(var(--ink-light))] mt-0.5">
                        ~{Math.floor(remainingMin / 25)} ride{Math.floor(remainingMin / 25) > 1 ? "s" : ""} could fit
                      </p>
                    )}
                    {lastZone && (
                      <span className="mt-2 text-[0.5625rem] uppercase tracking-[0.1em] px-2.5 py-1 bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold-dark))]" style={{ borderRadius: "0.5rem" }}>
                        📍 Near {zoneLabel(lastZone)} · Drag here to fill
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Planned departure waypoint */}
                <div className="flex items-center gap-3 mt-2 p-3 bg-[hsl(var(--ink)/0.04)] border border-dashed border-[hsl(var(--ink)/0.15)]" style={{ borderRadius: 0 }}>
                  <div className="text-center shrink-0 w-16">
                    <span className="font-display text-sm text-[hsl(var(--ink-light))] font-bold leading-none">{formatMin(leaveMin)}</span>
                    <span className="text-[0.5rem] text-[hsl(var(--ink-light))]/50 block">
                      {hasExtendedHours ? "Extended" : "Planned"}
                    </span>
                  </div>
                  <div className="border-l border-[hsl(var(--ink)/0.15)] pl-3 flex-1">
                    <p className="font-display text-sm text-[hsl(var(--ink-light))]">
                      🚗 {hasExtendedHours ? "Extended Evening Hours End" : "Planned Departure"}
                    </p>
                    <p className="text-[0.625rem] text-[hsl(var(--ink-light))]/60 mt-0.5">
                      {hasExtendedHours
                        ? `Regular close at ${leavePark} · Extended hours until ${formatMin(leaveMin)}`
                        : `Park closes at ${leavePark} · Head toward exit for transport`
                      }
                    </p>
                  </div>
                </div>
              </>
            );
          })()}

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
              {minimizeWalking && itinerary.length > 0 && itinerary[itinerary.length - 1].zone && (
                <p className="font-sans text-xs text-[hsl(var(--gold-dark))] mt-1 flex items-center gap-1">
                  📍 Prioritizing near <strong>{zoneLabel(itinerary[itinerary.length - 1].zone)}</strong>
                </p>
              )}
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

                    {/* Time info */}
                    <div className="w-full mt-2 pt-2 border-t border-[hsl(var(--border))] flex items-center gap-2">
                      <span className="text-[0.5625rem] text-destructive font-medium">⏱ {estWait}m wait</span>
                      <span className="text-[hsl(var(--ink-light))]/30 text-[0.5625rem]">·</span>
                      <span className="text-[0.5625rem] text-[hsl(var(--ink))] font-medium">🎢 {rideDur}m ride</span>
                    </div>

                    {/* Zone badge + Early Access badge */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {attraction.zone && (
                        <span className="text-[0.5625rem] text-[hsl(var(--ink-light))]/60 uppercase tracking-[0.08em]">📍 {zoneLabel(attraction.zone)}</span>
                      )}
                      {hasEarlyEntry && attraction.rules.includes("EARLY MORNING ACCESS") && (
                        <span className="px-2 py-0.5 text-[0.5rem] uppercase tracking-[0.08em] bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.3)] font-semibold" style={{ borderRadius: 0 }}>
                          ✨ Early Access
                        </span>
                      )}
                    </div>

                    {/* Scheduled times badge — prominent for timed events */}
                    {attraction.scheduledTimes && attraction.scheduledTimes.length > 0 && (
                      <div className="mt-2 px-3 py-2.5 bg-[hsl(280,30%,55%,0.06)] border border-[hsl(280,30%,55%,0.25)]" style={{ borderRadius: 0 }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CalendarClock className="w-3.5 h-3.5 text-[hsl(280,30%,55%)] shrink-0" />
                          <span className="text-[0.625rem] text-[hsl(280,30%,45%)] font-semibold uppercase tracking-[0.1em]">
                            {attraction.scheduledTimes.length <= 3 ? "Limited Showtimes" : "Showtimes"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {attraction.scheduledTimes.map(t => {
                            const tMin = toMinutes(t);
                            const alreadyBooked = ribbon.some(ri => ri.item.scheduledStartMin === tMin && ri.item.attractionId === attraction.id);
                            return (
                              <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[0.6875rem] font-display font-bold ${
                                alreadyBooked
                                  ? "bg-[hsl(var(--muted))] text-[hsl(var(--ink-light))] line-through"
                                  : "bg-[hsl(280,30%,55%,0.12)] text-[hsl(280,30%,45%)]"
                              }`} style={{ borderRadius: 0 }}>
                                🕐 {t}
                              </span>
                            );
                          })}
                        </div>
                        {attraction.scheduledTimes.length <= 3 && (
                          <p className="text-[0.5625rem] text-[hsl(280,30%,50%,0.7)] mt-1.5 italic">
                            Only {attraction.scheduledTimes.length} offering{attraction.scheduledTimes.length > 1 ? "s" : ""} — must be scheduled at a listed time
                          </p>
                        )}
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
                              className="w-full py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300 bg-[hsl(var(--ink))] text-[#F9F7F2] hover:opacity-90 flex items-center justify-center gap-2"
                              style={{ borderRadius: 0, boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
                            >
                              {attraction.scheduledTimes && attraction.scheduledTimes.length > 0 ? (
                                <><CalendarClock className="w-3.5 h-3.5" /> Pick Showtime &amp; Place</>
                              ) : (
                                <>+ Add to Itinerary</>
                              )}
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

      {/* ═══════════════════════════════════════════════════════════════
          SCHEDULED SHOW PLACEMENT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scheduledPlacement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--ink))]/60"
            onClick={() => setScheduledPlacement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-md mx-4"
              style={{ borderRadius: 0, boxShadow: "0 25px 80px rgba(26,26,27,0.25)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarClock className="w-5 h-5 text-[hsl(280,30%,55%)]" />
                  <h3 className="font-display text-xl text-[hsl(var(--ink))]">Schedule {scheduledPlacement.attraction.name}</h3>
                </div>
                <p className="font-sans text-sm text-[hsl(var(--ink-light))]" style={{ letterSpacing: "-0.02em" }}>
                  This is a timed event. Choose a showtime to place it at the right spot in your itinerary.
                </p>
              </div>

              {/* Time options */}
              <div className="px-6 py-5 space-y-3">
                {scheduledPlacement.times.map(time => {
                  const timeMin = toMinutes(time);
                  const checkin = getCheckinTime({ type: scheduledPlacement.attraction.type } as ItineraryItem);
                  const arriveBy = formatMin(timeMin - checkin);
                  
                  // Check if this time conflicts with existing items
                  const hasConflict = ribbon.some(ri => {
                    return ri.startMin < timeMin + (parseInt(scheduledPlacement.attraction.duration) || 20) && ri.endMin > timeMin - checkin;
                  });

                  return (
                    <button
                      key={time}
                      onClick={() => {
                        insertAtTimePosition(scheduledPlacement.attraction, timeMin);
                        setScheduledPlacement(null);
                      }}
                      className={`w-full text-left p-4 border-2 transition-all duration-200 group ${
                        hasConflict
                          ? "border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.03)] hover:border-[hsl(var(--destructive)/0.5)]"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--gold)/0.02)] hover:border-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.06)]"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center shrink-0">
                            <span className="font-display text-2xl text-[hsl(var(--ink))] font-bold block leading-none">{time}</span>
                            <span className="text-[0.5625rem] text-[hsl(var(--ink-light))] uppercase tracking-[0.1em]">Showtime</span>
                          </div>
                          <div className="border-l border-[hsl(var(--border))] pl-3">
                            <p className="font-sans text-sm text-[hsl(var(--ink))]">
                              📍 Arrive by <strong>{arriveBy}</strong>
                              <span className="text-[hsl(var(--ink-light))]"> ({checkin}m early for spots)</span>
                            </p>
                            <p className="font-sans text-xs text-[hsl(var(--ink-light))] mt-0.5">
                              Duration: {scheduledPlacement.attraction.duration} · {zoneLabel(scheduledPlacement.attraction.zone)}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className={`px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.1em] font-medium transition-all duration-200 ${
                            hasConflict
                              ? "bg-[hsl(var(--destructive)/0.08)] text-destructive"
                              : "bg-[hsl(var(--ink))] text-[#F9F7F2] group-hover:bg-[hsl(var(--gold))]"
                          }`} style={{ borderRadius: 0 }}>
                            {hasConflict ? "⚠ Overlap" : "Place Here →"}
                          </span>
                        </div>
                      </div>
                      {hasConflict && (
                        <p className="text-[0.625rem] text-destructive/70 mt-2 italic">
                          This time overlaps with an existing item — tap to place anyway and adjust manually
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex justify-end items-center">
                <button
                  onClick={() => setScheduledPlacement(null)}
                  className="px-4 py-2 text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--ink-light))] border border-[hsl(var(--border))] hover:border-[hsl(var(--ink))]/30 transition-all duration-200"
                  style={{ borderRadius: 0 }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
