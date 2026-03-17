/* ─── Attraction Data for Itinerary Designer ────────────────────── */

export type AttractionType = "ride" | "show" | "parade" | "character" | "dining" | "seasonal";
export type ThrillLevel = "mild" | "moderate" | "high";
export type LLType = "ll-multi-1" | "ll-multi-2" | "ll-single" | "standby-only" | "none";
export type WaitCategory = "walk-on" | "walk-on-am" | "fast-walk-on" | "hard-to-get" | "ill-required";

/** Lifecycle status that affects crowd levels and demand */
export type AttractionStatus =
  | "operating"            // Normal operations
  | "new"                  // Brand new attraction (< 1 year), expect extreme demand
  | "recently-opened"      // Reopened after refurb or just opened (< 6 months), high demand
  | "closing-permanently"  // Will close permanently / be replaced — last-chance demand spike
  | "being-reimagined"     // Currently undergoing major transformation (e.g. Splash → Tiana's)
  | "refurbishment"        // Temporarily closed for scheduled maintenance
  | "seasonal";            // Only operates during certain seasons/events

export interface AttractionStatusMeta {
  status: AttractionStatus;
  label: string;
  note?: string;          // e.g. "Opens Summer 2025" or "Final day: Jan 22, 2025"
  crowdImpact?: "extreme" | "high" | "moderate" | "none";
}

export interface ParkAttraction {
  id: string;
  name: string;
  parkId: string;
  type: AttractionType;
  rating: number;
  duration: string;
  heightRequirement?: string;
  thrillLevel: ThrillLevel;
  environment: string;
  llType: LLType;
  waitCategory: WaitCategory;
  description: string;
  notableInsight: string;
  rules: string[];
  warnings: string[];
  isClosed?: boolean;
  tags?: string[];
  zone?: ParkZone;
  /** Lifecycle status — affects demand and crowd levels */
  attractionStatus?: AttractionStatusMeta;
  /** Scheduled show times (e.g. ["3:00 PM", "9:00 PM"]) — for parades, fireworks, timed shows */
  scheduledTimes?: string[];
}

export const attractionStatusLabels: Record<AttractionStatus, string> = {
  "operating": "Operating",
  "new": "Brand New",
  "recently-opened": "Recently Opened",
  "closing-permanently": "Closing Soon",
  "being-reimagined": "Being Reimagined",
  "refurbishment": "Refurbishment",
  "seasonal": "Seasonal",
};

export const crowdImpactLabels: Record<string, { label: string; color: string }> = {
  "extreme": { label: "Extreme Demand", color: "destructive" },
  "high": { label: "High Demand", color: "destructive" },
  "moderate": { label: "Elevated Crowds", color: "gold-dark" },
  "none": { label: "Normal", color: "muted-foreground" },
};

export type ParkZone =
  | "main-street" | "adventureland" | "frontierland" | "liberty-square" | "fantasyland" | "tomorrowland"
  | "future-world-east" | "future-world-west" | "world-showcase"
  | "resort" | "unknown";

/** Walking time in minutes between zones. Keys are sorted alphabetically: `${zoneA}::${zoneB}` */
const _walkMatrix: Record<string, number> = {
  // Magic Kingdom
  "adventureland::main-street": 8,
  "adventureland::frontierland": 5,
  "adventureland::liberty-square": 7,
  "adventureland::fantasyland": 10,
  "adventureland::tomorrowland": 12,
  "frontierland::main-street": 10,
  "frontierland::liberty-square": 4,
  "frontierland::fantasyland": 8,
  "frontierland::tomorrowland": 14,
  "liberty-square::main-street": 9,
  "fantasyland::liberty-square": 5,
  "liberty-square::tomorrowland": 12,
  "fantasyland::main-street": 8,
  "fantasyland::tomorrowland": 8,
  "main-street::tomorrowland": 6,
  // EPCOT
  "future-world-east::future-world-west": 8,
  "future-world-east::world-showcase": 12,
  "future-world-west::world-showcase": 10,
};

const DEFAULT_WALK_MIN = 8;
const STROLLER_MULTIPLIER = 1.35;

/** Get walking buffer in minutes between two zones, with optional stroller multiplier */
export function getWalkBuffer(from: ParkZone | undefined, to: ParkZone | undefined, hasStroller: boolean): number {
  if (!from || !to || from === to) {
    return Math.round((hasStroller ? DEFAULT_WALK_MIN * STROLLER_MULTIPLIER : DEFAULT_WALK_MIN));
  }
  const key1 = `${from}::${to}`;
  const key2 = `${to}::${from}`;
  const base = _walkMatrix[key1] ?? _walkMatrix[key2] ?? DEFAULT_WALK_MIN;
  return Math.round(hasStroller ? base * STROLLER_MULTIPLIER : base);
}

/** Duration defaults when no data available */
export const DURATION_DEFAULTS: Record<string, number> = {
  ride: 20,
  meal: 60,
  break: 30,
  show: 45,
  snack: 15,
  pool: 90,
  hotel: 60,
  walk: 20,
  character: 20,
  parade: 30,
  seasonal: 60,
  dining: 60,
  "rope-drop": 30,
};

export interface ItineraryItem {
  id: string;
  attractionId?: string;
  name: string;
  type: "ride" | "show" | "parade" | "character" | "dining" | "seasonal" | "break" | "snack" | "pool" | "hotel" | "meal" | "rope-drop" | "walk";
  duration: number; // minutes
  waitTime?: number; // minutes
  zone?: ParkZone;
  llType?: LLType;
  waitCategory?: WaitCategory;
  notes?: string;
  isConfirmed?: boolean;
}

/** Computed ribbon item — produced by the ribbon engine */
export interface RibbonItem {
  item: ItineraryItem;
  startMin: number;
  endMin: number;
  walkBuffer: number;
  checkinTime: number;
  strollerTime: number;
  totalBlockMin: number;
}

export const magicKingdomAttractions: ParkAttraction[] = [
  {
    id: "mk-tron", name: "TRON Lightcycle / Run", parkId: "mk", type: "ride", rating: 4.8,
    duration: "2 MIN", heightRequirement: "48 IN", thrillLevel: "high", environment: "INDOOR/OUTDOOR",
    llType: "ll-single", waitCategory: "ill-required",
    description: "High-speed indoor/outdoor motorcycle-style coaster.",
    notableInsight: "Intense Launch",
    rules: ["DAS", "EARLY MORNING ACCESS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: ["LOUD NOISES", "STROBES"],
    attractionStatus: { status: "recently-opened", label: "Recently Opened", note: "Opened April 2023 — still drawing massive crowds", crowdImpact: "high" },
    zone: "tomorrowland",
  },
  {
    id: "mk-space", name: "Space Mountain", parkId: "mk", type: "ride", rating: 4.6,
    duration: "3 MIN", heightRequirement: "44 IN", thrillLevel: "moderate", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Classic indoor coaster hurtling through the dark cosmos.",
    notableInsight: "Classic Coaster",
    rules: ["DAS", "EARLY MORNING ACCESS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: ["LOUD NOISES", "STROBES"],
    zone: "tomorrowland",
  },
  {
    id: "mk-sdmt", name: "Seven Dwarfs Mine Train", parkId: "mk", type: "ride", rating: 4.7,
    duration: "3 MIN", heightRequirement: "38 IN", thrillLevel: "moderate", environment: "INDOOR/OUTDOOR",
    llType: "ll-single", waitCategory: "ill-required",
    description: "Swinging family coaster through the dwarf mine.",
    notableInsight: "Best for Families",
    rules: ["DAS", "EARLY MORNING ACCESS", "CHILD SWITCH"],
    warnings: [],
    zone: "fantasyland",
  },
  {
    id: "mk-peter", name: "Peter Pan's Flight", parkId: "mk", type: "ride", rating: 4.5,
    duration: "3 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-2", waitCategory: "hard-to-get",
    description: "Gentle dark ride soaring over London and Neverland.",
    notableInsight: "Classic Magic",
    rules: ["DAS", "EARLY MORNING ACCESS"],
    warnings: [],
    zone: "fantasyland",
  },
  {
    id: "mk-haunted", name: "Haunted Mansion", parkId: "mk", type: "ride", rating: 4.8,
    duration: "9 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "999 happy haunts lurk in this iconic dark ride.",
    notableInsight: "All-Ages Classic",
    rules: ["DAS"],
    warnings: ["LOUD NOISES", "STROBES"],
    zone: "liberty-square",
  },
  {
    id: "mk-btmr", name: "Big Thunder Mountain Railroad", parkId: "mk", type: "ride", rating: 4.6,
    duration: "4 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "OUTDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on-am",
    description: "Wildest ride in the wilderness — outdoor mine coaster.",
    notableInsight: "Good AM Ride",
    rules: ["DAS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: [],
    zone: "frontierland",
  },
  {
    id: "mk-tianas", name: "Tiana's Bayou Adventure", parkId: "mk", type: "ride", rating: 4.4,
    duration: "9 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "OUTDOOR/INDOOR",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Log flume celebrating the spirit of New Orleans. Reimagined from Splash Mountain.",
    notableInsight: "Gets You Wet",
    rules: ["DAS", "CHILD SWITCH"],
    warnings: [],
    attractionStatus: { status: "new", label: "Brand New", note: "Opened June 2024 — replaced Splash Mountain. Expect extreme waits.", crowdImpact: "extreme" },
    zone: "frontierland",
  },
  {
    id: "mk-pirates", name: "Pirates of the Caribbean", parkId: "mk", type: "ride", rating: 4.7,
    duration: "15 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Classic boat ride through the golden age of piracy.",
    notableInsight: "Long Length",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
    zone: "adventureland",
  },
  {
    id: "mk-jungle", name: "Jungle Cruise", parkId: "mk", type: "ride", rating: 4.5,
    duration: "10 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Skipper-led boat tour with audio-animatronic animals and dad jokes.",
    notableInsight: "Great for Kids",
    rules: ["DAS"],
    warnings: [],
    zone: "adventureland",
  },
  {
    id: "mk-undersea", name: "Under the Sea", parkId: "mk", type: "ride", rating: 4.2,
    duration: "6 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "fast-walk-on",
    description: "Musical journey through the Little Mermaid story.",
    notableInsight: "Omnimover",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
    zone: "fantasyland",
  },
  {
    id: "mk-buzz", name: "Buzz Lightyear Space Ranger Spin", parkId: "mk", type: "ride", rating: 4.3,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Interactive dark ride — blast targets to score points.",
    notableInsight: "Interactive",
    rules: ["DAS"],
    warnings: ["STROBES"],
    zone: "tomorrowland",
  },
  {
    id: "mk-railroad", name: "Walt Disney World Railroad", parkId: "mk", type: "ride", rating: 4.1,
    duration: "20 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Scenic steam train circling the park perimeter.",
    notableInsight: "Rest Your Feet",
    rules: ["DAS"],
    warnings: [],
    isClosed: true,
    attractionStatus: { status: "refurbishment", label: "Refurbishment", note: "Closed for track maintenance. Expected return: TBD.", crowdImpact: "none" },
    zone: "main-street",
  },
  {
    id: "mk-small-world", name: "It's a Small World", parkId: "mk", type: "ride", rating: 4.0,
    duration: "11 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Classic boat ride celebrating the children of the world.",
    notableInsight: "Holiday Version Dec",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
    zone: "fantasyland",
  },
  {
    id: "mk-pooh", name: "The Many Adventures of Winnie the Pooh", parkId: "mk", type: "ride", rating: 4.2,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Gentle ride through the Hundred Acre Wood.",
    notableInsight: "Toddler Fave",
    rules: ["DAS"],
    warnings: [],
    zone: "fantasyland",
  },
  {
    id: "mk-teacups", name: "Mad Tea Party", parkId: "mk", type: "ride", rating: 3.8,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "moderate", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Spinning teacup ride — control the spin yourself.",
    notableInsight: "Spinning",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
    zone: "fantasyland",
  },
  {
    id: "mk-dumbo", name: "Dumbo the Flying Elephant", parkId: "mk", type: "ride", rating: 4.1,
    duration: "2 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Classic aerial ride that's a must for young children.",
    notableInsight: "Toddler Must-Do",
    rules: ["DAS"],
    warnings: [],
    zone: "fantasyland",
  },
  // Shows
  {
    id: "mk-fof", name: "Festival of Fantasy Parade", parkId: "mk", type: "parade", rating: 4.7,
    duration: "12 MIN", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Dazzling daytime parade through the Magic Kingdom.",
    notableInsight: "Stake Out a Spot 20 Min Early",
    rules: [],
    warnings: [],
    zone: "main-street",
    scheduledTimes: ["12:00 PM", "3:00 PM"],
  },
  {
    id: "mk-hea", name: "Happily Ever After", parkId: "mk", type: "show", rating: 4.9,
    duration: "18 MIN", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Fireworks and projection spectacular at Cinderella Castle.",
    notableInsight: "Dessert Party Available",
    rules: [],
    warnings: ["LOUD NOISES"],
    zone: "main-street",
    scheduledTimes: ["9:00 PM"],
  },
  {
    id: "mk-laugh-floor", name: "Monsters Inc. Laugh Floor", parkId: "mk", type: "show", rating: 4.3,
    duration: "15 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Interactive comedy show starring Mike Wazowski.",
    notableInsight: "Audience Participation",
    rules: ["DAS"],
    warnings: [],
    zone: "tomorrowland",
  },
  // Characters
  {
    id: "mk-mickey-meet", name: "Meet Mickey at Town Square", parkId: "mk", type: "character", rating: 4.6,
    duration: "5 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Classic meet-and-greet with the big cheese himself.",
    notableInsight: "Photo + Autograph",
    rules: [],
    warnings: [],
    zone: "main-street",
  },
  {
    id: "mk-princess-meet", name: "Princess Fairytale Hall", parkId: "mk", type: "character", rating: 4.5,
    duration: "10 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "hard-to-get",
    description: "Meet Cinderella, Rapunzel, Tiana, and other royalty.",
    notableInsight: "Rotating Princesses",
    rules: [],
    warnings: [],
    zone: "fantasyland",
  },
  {
    id: "mk-belle-tales", name: "Enchanted Tales with Belle", parkId: "mk", type: "character", rating: 4.6,
    duration: "20 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Interactive storytelling experience inside Beast's castle library.",
    notableInsight: "Kids Get Roles",
    rules: [],
    warnings: [],
    zone: "fantasyland",
  },
  // Seasonal
  {
    id: "mk-spring-party", name: "Spring After Hours Event", parkId: "mk", type: "seasonal", rating: 4.4,
    duration: "180 MIN", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Special ticketed after-hours event with low wait times and exclusive entertainment.",
    notableInsight: "Separate Ticket Required",
    rules: [],
    warnings: [],
    tags: ["TICKETED", "LIMITED"],
    zone: "main-street",
  },
];

export const epcotAttractions: ParkAttraction[] = [
  {
    id: "ep-guardians", name: "Guardians of the Galaxy: Cosmic Rewind", parkId: "epcot", type: "ride", rating: 4.8,
    duration: "3 MIN", heightRequirement: "42 IN", thrillLevel: "high", environment: "INDOOR, DARK",
    llType: "ll-single", waitCategory: "ill-required",
    description: "Reverse-launch indoor coaster with a killer soundtrack.",
    notableInsight: "Virtual Queue or ILL",
    rules: ["DAS", "CHILD SWITCH"],
    warnings: ["LOUD NOISES", "STROBES"],
    attractionStatus: { status: "recently-opened", label: "Recently Opened", note: "Still one of the hardest-to-ride attractions at WDW", crowdImpact: "high" },
    zone: "future-world-east",
  },
  {
    id: "ep-frozen", name: "Frozen Ever After", parkId: "epcot", type: "ride", rating: 4.5,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Boat ride through Arendelle with Anna and Elsa.",
    notableInsight: "Best for Elsa Fans",
    rules: ["DAS"],
    warnings: [],
    zone: "world-showcase",
  },
  {
    id: "ep-test-track", name: "Test Track", parkId: "epcot", type: "ride", rating: 4.5,
    duration: "5 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "INDOOR/OUTDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on-am",
    description: "Design a virtual car and take it for a 65 mph spin.",
    notableInsight: "Design Phase is Fun",
    rules: ["DAS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: [],
    zone: "future-world-east",
  },
  {
    id: "ep-remy", name: "Remy's Ratatouille Adventure", parkId: "epcot", type: "ride", rating: 4.4,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "Trackless ride shrunk to rat-sized in Gusteau's kitchen.",
    notableInsight: "No Height Req",
    rules: ["DAS"],
    warnings: [],
    zone: "world-showcase",
  },
  {
    id: "ep-soarin", name: "Soarin' Around the World", parkId: "epcot", type: "ride", rating: 4.6,
    duration: "5 MIN", heightRequirement: "40 IN", thrillLevel: "mild", environment: "INDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "Hang-gliding flight over world landmarks with scents and wind.",
    notableInsight: "Request Row 1",
    rules: ["DAS"],
    warnings: [],
    zone: "future-world-west",
  },
  {
    id: "ep-spaceship-earth", name: "Spaceship Earth", parkId: "epcot", type: "ride", rating: 4.3,
    duration: "15 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Journey through the history of human communication inside the iconic sphere.",
    notableInsight: "Rainy Day Classic",
    rules: ["DAS"],
    warnings: [],
    zone: "future-world-east",
  },
  {
    id: "ep-living-seas", name: "The Seas with Nemo & Friends", parkId: "epcot", type: "ride", rating: 4.0,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "fast-walk-on",
    description: "Clamshell ride through an underwater adventure, then explore the aquarium.",
    notableInsight: "Aquarium Worth Lingering",
    rules: ["DAS"],
    warnings: [],
    zone: "future-world-west",
  },
  // Shows
  {
    id: "ep-harmonious", name: "EPCOT Forever / Luminous", parkId: "epcot", type: "show", rating: 4.6,
    duration: "15 MIN", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Nighttime spectacular on World Showcase Lagoon.",
    notableInsight: "Best View from Japan/Italy",
    rules: [],
    warnings: ["LOUD NOISES"],
    zone: "world-showcase",
    scheduledTimes: ["9:00 PM"],
  },
  // Characters
  {
    id: "ep-anna-elsa", name: "Meet Anna & Elsa", parkId: "epcot", type: "character", rating: 4.7,
    duration: "5 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "hard-to-get",
    description: "Royal meet-and-greet with the sisters of Arendelle in the Norway pavilion.",
    notableInsight: "Long Waits — Go Early",
    rules: [],
    warnings: [],
    zone: "world-showcase",
  },
  // Seasonal
  {
    id: "ep-flower-garden", name: "Flower & Garden Festival", parkId: "epcot", type: "seasonal", rating: 4.5,
    duration: "All Day", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Topiaries, garden exhibits, and outdoor kitchens with festival-exclusive bites.",
    notableInsight: "Food Booths Open at 11 AM",
    rules: [],
    warnings: [],
    tags: ["FESTIVAL", "FOOD"],
    zone: "world-showcase",
  },
];

export const allParkAttractions: Record<string, ParkAttraction[]> = {
  mk: magicKingdomAttractions,
  epcot: epcotAttractions,
};

export const parkLabels: Record<string, string> = {
  mk: "Magic Kingdom",
  epcot: "EPCOT",
  hs: "Hollywood Studios",
  ak: "Animal Kingdom",
};

export const typeLabels: Record<AttractionType, string> = {
  ride: "Ride",
  show: "Show",
  parade: "Parade",
  character: "Character",
  dining: "Dining",
  seasonal: "Seasonal",
};

export const llLabels: Record<LLType, string> = {
  "ll-multi-1": "LL Multi Pass Tier 1",
  "ll-multi-2": "LL Multi Pass Tier 2",
  "ll-single": "LL Single Pass",
  "standby-only": "Standby Only",
  "none": "",
};

export const waitLabels: Record<WaitCategory, string> = {
  "walk-on": "Walk-On",
  "walk-on-am": "Walk-On AM",
  "fast-walk-on": "Fast Walk-On",
  "hard-to-get": "Hard to Get LL",
  "ill-required": "ILL Required",
};

// Default sample itinerary for Magic Kingdom (ribbon model — no startTime)
export const sampleItinerary: ItineraryItem[] = [
  { id: "it-1", name: "Rope Drop Arrival", type: "rope-drop", duration: 30, zone: "main-street", notes: "ARRIVE 45 MINS EARLY" },
  { id: "it-2", attractionId: "mk-tron", name: "TRON Lightcycle / Run", type: "ride", duration: 2, waitTime: 60, zone: "tomorrowland", llType: "ll-single", waitCategory: "ill-required" },
  { id: "it-3", attractionId: "mk-space", name: "Space Mountain", type: "ride", duration: 3, waitTime: 10, zone: "tomorrowland", llType: "ll-multi-1", waitCategory: "hard-to-get" },
  { id: "it-4", attractionId: "mk-sdmt", name: "Seven Dwarfs Mine Train", type: "ride", duration: 3, waitTime: 5, zone: "fantasyland", llType: "ll-single", waitCategory: "ill-required" },
  { id: "it-5", name: "Lunch at Be Our Guest", type: "meal", duration: 60, zone: "fantasyland", isConfirmed: true, notes: "RESERVATION CONFIRMED" },
  { id: "it-6", attractionId: "mk-haunted", name: "Haunted Mansion", type: "ride", duration: 9, waitTime: 20, zone: "liberty-square", waitCategory: "walk-on" },
  { id: "it-7", name: "Hotel Nap / Pool Time", type: "break", duration: 90, zone: "resort", notes: "Recharge at the resort" },
  { id: "it-8", attractionId: "mk-btmr", name: "Big Thunder Mountain", type: "ride", duration: 4, waitTime: 15, zone: "frontierland", llType: "ll-multi-1", waitCategory: "walk-on-am" },
  { id: "it-9", name: "Happily Ever After", type: "show", duration: 18, waitTime: 30, zone: "main-street", notes: "DESSERT PARTY" },
];
