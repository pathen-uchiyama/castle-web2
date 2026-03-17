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
  accessibilityNeeds?: string[];
  favoriteCharacter?: string;
  favoriteRide?: string;
  thrillTolerance?: "low" | "moderate" | "high";
  magicStatus?: string[];
  notes?: string;
  lastUpdated?: string;
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
  timeRangeEnd?: string;
  partySize: number;
  confirmationNumber: string;
  cuisine: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
  dietaryFlags?: string[];
  status: "confirmed" | "pending" | "cancelled";
  monitoringActive?: boolean;
  /** Links this dining to a scheduled show (e.g. dessert party → fireworks) */
  linkedShowId?: string;
}

export type ExperienceCategory = "character-meet" | "tour" | "special-event" | "recreation" | "spa" | "photo-session";

export interface BookedExperience {
  experienceId: string;
  experienceName: string;
  category: ExperienceCategory;
  parkOrResort: string;
  date: string;
  time: string;
  timeRangeEnd?: string;
  duration?: string;
  partySize: number;
  confirmationNumber: string;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
  monitoringActive?: boolean;
}

/* ─── Discovery / Research Types ────────────────────────────────── */

export type CostTier = "$" | "$$" | "$$$" | "$$$$";
export type BookingDifficulty = "easy" | "moderate" | "hard" | "legendary";

export interface BookingWindow {
  opensDate: string;
  daysBeforeArrival: number;
  tip: string;
}

export interface DiningVenue {
  venueId: string;
  name: string;
  parkOrResort: string;
  cuisine: string;
  mealTypes: ("breakfast" | "lunch" | "dinner" | "snack")[];
  costTier: CostTier;
  rating: number;
  reviewCount: number;
  bookingDifficulty: BookingDifficulty;
  bookingWindow: BookingWindow;
  vibes: string;
  notableInsight: string;
  mustTry?: string;
  dietaryAccommodations: string[];
  kidFriendly: boolean;
  characterDining: boolean;
  tags: string[];
}

export interface ExperienceVenue {
  venueId: string;
  name: string;
  category: ExperienceCategory;
  parkOrResort: string;
  costTier: CostTier;
  priceRange: string;
  rating: number;
  reviewCount: number;
  bookingDifficulty: BookingDifficulty;
  bookingWindow: BookingWindow;
  duration: string;
  vibes: string;
  notableInsight: string;
  ageRequirement?: string;
  heightRequirement?: string;
  maxPartySize?: number;
  tags: string[];
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
  startDate: string;
  endDate: string;
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
  bookedExperiences: BookedExperience[];
  diningVenues: DiningVenue[];
  experienceVenues: ExperienceVenue[];
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

export type RideSensitivity = "thrill-rides" | "spinning" | "dark-rides" | "drops" | "loud-noises" | "quick-starts" | "heights" | "motion-simulation";

export interface GuestHealthProfile {
  age?: number;
  heightInches?: number;
  allergies: string[];
  dietaryRestrictions: string[];
  dasHolder: boolean;
  medicalNotes?: string;
}

export interface RidePreferences {
  sensitivities: RideSensitivity[];
  thrillTolerance: "low" | "moderate" | "high";
}

export interface PaymentMethod {
  cardId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface AccountProfile {
  guestName: string;
  email: string;
  memberSince: string;
  adventuresCompleted: number;
  subscription: Subscription;
  preferences: Preference[];
  healthProfile: GuestHealthProfile;
  ridePreferences: RidePreferences;
  paymentMethods: PaymentMethod[];
}

export type AttractionCategory = "ride" | "show" | "character" | "dining" | "parade" | "experience";

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
