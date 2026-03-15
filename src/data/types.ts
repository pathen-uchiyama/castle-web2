/* ─── Domain Types ───────────────────────────────────────────────
 * Semantic variable names ready for backend API mapping.
 * ─────────────────────────────────────────────────────────────── */

export type Resort = "wdw" | "dlr";

export interface ParkGuideCategory {
  label: string;
  description: string;
  itemCount: number;
}

export interface ParkGuide {
  parkId: string;
  parkName: string;
  resort: Resort;
  resortName: string;
  typicalWeather: string;
  crowdCalendarSummary: string;
  categories: ParkGuideCategory[];
  heroImage: string;
  todayWeather: string;
  todayCrowdLevel: string;
  operatingHours: string;
}

export interface PartyMember {
  name: string;
  role: string;
  initial: string;
  adventureCount: number;
}

export interface RideTimeSaved {
  rideName: string;
  minutesSaved: string;
  emoji: string;
}

export interface TravelLeg {
  legName: string;
  date: string;
  time: string;
  note: string;
}

export interface ParkConditions {
  parkName: string;
  weather: string;
  crowdLevel: string;
  strategy: string;
}

export interface PreparationItem {
  description: string;
  isComplete: boolean;
}

export interface PackingItem {
  category: string;
  items: string[];
  packedCount: number;
  totalCount: number;
}

export interface BookedTrip {
  tripId: string;
  destination: string;
  tripName: string;
  countdownDays: number;
  partySize: number;
  description: string;
  heroImage: string;
  resort: Resort;
  todaysPark: ParkConditions;
  timeReclaimed: string;
  ridesSaved: RideTimeSaved[];
  travelLegs: TravelLeg[];
  preparations: PreparationItem[];
  packingLists: PackingItem[];
}

export interface FutureTrip {
  tripId: string;
  destination: string;
  tripName: string;
  tentativeDate: string;
  status: "dreaming" | "planning" | "booking";
  heroImage: string;
  note: string;
}

export interface TripMemory {
  tripId: string;
  destination: string;
  tripName: string;
  date: string;
  coverImage: string;
  photoCount: number;
  gridSpan: string;
  highlights: string[];
}

export interface Subscription {
  planName: string;
  planDescription: string;
  status: "active" | "inactive" | "trial";
}

export interface Preference {
  label: string;
  value: string;
}

export interface AccountProfile {
  guestName: string;
  email: string;
  memberSince: string;
  adventuresCompleted: number;
  subscription: Subscription;
  preferences: Preference[];
}

export interface AppData {
  guestName: string;
  bookedTrip: BookedTrip;
  futureTrips: FutureTrip[];
  parkGuides: ParkGuide[];
  partyMembers: PartyMember[];
  tripMemories: TripMemory[];
  account: AccountProfile;
}
