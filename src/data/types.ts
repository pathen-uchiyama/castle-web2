/* ─── Domain Types ───────────────────────────────────────────────
 * Semantic variable names ready for backend API mapping.
 * ─────────────────────────────────────────────────────────────── */

export type Resort = "wdw" | "dlr";

export interface ParkGuideCategory {
  label: string;
  description: string;
  itemCount: number;
}

export interface ParkHours {
  regular: string;
  earlyEntry?: string;
  extendedEvening?: string;
}

export interface ParkDaySchedule {
  date: string;
  hours: ParkHours;
  weather: string;
  crowdLevel: string;
  crowdScore: number;
  notes?: string;
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
  operatingHours: ParkHours;
  schedule: ParkDaySchedule[];
}

export interface PartyMember {
  memberId: string;
  name: string;
  role: string;
  initial: string;
  adventureCount: number;
  age?: number;
  birthday?: string;
  heightInches?: number;
  dietaryRestrictions?: string[];
  sensoryNotes?: string;
  favoriteCharacter?: string;
  favoriteRide?: string;
  thrillTolerance?: "low" | "moderate" | "high";
  magicStatus?: string[];
  notes?: string;
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

export interface DiningReservation {
  reservationId: string;
  restaurantName: string;
  parkOrResort: string;
  date: string;
  time: string;
  partySize: number;
  confirmationNumber: string;
  cuisine: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
  dietaryFlags?: string[];
  status: "confirmed" | "pending" | "cancelled";
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
  diningReservations: DiningReservation[];
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

export type AttractionCategory = "ride" | "show" | "character" | "dining";

export interface SurveyAttraction {
  attractionId: string;
  name: string;
  parkId: string;
  category: AttractionCategory;
  heightRequirement?: string;
  sensoryTags?: string[];
  description: string;
}

export type SurveyRanking = "must-do" | "like-to-do" | "will-avoid";

export interface SurveyResponse {
  memberId: string;
  memberName: string;
  rankings: Record<string, SurveyRanking>;
  openToAnything: boolean;
  topFiveMustDos: string[];
  status: "pending" | "completed";
}

export interface PartySurvey {
  tripId: string;
  attractions: SurveyAttraction[];
  responses: SurveyResponse[];
}

export interface AppData {
  guestName: string;
  bookedTrip: BookedTrip;
  futureTrips: FutureTrip[];
  parkGuides: ParkGuide[];
  partyMembers: PartyMember[];
  tripMemories: TripMemory[];
  account: AccountProfile;
  partySurvey: PartySurvey;
}
