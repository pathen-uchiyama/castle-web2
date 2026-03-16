import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback, useRef } from "react";
import { ChevronDown, Plus, X, Search, Star, Lock, Unlock, Sparkles, AlertTriangle, Clock, Ruler, Zap, Shield, Info, GripVertical, Utensils, Ticket, Flag, LogOut, Users } from "lucide-react";
import type { BookedTrip, PartyMember, DiningReservation, BookedExperience } from "@/data/types";
import {
  allParkAttractions, parkLabels, typeLabels, llLabels, waitLabels,
  crowdImpactLabels, attractionStatusLabels,
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

/* ─── Walk-time presets by pacing ─────────────────────────────────── */
const baseWalkByPacing: Record<string, number> = {
  "Intense": 5,
  "Moderate": 8,
  "Relaxed": 12,
};

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

  // Rope drop & leave park times
  const [ropeDrop, setRopeDrop] = useState("7:30 AM");
  const [leavePark, setLeavePark] = useState("10:00 PM");

  /* ── Stroller / young-kids detection ───────────────────────────── */
  const activeMembers = useMemo(
    () => partyMembers.filter(m => groupMembers.includes(m.memberId)),
    [partyMembers, groupMembers]
  );

  const hasYoungKids = useMemo(
    () => activeMembers.some(m => m.age !== undefined && m.age <= 5),
    [activeMembers]
  );

  const hasStrollerAge = useMemo(
    () => activeMembers.some(m => m.age !== undefined && m.age <= 7),
    [activeMembers]
  );

  /** Walk time derived from pacing + party composition */
  const getEstWalkTime = useCallback(() => {
    let base = baseWalkByPacing[pacing] || 8;
    if (hasStrollerAge) base += 3; // stroller adds ~3 min
    if (hasYoungKids) base += 2;   // extra potty/snack stops
    return base;
  }, [pacing, hasStrollerAge, hasYoungKids]);

  const walkTimeEstimate = getEstWalkTime();

  // Seed itinerary with confirmed bookings
  const seededBookings = useMemo((): ItineraryItem[] => {
    const items: ItineraryItem[] = [];
    diningReservations.forEach(d => {
      items.push({
        id: `booked-${d.reservationId}`,
        name: d.restaurantName,
        type: "meal",
        startTime: d.time,
        duration: 75,
        walkTime: walkTimeEstimate,
        isConfirmed: d.status === "confirmed",
        notes: d.status === "confirmed" ? `✓ CONFIRMED · ${d.confirmationNumber}` : "PENDING",
      });
    });
    bookedExperiences.forEach(e => {
      items.push({
        id: `booked-${e.experienceId}`,
        name: e.experienceName,
        type: "show",
        startTime: e.time,
        duration: parseInt(e.duration) || 30,
        walkTime: walkTimeEstimate,
        isConfirmed: e.status === "confirmed",
        notes: e.status === "confirmed" ? `✓ CONFIRMED · ${e.confirmationNumber}` : "PENDING",
      });
    });
    return items.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  }, [diningReservations, bookedExperiences, walkTimeEstimate]);

  const [itinerary, setItinerary] = useState<ItineraryItem[]>(seededBookings);
  const [isLocked, setIsLocked] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Drop zone hover for timeline
  const [timelineDropHour, setTimelineDropHour] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  /* ── Auto-insert planned break when midDayBreak changes ────────── */
  const [lastBreakType, setLastBreakType] = useState(midDayBreak);

  const insertPlannedBreak = useCallback((breakType: string) => {
    // Remove any previously auto-inserted mid-day break
    setItinerary(prev => {
      const filtered = prev.filter(i => i.id !== "auto-midday-break");
      if (breakType === "Power Through") return filtered;

      const breakItem: ItineraryItem = {
        id: "auto-midday-break",
        name: breakType === "Pool Break" ? "Pool Break" : "Hotel Break",
        type: breakType === "Pool Break" ? "pool" : "hotel",
        startTime: pacing === "Intense" ? "1:00 PM" : "12:30 PM",
        duration: breakType === "Pool Break" ? 90 : 60,
        walkTime: walkTimeEstimate,
        notes: breakType === "Pool Break"
          ? "🏊 Recharge at the resort pool — built into your pace"
          : "😴 Head back for naps & recharge — built into your pace",
      };
      return [...filtered, breakItem];
    });
  }, [pacing, walkTimeEstimate]);

  // Trigger when midDayBreak changes
  if (midDayBreak !== lastBreakType) {
    setLastBreakType(midDayBreak);
    insertPlannedBreak(midDayBreak);
  }

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

  // Build a map of attraction ID → which party members want it (from survey rankings too)
  const attractionSatisfies = useMemo(() => {
    const map: Record<string, { name: string; memberId: string; reason: string }[]> = {};
    surveyResponses.forEach(r => {
      if (r.status !== "completed") return;
      // Top 5
      r.topFiveMustDos.forEach(id => {
        if (!map[id]) map[id] = [];
        if (!map[id].some(m => m.memberId === r.memberId)) {
          map[id].push({ name: r.memberName, memberId: r.memberId, reason: "Top 5 Must-Do" });
        }
      });
      // Rankings
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

        // Survey results ALWAYS override focus filters
        const hasSurveyVotes = topFiveIds.has(a.id) || !!attractionSatisfies[a.id]?.length;
        if (hasSurveyVotes) return true;

        // Focus-based filtering (only for non-survey items)
        if (focus === "Thrill Seekers") {
          if (a.thrillLevel === "mild" && a.type === "ride") return false;
        }
        if (focus === "Toddler Friendly") {
          if (a.thrillLevel === "high") return false;
          if (a.heightRequirement && a.heightRequirement !== "ANY") {
            const reqInches = parseInt(a.heightRequirement);
            if (reqInches >= 44) return false;
          }
        }
        if (focus === "Shows & Characters") {
          if (a.type === "ride" && a.rating < 4.5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Must-do items (top-5 or survey must-do) always float to top
        const aMustDo = topFiveIds.has(a.id) || attractionSatisfies[a.id]?.some(s => s.reason === "Must-Do" || s.reason === "Top 5 Must-Do") ? 1 : 0;
        const bMustDo = topFiveIds.has(b.id) || attractionSatisfies[b.id]?.some(s => s.reason === "Must-Do" || s.reason === "Top 5 Must-Do") ? 1 : 0;
        if (aMustDo !== bMustDo) return bMustDo - aMustDo;

        // Then want-to-do items
        const aWant = attractionSatisfies[a.id]?.some(s => s.reason === "Want to Do") ? 1 : 0;
        const bWant = attractionSatisfies[b.id]?.some(s => s.reason === "Want to Do") ? 1 : 0;
        if (aWant !== bWant) return bWant - aWant;

        // Focus-based sorting boosts
        if (focus === "Thrill Seekers") {
          const thrillOrder = { high: 3, moderate: 2, mild: 1 };
          const diff = thrillOrder[b.thrillLevel] - thrillOrder[a.thrillLevel];
          if (diff !== 0) return diff;
        }
        if (focus === "Shows & Characters") {
          const typeBoost = (t: AttractionType) => (["show", "character", "parade"].includes(t) ? 1 : 0);
          const diff = typeBoost(b.type) - typeBoost(a.type);
          if (diff !== 0) return diff;
        }

        return b.rating - a.rating;
      });
  }, [selectedParks, researchCategory, searchQuery, topFiveIds, focus, attractionSatisfies]);

  const parkSchedules = useMemo(() => {
    const s: { parkId: string; name: string; hours: string; earlyEntry?: string }[] = [];
    if (selectedParks.includes("mk")) s.push({ parkId: "mk", name: "Magic Kingdom", hours: "9 AM – 11 PM", earlyEntry: "8:30 AM" });
    if (selectedParks.includes("epcot")) s.push({ parkId: "epcot", name: "EPCOT", hours: "9 AM – 9:30 PM", earlyEntry: "8:30 AM" });
    return s;
  }, [selectedParks]);

  const rideCount = itinerary.filter(i => i.type === "ride").length;
  const showOverbookingWarning = pacing !== "Intense" && rideCount > 8;

  /* ── Time helpers ───────────────────────────────────────────────── */

  const timeRulerHours = useMemo(() => {
    const hours: string[] = [];
    for (let h = 7; h <= 23; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const display = h > 12 ? h - 12 : h;
      hours.push(`${display} ${ampm}`);
    }
    return hours;
  }, []);

  const PX_PER_MIN = 2;
  const DAY_START_HOUR = 7;
  const DAY_END_HOUR = 23;
  const DAY_START_MIN = DAY_START_HOUR * 60;
  const TOTAL_DAY_MIN = (DAY_END_HOUR - DAY_START_HOUR) * 60;
  const TOTAL_HEIGHT = TOTAL_DAY_MIN * PX_PER_MIN;

  /** Stroller parking time for rides when party has stroller-age kids */
  const getStrollerTime = (item: ItineraryItem) => {
    if (!hasStrollerAge) return 0;
    // Rides and some experiences require parking stroller
    if (["ride", "show", "character"].includes(item.type)) return 5;
    return 0;
  };

  const getCheckinTime = (item: ItineraryItem) => {
    if (["show", "parade", "seasonal"].includes(item.type)) return 15;
    if (item.type === "character") return 10;
    return 0;
  };

  /** Total block time = stroller + checkin + wait + duration */
  const totalBlockTime = (item: ItineraryItem) => {
    return getStrollerTime(item) + getCheckinTime(item) + (item.waitTime || 0) + item.duration;
  };

  const ropeDropMin = toMinutes(ropeDrop);
  const leaveMin = toMinutes(leavePark);

  /** Scheduled items with overlap detection, stroller time, and dynamic walk/gap calculation */
  const scheduledItems = useMemo(() => {
    const items = itinerary
      .filter(i => i.startTime && toMinutes(i.startTime) >= 0)
      .map(item => {
        const startMin = toMinutes(item.startTime);
        const stroller = getStrollerTime(item);
        const checkin = getCheckinTime(item);
        const blockMin = stroller + checkin + (item.waitTime || 0) + item.duration;
        const endMin = startMin + blockMin;
        return { item, startMin, stroller, checkin, blockMin, travelMin: 0, endMin, overlaps: false, gapAfter: 0, gapFitsCount: 0 };
      })
      .sort((a, b) => a.startMin - b.startMin);

    // Detect overlaps + calculate dynamic walk/gaps between consecutive items
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[j].startMin < items[i].endMin) {
          items[i].overlaps = true;
          items[j].overlaps = true;
        }
      }
      // Dynamic gap: time between this item's end and next item's start
      if (i < items.length - 1) {
        const rawGap = items[i + 1].startMin - items[i].endMin;
        items[i].travelMin = Math.min(walkTimeEstimate, Math.max(0, rawGap));
        items[i].gapAfter = Math.max(0, rawGap - walkTimeEstimate);
        items[i].gapFitsCount = items[i].gapAfter >= 15 ? Math.floor(items[i].gapAfter / 25) : 0;
      } else {
        const rawGap = leaveMin - items[i].endMin;
        items[i].travelMin = Math.min(walkTimeEstimate, Math.max(0, rawGap));
        items[i].gapAfter = Math.max(0, rawGap - walkTimeEstimate);
        items[i].gapFitsCount = items[i].gapAfter >= 15 ? Math.floor(items[i].gapAfter / 25) : 0;
      }
    }

    return items;
  }, [itinerary, walkTimeEstimate, leaveMin, hasStrollerAge]);

  /** Day summary stats */
  const daySummary = useMemo(() => {
    let totalRideTime = 0, totalWaitTime = 0, totalWalkTime = 0, totalBreakTime = 0, totalStrollerTime = 0, totalCheckinTime = 0;
    scheduledItems.forEach(({ item, stroller, checkin, travelMin }) => {
      if (["ride"].includes(item.type)) totalRideTime += item.duration;
      if (["show", "character", "parade", "seasonal"].includes(item.type)) totalRideTime += item.duration;
      if (["break", "pool", "hotel", "walk", "snack"].includes(item.type)) totalBreakTime += item.duration;
      if (item.type === "meal") totalBreakTime += item.duration;
      totalWaitTime += item.waitTime || 0;
      totalWalkTime += travelMin;
      totalStrollerTime += stroller;
      totalCheckinTime += checkin;
    });
    const totalPlanned = totalRideTime + totalWaitTime + totalWalkTime + totalBreakTime + totalStrollerTime + totalCheckinTime;
    const dayLength = Math.max(0, leaveMin - ropeDropMin);
    const freeTime = Math.max(0, dayLength - totalPlanned);
    return { totalRideTime, totalWaitTime, totalWalkTime, totalBreakTime, totalStrollerTime, totalCheckinTime, totalPlanned, dayLength, freeTime };
  }, [scheduledItems, leaveMin, ropeDropMin]);

  const unscheduledItems = useMemo(() => itinerary.filter(i => !i.startTime), [itinerary]);

  /* ── Handlers ───────────────────────────────────────────────────── */

  const addToItinerary = (attraction: ParkAttraction) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      startTime: "",
      duration: parseInt(attraction.duration) || 15,
      waitTime: estWait,
      walkTime: walkTimeEstimate,
      llType: attraction.llType,
      waitCategory: attraction.waitCategory,
    }]);
  };

  const addToItineraryAtTime = (attraction: ParkAttraction, hour: number) => {
    if (isLocked) return;
    const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayH = hour > 12 ? hour - 12 : hour;
    const timeStr = `${displayH}:00 ${ampm}`;
    setItinerary(prev => [...prev, {
      id: `it-${Date.now()}`,
      attractionId: attraction.id,
      name: attraction.name,
      type: attraction.type,
      startTime: timeStr,
      duration: parseInt(attraction.duration) || 15,
      waitTime: estWait,
      walkTime: walkTimeEstimate,
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
      walkTime: walkTimeEstimate,
    }]);
  };

  const removeFromItinerary = (id: string) => {
    if (isLocked) return;
    setItinerary(prev => prev.filter(i => i.id !== id));
  };

  /* ── Internal drag and drop (reorder + timeline repositioning) ── */
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  const handleDragStart = useCallback((idx: number, itemId?: string) => {
    if (isLocked) return;
    setDragIdx(idx);
    if (itemId) setDraggingItemId(itemId);
  }, [isLocked]);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  }, []);

  const handleDrop = useCallback((idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    setItinerary(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(idx, 0, moved);
      return updated;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
    setDraggingItemId(null);
    setTimelineDropHour(null);
  }, []);

  /* ── Cross-panel drag (research → timeline) ────────────────────── */
  const [draggingAttractionId, setDraggingAttractionId] = useState<string | null>(null);

  const handleResearchDragStart = useCallback((e: React.DragEvent, attraction: ParkAttraction) => {
    if (isLocked) return;
    e.dataTransfer.setData("attractionId", attraction.id);
    setDraggingAttractionId(attraction.id);
  }, [isLocked]);

  const handleTimelineDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const min = Math.floor(y / PX_PER_MIN) + DAY_START_MIN;
    const hour = Math.floor(min / 60);
    setTimelineDropHour(hour);
  }, []);

  const handleTimelineDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!timelineRef.current) {
      setTimelineDropHour(null);
      setDraggingAttractionId(null);
      setDraggingItemId(null);
      return;
    }

    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const min = Math.round(y / PX_PER_MIN) + DAY_START_MIN;
    const hour = Math.floor(min / 60);
    const roundedMin = Math.round((min % 60) / 5) * 5;
    const totalMin = hour * 60 + roundedMin;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayH}:${roundedMin.toString().padStart(2, "0")} ${ampm}`;

    // Case 1: Repositioning an existing itinerary item
    const timelineItemId = draggingItemId || e.dataTransfer.getData("timelineItemId");
    if (timelineItemId) {
      // Check if we're dropping onto another scheduled item — swap their times
      const dropTarget = scheduledItems.find(s => {
        if (s.item.id === timelineItemId) return false;
        return totalMin >= s.startMin && totalMin < s.startMin + s.blockMin;
      });

      if (dropTarget) {
        // Swap start times between dragged item and drop target
        setItinerary(prev => prev.map(item => {
          if (item.id === timelineItemId) return { ...item, startTime: dropTarget.item.startTime };
          if (item.id === dropTarget.item.id) {
            const draggedItem = prev.find(i => i.id === timelineItemId);
            return { ...item, startTime: draggedItem?.startTime || timeStr };
          }
          return item;
        }));
      } else {
        // Drop onto empty space — just reposition
        setItinerary(prev => prev.map(item =>
          item.id === timelineItemId ? { ...item, startTime: timeStr } : item
        ));
      }
      setTimelineDropHour(null);
      setDraggingItemId(null);
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    // Case 2: Dropping a new attraction from research
    const attractionId = e.dataTransfer.getData("attractionId");
    if (attractionId) {
      const allAttractions = selectedParks.flatMap(p => allParkAttractions[p] || []);
      const attraction = allAttractions.find(a => a.id === attractionId);
      if (attraction) {
        const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
        setItinerary(prev => [...prev, {
          id: `it-${Date.now()}`,
          attractionId: attraction.id,
          name: attraction.name,
          type: attraction.type,
          startTime: timeStr,
          duration: parseInt(attraction.duration) || 15,
          waitTime: estWait,
          walkTime: walkTimeEstimate,
          llType: attraction.llType,
          waitCategory: attraction.waitCategory,
        }]);
      }
    }

    setTimelineDropHour(null);
    setDraggingAttractionId(null);
    setDraggingItemId(null);
  }, [selectedParks, isLocked, draggingItemId, scheduledItems]);

  const toggleGroupMember = (id: string) => {
    setGroupMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const togglePark = (parkId: string) => {
    setSelectedParks(prev =>
      prev.includes(parkId) ? (prev.length > 1 ? prev.filter(p => p !== parkId) : prev) : [...prev, parkId]
    );
  };

  /* ── Format minutes to time string ─────────────────────────────── */
  const formatMin = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
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
          <div className="bg-card border border-border p-3 shadow-soft flex items-center gap-3">
            <span className="text-xl">⛅</span>
            <div>
              <p className="font-display text-sm text-foreground">74°F · Showers</p>
              <p className="text-[0.5rem] text-muted-foreground uppercase tracking-[0.1em]">Pack ponchos</p>
            </div>
          </div>
          <div className="bg-card border border-[hsl(var(--gold)/0.25)] p-3 shadow-soft">
            <p className="text-[0.5rem] uppercase tracking-[0.12em] text-[hsl(var(--gold-dark))] mb-0.5">On-Site Resort</p>
            <p className="font-display text-sm text-foreground">Polynesian Village</p>
            <p className="text-[0.5rem] text-muted-foreground mt-0.5">Early Entry · Extended Hours</p>
          </div>
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
            {/* Walk time indicator */}
            <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-muted/30 border border-border/30">
              <span className="text-[0.5rem]">🚶</span>
              <span className="text-[0.4375rem] text-muted-foreground">
                Est. walk time: <strong className="text-foreground">{walkTimeEstimate} min</strong>
                <span className="text-muted-foreground/60 ml-1">
                  ({pacing} pace{hasStrollerAge ? " · 🍼 Stroller" : ""}{hasYoungKids ? " · 👶 Young kids" : ""})
                </span>
              </span>
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
                  <strong>{rideCount} rides</strong> is ambitious for a <strong>{pacing.toLowerCase()}</strong> pace. Consider swapping some for shows or rest. ✨
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
        <div className="border-y border-border bg-card shadow-soft">
          <CollapsibleTrigger className="w-full px-6 lg:px-10 py-3.5 flex items-center justify-between hover:bg-[hsl(var(--warm))] transition-colors duration-200">
            <div className="flex items-center gap-4">
              <p className="label-text !text-foreground font-medium">Adventure Group</p>
              <div className="flex -space-x-1.5">
                {partyMembers.filter(m => groupMembers.includes(m.memberId)).map(m => (
                  <div key={m.memberId} className="w-7 h-7 flex items-center justify-center text-[0.5625rem] font-medium bg-foreground text-background border-2 border-card shadow-soft">
                    {m.initial}
                  </div>
                ))}
              </div>
              <span className="font-editorial text-xs text-muted-foreground">{groupMembers.length} of {partyMembers.length} going today</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${groupOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 lg:px-10 pb-4 pt-1 border-t border-border/50">
              <div className="flex flex-wrap gap-2.5">
                {partyMembers.map(member => {
                  const isAdded = groupMembers.includes(member.memberId);
                  return (
                    <button key={member.memberId} onClick={() => toggleGroupMember(member.memberId)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 border transition-all duration-300 shadow-soft ${
                        isAdded
                          ? "border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)]"
                          : "border-border bg-muted/50 hover:border-foreground/20 opacity-50"
                      }`}>
                      <div className={`w-7 h-7 flex items-center justify-center text-[0.5625rem] font-medium ${
                        isAdded ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                      }`}>{member.initial}</div>
                      <div className="text-left">
                        <span className="font-display text-sm text-foreground block leading-tight">{member.name}</span>
                        <span className="text-[0.5rem] text-muted-foreground">{member.role}</span>
                      </div>
                    </button>
                  );
                })}
                <button className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border text-muted-foreground hover:border-foreground/30 transition-all duration-300">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[0.5625rem] uppercase tracking-[0.1em]">Invite</span>
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
        <div className="border-r border-border/60 px-4 lg:px-6 py-6 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] bg-card">

          {/* Park hours */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
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

          {/* ── Day Summary Stats ──────────────────────────────────── */}
          {scheduledItems.length > 0 && (
            <div className="mb-4 p-3 bg-[hsl(var(--warm))] border border-border/40 shadow-soft">
              <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">Day Breakdown · {ropeDrop} → {leavePark} · {Math.floor(daySummary.dayLength / 60)}h {daySummary.dayLength % 60}m total</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <span className="font-display text-sm text-foreground">{daySummary.totalRideTime}m</span>
                  <span className="text-[0.375rem] text-muted-foreground block uppercase tracking-[0.1em]">🎢 Rides & Shows</span>
                </div>
                <div>
                  <span className="font-display text-sm text-destructive">{daySummary.totalWaitTime}m</span>
                  <span className="text-[0.375rem] text-muted-foreground block uppercase tracking-[0.1em]">⏱ In Line</span>
                </div>
                <div>
                  <span className="font-display text-sm text-foreground">{daySummary.totalWalkTime + daySummary.totalStrollerTime}m</span>
                  <span className="text-[0.375rem] text-muted-foreground block uppercase tracking-[0.1em]">🚶 Walk{hasStrollerAge ? " + 🍼 Stroller" : ""}</span>
                </div>
                <div>
                  <span className="font-display text-sm text-foreground">{daySummary.totalBreakTime}m</span>
                  <span className="text-[0.375rem] text-muted-foreground block uppercase tracking-[0.1em]">⏸ Breaks & Meals</span>
                </div>
              </div>
              {/* Utilization bar */}
              <div className="flex h-2 overflow-hidden bg-muted/30 border border-border/20">
                <div className="bg-foreground/30" style={{ width: `${(daySummary.totalRideTime / daySummary.dayLength) * 100}%` }} title="Rides & Shows" />
                <div className="bg-destructive/30" style={{ width: `${(daySummary.totalWaitTime / daySummary.dayLength) * 100}%` }} title="Wait Time" />
                <div className="bg-[hsl(var(--gold)/0.3)]" style={{ width: `${((daySummary.totalWalkTime + daySummary.totalStrollerTime + daySummary.totalCheckinTime) / daySummary.dayLength) * 100}%` }} title="Walking" />
                <div className="bg-muted" style={{ width: `${(daySummary.totalBreakTime / daySummary.dayLength) * 100}%` }} title="Breaks" />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[0.375rem] text-muted-foreground">
                  {Math.round((daySummary.totalPlanned / daySummary.dayLength) * 100)}% planned
                </span>
                {daySummary.freeTime > 0 && (
                  <span className="text-[0.375rem] text-[hsl(var(--gold-dark))] font-medium">
                    ⏳ {daySummary.freeTime}m unplanned — room for {Math.floor(daySummary.freeTime / 25)} more rides
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Proportional Time Ruler + Items ─────────────────────── */}
          <div
            ref={timelineRef}
            className="relative"
            style={{ height: `${TOTAL_HEIGHT}px` }}
            onDragOver={handleTimelineDragOver}
            onDrop={handleTimelineDrop}
            onDragLeave={() => setTimelineDropHour(null)}
          >
            {/* Hour grid lines */}
            {timeRulerHours.map((hourLabel, hIdx) => {
              const hourValue = hIdx + DAY_START_HOUR;
              const topPx = (hourValue * 60 - DAY_START_MIN) * PX_PER_MIN;
              const hasItems = scheduledItems.some(s => Math.floor(s.startMin / 60) === hourValue);
              const isDropTarget = timelineDropHour === hourValue;

              return (
                <div key={hourLabel} className="absolute left-0 right-0" style={{ top: `${topPx}px` }}>
                  <div className="flex items-start">
                    <div className="w-[52px] shrink-0">
                      <span className={`font-display text-[0.5625rem] ${hasItems ? "text-foreground" : "text-muted-foreground/30"}`}>
                        {hourLabel}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <div className={`absolute top-[6px] left-0 right-0 border-t ${
                        isDropTarget ? "border-[hsl(var(--gold))] border-solid border-2" :
                        hasItems ? "border-border/40" : "border-border/15"
                      } ${!isDropTarget ? "border-dashed" : ""}`} />
                      {isDropTarget && (
                        <div className="absolute top-[10px] left-2 text-[0.5rem] text-[hsl(var(--gold-dark))] font-medium animate-pulse">
                          Drop here to schedule at {hourLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Vertical timeline spine */}
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border/20" />

            {/* ── ROPE DROP MARKER ──────────────────────────────────── */}
            {ropeDropMin >= DAY_START_MIN && (
              <div
                className="absolute left-0 right-2"
                style={{ top: `${(ropeDropMin - DAY_START_MIN) * PX_PER_MIN}px` }}
              >
                <div className="flex items-center gap-2 ml-[52px]">
                  <div className="w-3 h-3 bg-[hsl(var(--gold))] flex items-center justify-center shrink-0">
                    <Flag className="w-2 h-2 text-background" />
                  </div>
                  <div className="flex-1 border-t-2 border-[hsl(var(--gold))] border-solid" />
                  <span className="px-2 py-0.5 bg-[hsl(var(--gold))] text-background text-[0.5rem] uppercase tracking-[0.12em] font-medium shrink-0">
                    🏰 Rope Drop · {ropeDrop}
                  </span>
                </div>
              </div>
            )}

            {/* ── LEAVE PARK MARKER ────────────────────────────────── */}
            {leaveMin >= DAY_START_MIN && leaveMin <= DAY_END_HOUR * 60 && (
              <div
                className="absolute left-0 right-2"
                style={{ top: `${(leaveMin - DAY_START_MIN) * PX_PER_MIN}px` }}
              >
                <div className="flex items-center gap-2 ml-[52px]">
                  <div className="w-3 h-3 bg-foreground flex items-center justify-center shrink-0">
                    <LogOut className="w-2 h-2 text-background" />
                  </div>
                  <div className="flex-1 border-t-2 border-foreground border-solid" />
                  <span className="px-2 py-0.5 bg-foreground text-background text-[0.5rem] uppercase tracking-[0.12em] font-medium shrink-0">
                    🚗 Leave Park · {leavePark}
                  </span>
                </div>
              </div>
            )}

            {/* Scheduled activity blocks — proportionally positioned */}
            {scheduledItems.map(({ item, startMin, stroller, checkin, blockMin, travelMin, overlaps, gapAfter, gapFitsCount }, idx) => {
              const globalIdx = itinerary.indexOf(item);
              const isBooked = item.id.startsWith("booked-");
              const isMeal = item.type === "meal" || item.type === "snack";
              const isExperience = ["show", "character", "parade", "seasonal"].includes(item.type);
              const isBreak = ["break", "pool", "hotel", "walk"].includes(item.type);
              const isDragging = dragIdx === globalIdx;
              const isDragOver = dragOverIdx === globalIdx;

              const topPx = (startMin - DAY_START_MIN) * PX_PER_MIN;
              const activityHeight = Math.max(blockMin * PX_PER_MIN, 40);
              const travelHeight = travelMin > 0 ? Math.max(travelMin * PX_PER_MIN, 14) : 0;
              const gapHeight = gapAfter > 0 ? Math.max(gapAfter * PX_PER_MIN, 20) : 0;

              const wait = item.waitTime || 0;
              const dur = item.duration;
              const endTimeStr = formatMin(startMin + blockMin);

              return (
                <div key={item.id} className="absolute left-[60px] right-2" style={{ top: `${topPx}px`, zIndex: isDragging ? 50 : 10 }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; handleTimelineDragOver(e); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleTimelineDrop(e); }}
                >
                  {/* ── Activity block ───────────────────────────── */}
                  <div
                    draggable={!isLocked && !isBooked}
                    onDragStart={(e) => {
                      if (isLocked || isBooked) { e.preventDefault(); return; }
                      e.dataTransfer.setData("timelineItemId", item.id);
                      e.dataTransfer.effectAllowed = "move";
                      if (e.currentTarget) {
                        e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
                      }
                      setDraggingItemId(item.id);
                      setDragIdx(globalIdx);
                    }}
                    onDragEnd={handleDragEnd}
                    style={{ minHeight: `${activityHeight}px` }}
                    className={`group select-none border-l-[3px] border px-3 py-2 transition-all duration-200 shadow-soft overflow-hidden ${
                      isDragging ? "opacity-40 scale-95" : ""
                    } ${isDragOver ? "ring-1 ring-[hsl(var(--gold))]" : ""} ${
                      overlaps ? "ring-2 ring-destructive/60 border-destructive/40" : ""
                    } ${
                      isMeal
                        ? "bg-[hsl(42,64%,35%,0.06)] border-[hsl(var(--gold)/0.3)] border-l-[hsl(var(--gold))]"
                        : isExperience
                        ? "bg-[hsl(280,30%,55%,0.04)] border-[hsl(280,30%,55%,0.2)] border-l-[hsl(280,30%,55%)]"
                        : isBreak
                        ? "bg-[hsl(var(--warm))] border-dashed border-border border-l-muted-foreground/30"
                        : item.isConfirmed
                        ? "bg-[hsl(var(--gold)/0.04)] border-[hsl(var(--gold)/0.3)] border-l-[hsl(var(--gold))]"
                        : "bg-background border-border border-l-foreground/40"
                    } ${!isLocked && !isBooked ? "hover:shadow-soft-hover cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    {/* Overlap warning banner */}
                    {overlaps && (
                      <div className="flex items-center gap-1.5 px-2 py-1 mb-1.5 -mx-3 -mt-2 bg-[hsl(var(--destructive)/0.08)] border-b border-destructive/20">
                        <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                        <span className="text-[0.4375rem] text-destructive font-medium uppercase tracking-[0.08em]">
                          Time Conflict — Overlaps with another item
                        </span>
                      </div>
                    )}

                    {/* Header row: Name + Wait Time badge */}
                    <div className="flex items-center gap-2">
                      {!isLocked && !isBooked && (
                        <GripVertical className="w-3 h-3 text-muted-foreground/30 shrink-0 cursor-grab" />
                      )}
                      <span className="font-display text-[0.875rem] text-foreground truncate flex-1">{item.name}</span>
                      <span className={`px-1.5 py-0.5 text-[0.35rem] uppercase tracking-[0.1em] shrink-0 ${
                        item.type === "ride" ? "bg-foreground text-background" :
                        isMeal ? "bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold-dark))]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.1)] text-[hsl(280,30%,45%)]" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {isMeal ? "🍽 Dining" : isExperience ? "✨ Experience" : item.type === "rope-drop" ? "Arrive" : item.type}
                      </span>
                      {wait > 0 ? (
                        <div className="text-right shrink-0 px-2 py-1 bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.15)]">
                          <span className="text-[0.875rem] text-destructive font-display font-bold leading-none">{wait}m</span>
                          <span className="text-[0.35rem] text-destructive/70 uppercase block tracking-[0.1em]">Est. Wait</span>
                        </div>
                      ) : (
                        <div className="text-right shrink-0">
                          <span className="text-[0.625rem] text-muted-foreground font-display">{dur}m</span>
                          <span className="text-[0.35rem] text-muted-foreground/60 uppercase block">Duration</span>
                        </div>
                      )}
                      {!isLocked && !isBooked && (
                        <button onClick={() => removeFromItinerary(item.id)}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all duration-200">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Time span */}
                    <div className="mt-1 flex items-center gap-1 text-[0.4375rem] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="font-medium text-foreground">{item.startTime}</span>
                      <span>→</span>
                      <span className="font-medium text-foreground">{endTimeStr}</span>
                      <span className="text-foreground/30 mx-0.5">·</span>
                      <span className="font-display text-foreground">{blockMin}m</span>
                      <span>block</span>
                    </div>

                    {/* Segmented time breakdown chips */}
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      {stroller > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[hsl(var(--gold)/0.08)] text-[0.375rem] text-[hsl(var(--gold-dark))] font-medium">
                          🍼 Stroller {stroller}m
                        </span>
                      )}
                      {checkin > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[hsl(280,30%,55%,0.08)] text-[0.375rem] text-[hsl(280,30%,45%)] font-medium">
                          📋 {isExperience ? "Arrive Early" : "Check-in"} {checkin}m
                        </span>
                      )}
                      {wait > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[hsl(var(--destructive)/0.06)] text-[0.375rem] text-destructive font-medium">
                          ⏱ Wait {wait}m
                        </span>
                      )}
                      <span className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[0.375rem] font-medium ${
                        isMeal ? "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.08)] text-[hsl(280,30%,45%)]" :
                        isBreak ? "bg-muted text-muted-foreground" :
                        "bg-foreground/5 text-foreground"
                      }`}>
                        {isBreak ? "⏸" : isMeal ? "🍽" : isExperience ? "🎭" : "🎢"} {dur}m
                      </span>
                      {isMeal && item.isConfirmed && (
                        <span className="px-1.5 py-0.5 text-[0.35rem] text-[hsl(var(--gold-dark))] bg-[hsl(var(--gold)/0.1)] font-medium">
                          ± 15m window
                        </span>
                      )}
                    </div>

                    {/* Visual time bar */}
                    <div className="mt-1.5 flex h-1.5 overflow-hidden bg-muted/30">
                      {stroller > 0 && (
                        <div className="bg-[hsl(var(--gold)/0.3)]" style={{ width: `${(stroller / blockMin) * 100}%` }} />
                      )}
                      {checkin > 0 && (
                        <div className="bg-[hsl(280,30%,55%,0.3)]" style={{ width: `${(checkin / blockMin) * 100}%` }} />
                      )}
                      {wait > 0 && (
                        <div className="bg-destructive/25" style={{ width: `${(wait / blockMin) * 100}%` }} />
                      )}
                      <div className={`${
                        isMeal ? "bg-[hsl(var(--gold)/0.4)]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.4)]" :
                        isBreak ? "bg-muted-foreground/20" :
                        "bg-foreground/20"
                      }`} style={{ width: `${(dur / blockMin) * 100}%` }} />
                    </div>

                    {/* LL badge */}
                    {item.llType && item.llType !== "none" && (
                      <div className="mt-1.5">
                        <span className="px-1.5 py-0.5 text-[0.35rem] uppercase tracking-[0.08em] bg-accent text-accent-foreground border border-border">
                          {llLabels[item.llType]}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="font-editorial text-[0.5625rem] text-muted-foreground mt-1.5 italic">{item.notes}</p>
                    )}
                  </div>

                  {/* ── Walk time connector ────────────────────────── */}
                  {travelMin > 0 && (
                    <div
                      style={{ height: `${travelHeight}px` }}
                      className="flex items-center gap-2 pl-4 border-l border-dashed border-muted-foreground/20 ml-1"
                    >
                      <span className="text-[0.4375rem] text-muted-foreground font-medium flex items-center gap-1">
                        🚶 {travelMin} min walk{hasStrollerAge ? " (w/ stroller)" : ""}
                      </span>
                    </div>
                  )}

                  {/* ── Gap indicator (open slot) ─────────────────── */}
                  {gapAfter > 0 && (
                    <div
                      style={{ height: `${gapHeight}px` }}
                      className="flex items-center ml-1 border-l-2 border-dashed border-[hsl(var(--gold)/0.3)]"
                    >
                      <div className="ml-3 px-3 py-1.5 bg-[hsl(var(--gold)/0.04)] border border-dashed border-[hsl(var(--gold)/0.2)]">
                        <span className="text-[0.5rem] font-display text-[hsl(var(--gold-dark))] font-medium">
                          ⏳ {gapAfter} min open
                        </span>
                        {gapFitsCount > 0 ? (
                          <span className="text-[0.4375rem] text-muted-foreground ml-2">
                            — fits ~{gapFitsCount} ride{gapFitsCount > 1 ? "s" : ""}
                          </span>
                        ) : gapAfter >= 5 && (
                          <span className="text-[0.4375rem] text-muted-foreground ml-2">
                            — {gapAfter >= 10 ? "bathroom / snack / photo" : "quick stop"}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unscheduled items */}
          {unscheduledItems.length > 0 && (
            <div className="mt-6 ml-[64px]">
              <p className="label-text mb-2">Unscheduled</p>
              <p className="font-editorial text-[0.625rem] text-muted-foreground/50 mb-3 italic">
                Drag to the timeline above to assign a time
              </p>
              <div className="space-y-1.5">
                {unscheduledItems.map(item => {
                  const globalIdx = itinerary.indexOf(item);
                  const isMeal = item.type === "meal" || item.type === "snack";
                  const isExperience = item.type === "show" || item.type === "character";
                  const isDragging = dragIdx === globalIdx;
                  const isDragOver = dragOverIdx === globalIdx;
                  const wait = item.waitTime || 0;
                  const totalTime = wait + item.duration;

                  return (
                    <div
                      key={item.id}
                      draggable={!isLocked}
                      onDragStart={() => handleDragStart(globalIdx, item.id)}
                      onDragOver={(e) => handleDragOver(e, globalIdx)}
                      onDrop={() => handleDrop(globalIdx)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center gap-2 border px-3 py-2 shadow-soft transition-all duration-200 ${
                        isDragging ? "opacity-40" : ""
                      } ${isDragOver ? "border-[hsl(var(--gold))]" : ""} ${
                        isMeal ? "bg-[hsl(42,64%,35%,0.06)] border-[hsl(var(--gold)/0.3)]" :
                        isExperience ? "bg-[hsl(280,30%,55%,0.04)] border-[hsl(280,30%,55%,0.2)]" :
                        "bg-background border-border"
                      } ${!isLocked ? "cursor-grab hover:shadow-soft-hover" : ""}`}
                    >
                      {!isLocked && <GripVertical className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
                      <div className={`w-2 h-2 shrink-0 ${
                        isMeal ? "bg-[hsl(var(--gold))]" :
                        isExperience ? "bg-[hsl(280,30%,55%)]" :
                        "bg-foreground/50"
                      }`} />
                      <span className="font-display text-[0.75rem] text-foreground flex-1 truncate">{item.name}</span>
                      <div className="text-right shrink-0">
                        {wait > 0 && (
                          <span className="text-[0.4375rem] text-destructive block">⏱ {wait}m wait</span>
                        )}
                        <span className="text-[0.5rem] text-foreground font-medium">{totalTime}m block</span>
                      </div>
                      {!isLocked && (
                        <button onClick={() => removeFromItinerary(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick-add strip */}
          {!isLocked && (
            <div className="mt-5 ml-[64px]">
              <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">Quick Add</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {quickAdds.map((qa, i) => (
                  <button key={`${qa.label}-${i}`} onClick={() => addQuickItem(qa.type, qa.label, qa.dur)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-background border border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-300 shadow-soft">
                    <span className="text-[0.625rem]">{qa.emoji}</span>
                    <span className="text-[0.4375rem] uppercase tracking-[0.1em]">{qa.label}</span>
                    <span className="text-[0.35rem] text-muted-foreground/50">{qa.dur}m</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color legend */}
          <div className="flex items-center gap-3 mt-6 ml-[64px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-foreground/30" />
              <span className="text-[0.5rem] text-muted-foreground">Ride/Show</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-destructive/30" />
              <span className="text-[0.5rem] text-muted-foreground">Wait</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-[hsl(var(--gold)/0.4)]" />
              <span className="text-[0.5rem] text-muted-foreground">Walk / Stroller</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-[hsl(280,30%,55%,0.3)]" />
              <span className="text-[0.5rem] text-muted-foreground">Check-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-muted" />
              <span className="text-[0.5rem] text-muted-foreground">Break/Meal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border-2 border-dashed border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.04)]" />
              <span className="text-[0.5rem] text-muted-foreground">Open Slot</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Research Assistant ──────────────────────────────── */}
        <div className="px-6 lg:px-8 py-8 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] bg-[hsl(var(--warm))]">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="label-text mb-1">Research Assistant</p>
              <p className="font-editorial text-xs text-muted-foreground">
                Drag a card onto the timeline to schedule it · Top 5 picks float up ✦
              </p>
              {focus !== "Classic Magic" && (
                <p className="text-[0.4375rem] uppercase tracking-[0.1em] text-[hsl(var(--gold-dark))] mt-1.5">
                  🎯 Filtered for: <strong>{focus}</strong>
                  {focus === "Toddler Friendly" && " · Hiding high-thrill & tall height requirements"}
                  {focus === "Thrill Seekers" && " · Hiding mild rides"}
                  {focus === "Shows & Characters" && " · Prioritizing entertainment"}
                </p>
              )}
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
              const satisfies = attractionSatisfies[attraction.id];
              const alreadyAdded = itinerary.some(i => i.attractionId === attraction.id);
              const isExpanded = expandedCardId === attraction.id;
              const isDraggingThis = draggingAttractionId === attraction.id;
              const estWait = attraction.waitCategory ? (defaultWaitByCategory[attraction.waitCategory] || 15) : 15;
              const rideDur = parseInt(attraction.duration) || 15;
              const totalBlockEst = estWait + rideDur;

              return (
                <motion.div
                  key={attraction.id}
                  layout
                  draggable={!attraction.isClosed && !alreadyAdded && !isLocked}
                  onDragStart={(e: any) => handleResearchDragStart(e, attraction)}
                  onDragEnd={() => setDraggingAttractionId(null)}
                  className={`border transition-all duration-300 shadow-soft hover:shadow-soft-hover ${
                    isDraggingThis ? "opacity-40 scale-95" : ""
                  } ${
                    attraction.isClosed ? "opacity-30 pointer-events-none" :
                    isTopFive ? "border-[hsl(var(--gold)/0.35)] bg-card" :
                    "border-border bg-card"
                  } ${!attraction.isClosed && !alreadyAdded && !isLocked ? "cursor-grab" : ""}`}
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
                        🎢 {attraction.duration}
                      </span>
                      <span className="px-1.5 py-0.5 text-[0.375rem] uppercase tracking-[0.08em] bg-foreground/8 text-foreground font-medium">
                        📅 {totalBlockEst}m block
                      </span>

                    {/* Separated wait time visual */}
                    <div className="w-full mt-2 flex items-center gap-2">
                      <div className="flex-1 flex h-2 overflow-hidden bg-muted/20 border border-border/30">
                        <div
                          className="bg-destructive/25 border-r border-destructive/30 flex items-center justify-center"
                          style={{ width: `${(estWait / totalBlockEst) * 100}%` }}
                        />
                        <div
                          className={`${
                            attraction.type === "show" || attraction.type === "character" || attraction.type === "parade"
                              ? "bg-[hsl(280,30%,55%,0.25)]"
                              : "bg-foreground/10"
                          }`}
                          style={{ width: `${(rideDur / totalBlockEst) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[0.375rem] text-destructive font-medium">⏱ {estWait}m</span>
                        <span className="text-muted-foreground/30 text-[0.375rem]">·</span>
                        <span className="text-[0.375rem] text-foreground font-medium">🎢 {rideDur}m</span>
                      </div>
                    </div>
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

                    {/* Attraction status badge */}
                    {attraction.attractionStatus && attraction.attractionStatus.status !== "operating" && (
                      <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 ${
                        attraction.attractionStatus.status === "new" ? "bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)]" :
                        attraction.attractionStatus.status === "recently-opened" ? "bg-[hsl(var(--gold)/0.08)] border border-[hsl(var(--gold)/0.2)]" :
                        attraction.attractionStatus.status === "closing-permanently" ? "bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.15)]" :
                        attraction.attractionStatus.status === "refurbishment" ? "bg-muted border border-border" :
                        "bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.15)]"
                      }`}>
                        <span className="text-[0.5rem]">
                          {attraction.attractionStatus.status === "new" ? "🆕" :
                           attraction.attractionStatus.status === "recently-opened" ? "✨" :
                           attraction.attractionStatus.status === "closing-permanently" ? "⏳" :
                           attraction.attractionStatus.status === "being-reimagined" ? "🔄" :
                           attraction.attractionStatus.status === "refurbishment" ? "🔧" : "📅"}
                        </span>
                        <span className="font-display text-[0.5rem] text-foreground">{attraction.attractionStatus.label}</span>
                        {attraction.attractionStatus.crowdImpact && attraction.attractionStatus.crowdImpact !== "none" && (
                          <span className={`px-1 py-0.5 text-[0.35rem] uppercase tracking-[0.08em] ${
                            attraction.attractionStatus.crowdImpact === "extreme" ? "bg-[hsl(var(--destructive)/0.1)] text-destructive" :
                            attraction.attractionStatus.crowdImpact === "high" ? "bg-[hsl(var(--destructive)/0.08)] text-destructive" :
                            "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))]"
                          }`}>
                            {crowdImpactLabels[attraction.attractionStatus.crowdImpact].label}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ── WHO THIS SATISFIES ────────────────────────── */}
                    {satisfies && satisfies.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 bg-[hsl(var(--gold)/0.04)] border border-[hsl(var(--gold)/0.15)]">
                        <Users className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0" />
                        <div className="flex items-center gap-1 flex-wrap">
                          {satisfies.map(s => (
                            <span key={s.memberId} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[0.4375rem] text-[hsl(var(--gold-dark))]">
                              {s.name} · <span className="italic">{s.reason}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top-5 voters (fallback if no satisfies data) */}
                    {isTopFive && voters && (!satisfies || satisfies.length === 0) && (
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
                          <p className="font-editorial text-[0.75rem] text-foreground leading-relaxed mb-3">
                            {attraction.description}
                          </p>

                          <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-[hsl(var(--warm))] border border-border/40">
                            <Info className="w-3 h-3 text-[hsl(var(--gold-dark))] shrink-0 mt-0.5" />
                            <p className="font-editorial text-[0.6875rem] text-foreground italic">{attraction.notableInsight}</p>
                          </div>

                          {/* Crowd impact */}
                          {attraction.attractionStatus && attraction.attractionStatus.crowdImpact && attraction.attractionStatus.crowdImpact !== "none" && (
                            <div className={`flex items-start gap-2 mb-3 px-3 py-2 border ${
                              attraction.attractionStatus.crowdImpact === "extreme" ? "bg-[hsl(var(--destructive)/0.04)] border-[hsl(var(--destructive)/0.15)]" :
                              "bg-[hsl(var(--gold)/0.04)] border-[hsl(var(--gold)/0.15)]"
                            }`}>
                              <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${
                                attraction.attractionStatus.crowdImpact === "extreme" ? "text-destructive" : "text-[hsl(var(--gold-dark))]"
                              }`} />
                              <div>
                                <p className={`font-display text-[0.5625rem] mb-0.5 ${
                                  attraction.attractionStatus.crowdImpact === "extreme" ? "text-destructive" : "text-[hsl(var(--gold-dark))]"
                                }`}>
                                  {crowdImpactLabels[attraction.attractionStatus.crowdImpact].label} — Expect Longer Waits
                                </p>
                                {attraction.attractionStatus.note && (
                                  <p className="font-editorial text-[0.5625rem] text-muted-foreground italic">{attraction.attractionStatus.note}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Time breakdown detail */}
                          <div className="mb-3 px-3 py-2 bg-muted/30 border border-border/30">
                            <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Schedule Impact</p>
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="text-[0.6875rem] font-display text-destructive">~{estWait}m</span>
                                <span className="text-[0.375rem] text-muted-foreground block">Est. Wait</span>
                              </div>
                              <span className="text-muted-foreground/30">+</span>
                              <div>
                                <span className="text-[0.6875rem] font-display text-foreground">{rideDur}m</span>
                                <span className="text-[0.375rem] text-muted-foreground block">Duration</span>
                              </div>
                              <span className="text-muted-foreground/30">=</span>
                              <div>
                                <span className="text-[0.6875rem] font-display text-foreground font-bold">{totalBlockEst}m</span>
                                <span className="text-[0.375rem] text-muted-foreground block">Calendar Block</span>
                              </div>
                            </div>
                          </div>

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

/* ── Utility (module-level) ──────────────────────────────────────── */
function toMinutes(t: string) {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export default ItineraryDesigner;
