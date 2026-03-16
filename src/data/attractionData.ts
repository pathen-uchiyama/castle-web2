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
  /** Lifecycle status — affects demand and crowd levels */
  attractionStatus?: AttractionStatusMeta;
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

export interface ItineraryItem {
  id: string;
  attractionId?: string;
  name: string;
  type: "ride" | "show" | "parade" | "character" | "dining" | "seasonal" | "break" | "snack" | "pool" | "hotel" | "meal" | "rope-drop" | "walk";
  startTime: string; // "07:00 AM"
  duration: number; // minutes
  walkTime?: number; // minutes to next
  waitTime?: number; // minutes
  llType?: LLType;
  waitCategory?: WaitCategory;
  notes?: string;
  isConfirmed?: boolean;
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
  },
  {
    id: "mk-space", name: "Space Mountain", parkId: "mk", type: "ride", rating: 4.6,
    duration: "3 MIN", heightRequirement: "44 IN", thrillLevel: "moderate", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Classic indoor coaster hurtling through the dark cosmos.",
    notableInsight: "Classic Coaster",
    rules: ["DAS", "EARLY MORNING ACCESS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: ["LOUD NOISES", "STROBES"],
  },
  {
    id: "mk-sdmt", name: "Seven Dwarfs Mine Train", parkId: "mk", type: "ride", rating: 4.7,
    duration: "3 MIN", heightRequirement: "38 IN", thrillLevel: "moderate", environment: "INDOOR/OUTDOOR",
    llType: "ll-single", waitCategory: "ill-required",
    description: "Swinging family coaster through the dwarf mine.",
    notableInsight: "Best for Families",
    rules: ["DAS", "EARLY MORNING ACCESS", "CHILD SWITCH"],
    warnings: [],
  },
  {
    id: "mk-peter", name: "Peter Pan's Flight", parkId: "mk", type: "ride", rating: 4.5,
    duration: "3 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-2", waitCategory: "hard-to-get",
    description: "Gentle dark ride soaring over London and Neverland.",
    notableInsight: "Classic Magic",
    rules: ["DAS", "EARLY MORNING ACCESS"],
    warnings: [],
  },
  {
    id: "mk-haunted", name: "Haunted Mansion", parkId: "mk", type: "ride", rating: 4.8,
    duration: "9 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "999 happy haunts lurk in this iconic dark ride.",
    notableInsight: "All-Ages Classic",
    rules: ["DAS"],
    warnings: ["LOUD NOISES", "STROBES"],
  },
  {
    id: "mk-btmr", name: "Big Thunder Mountain Railroad", parkId: "mk", type: "ride", rating: 4.6,
    duration: "4 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "OUTDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on-am",
    description: "Wildest ride in the wilderness — outdoor mine coaster.",
    notableInsight: "Good AM Ride",
    rules: ["DAS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: [],
  },
  {
    id: "mk-tianas", name: "Tiana's Bayou Adventure", parkId: "mk", type: "ride", rating: 4.4,
    duration: "9 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "OUTDOOR/INDOOR",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Log flume celebrating the spirit of New Orleans.",
    notableInsight: "Gets You Wet",
    rules: ["DAS", "CHILD SWITCH"],
    warnings: [],
  },
  {
    id: "mk-pirates", name: "Pirates of the Caribbean", parkId: "mk", type: "ride", rating: 4.7,
    duration: "15 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Classic boat ride through the golden age of piracy.",
    notableInsight: "Long Length",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
  },
  {
    id: "mk-jungle", name: "Jungle Cruise", parkId: "mk", type: "ride", rating: 4.5,
    duration: "10 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Skipper-led boat tour with audio-animatronic animals and dad jokes.",
    notableInsight: "Great for Kids",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "mk-undersea", name: "Under the Sea", parkId: "mk", type: "ride", rating: 4.2,
    duration: "6 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "fast-walk-on",
    description: "Musical journey through the Little Mermaid story.",
    notableInsight: "Omnimover",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
  },
  {
    id: "mk-buzz", name: "Buzz Lightyear Space Ranger Spin", parkId: "mk", type: "ride", rating: 4.3,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Interactive dark ride — blast targets to score points.",
    notableInsight: "Interactive",
    rules: ["DAS"],
    warnings: ["STROBES"],
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
  },
  {
    id: "mk-small-world", name: "It's a Small World", parkId: "mk", type: "ride", rating: 4.0,
    duration: "11 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Classic boat ride celebrating the children of the world.",
    notableInsight: "Holiday Version Dec",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
  },
  {
    id: "mk-pooh", name: "The Many Adventures of Winnie the Pooh", parkId: "mk", type: "ride", rating: 4.2,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Gentle ride through the Hundred Acre Wood.",
    notableInsight: "Toddler Fave",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "mk-teacups", name: "Mad Tea Party", parkId: "mk", type: "ride", rating: 3.8,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "moderate", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Spinning teacup ride — control the spin yourself.",
    notableInsight: "Spinning",
    rules: ["DAS"],
    warnings: ["LOUD NOISES"],
  },
  {
    id: "mk-dumbo", name: "Dumbo the Flying Elephant", parkId: "mk", type: "ride", rating: 4.1,
    duration: "2 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Classic aerial ride that's a must for young children.",
    notableInsight: "Toddler Must-Do",
    rules: ["DAS"],
    warnings: [],
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
  },
  {
    id: "mk-hea", name: "Happily Ever After", parkId: "mk", type: "show", rating: 4.9,
    duration: "18 MIN", thrillLevel: "mild", environment: "OUTDOOR",
    llType: "none", waitCategory: "walk-on",
    description: "Fireworks and projection spectacular at Cinderella Castle.",
    notableInsight: "Dessert Party Available",
    rules: [],
    warnings: ["LOUD NOISES"],
  },
  {
    id: "mk-laugh-floor", name: "Monsters Inc. Laugh Floor", parkId: "mk", type: "show", rating: 4.3,
    duration: "15 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "walk-on",
    description: "Interactive comedy show starring Mike Wazowski.",
    notableInsight: "Audience Participation",
    rules: ["DAS"],
    warnings: [],
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
  },
  {
    id: "mk-princess-meet", name: "Princess Fairytale Hall", parkId: "mk", type: "character", rating: 4.5,
    duration: "10 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-2", waitCategory: "hard-to-get",
    description: "Meet Cinderella, Rapunzel, Tiana, and other royalty.",
    notableInsight: "Rotating Princesses",
    rules: [],
    warnings: [],
  },
  {
    id: "mk-belle-tales", name: "Enchanted Tales with Belle", parkId: "mk", type: "character", rating: 4.6,
    duration: "20 MIN", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Interactive storytelling experience inside Beast's castle library.",
    notableInsight: "Kids Get Roles",
    rules: [],
    warnings: [],
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
  },
  {
    id: "ep-frozen", name: "Frozen Ever After", parkId: "epcot", type: "ride", rating: 4.5,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR, DARK",
    llType: "ll-multi-1", waitCategory: "hard-to-get",
    description: "Boat ride through Arendelle with Anna and Elsa.",
    notableInsight: "Best for Elsa Fans",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "ep-test-track", name: "Test Track", parkId: "epcot", type: "ride", rating: 4.5,
    duration: "5 MIN", heightRequirement: "40 IN", thrillLevel: "moderate", environment: "INDOOR/OUTDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on-am",
    description: "Design a virtual car and take it for a 65 mph spin.",
    notableInsight: "Design Phase is Fun",
    rules: ["DAS", "SINGLE RIDER", "CHILD SWITCH"],
    warnings: [],
  },
  {
    id: "ep-remy", name: "Remy's Ratatouille Adventure", parkId: "epcot", type: "ride", rating: 4.4,
    duration: "4 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "Trackless ride shrunk to rat-sized in Gusteau's kitchen.",
    notableInsight: "No Height Req",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "ep-soarin", name: "Soarin' Around the World", parkId: "epcot", type: "ride", rating: 4.6,
    duration: "5 MIN", heightRequirement: "40 IN", thrillLevel: "mild", environment: "INDOOR",
    llType: "ll-multi-1", waitCategory: "walk-on",
    description: "Hang-gliding flight over world landmarks with scents and wind.",
    notableInsight: "Request Row 1",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "ep-spaceship-earth", name: "Spaceship Earth", parkId: "epcot", type: "ride", rating: 4.3,
    duration: "15 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "walk-on",
    description: "Journey through the history of human communication inside the iconic sphere.",
    notableInsight: "Rainy Day Classic",
    rules: ["DAS"],
    warnings: [],
  },
  {
    id: "ep-living-seas", name: "The Seas with Nemo & Friends", parkId: "epcot", type: "ride", rating: 4.0,
    duration: "5 MIN", heightRequirement: "ANY", thrillLevel: "mild", environment: "INDOOR AC",
    llType: "none", waitCategory: "fast-walk-on",
    description: "Clamshell ride through an underwater adventure, then explore the aquarium.",
    notableInsight: "Aquarium Worth Lingering",
    rules: ["DAS"],
    warnings: [],
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

// Default sample itinerary for Magic Kingdom
export const sampleItinerary: ItineraryItem[] = [
  { id: "it-1", name: "Rope Drop Arrival", type: "rope-drop", startTime: "07:00 AM", duration: 30, walkTime: 8, notes: "ARRIVE 45 MINS EARLY" },
  { id: "it-2", attractionId: "mk-space", name: "Space Mountain", type: "ride", startTime: "07:38 AM", duration: 3, waitTime: 10, walkTime: 8, llType: "ll-multi-1", waitCategory: "hard-to-get" },
  { id: "it-3", attractionId: "mk-sdmt", name: "Seven Dwarfs Mine Train", type: "ride", startTime: "07:59 AM", duration: 3, waitTime: 5, walkTime: 8, llType: "ll-single", waitCategory: "ill-required" },
  { id: "it-4", name: "Lunch at Be Our Guest", type: "meal", startTime: "08:15 AM", duration: 75, walkTime: 8, isConfirmed: true, notes: "RESERVATION CONFIRMED · ±15M WINDOW" },
  { id: "it-5", attractionId: "mk-fof", name: "Festival of Fantasy Parade", type: "parade", startTime: "09:38 AM", duration: 12, waitTime: 20, walkTime: 8, notes: "STAKE OUT A SPOT 20 MIN EARLY" },
  { id: "it-6", name: "Hotel Nap / Pool Time", type: "break", startTime: "10:18 AM", duration: 90, walkTime: 8, notes: "1–2 HRS" },
  { id: "it-7", attractionId: "mk-haunted", name: "Haunted Mansion", type: "ride", startTime: "11:56 AM", duration: 9, waitTime: 20, walkTime: 7, waitCategory: "walk-on" },
  { id: "it-8", name: "Happily Ever After", type: "show", startTime: "12:32 PM", duration: 18, waitTime: 30, notes: "DESSERT PARTY" },
];
