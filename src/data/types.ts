/* ─── Domain Types ───────────────────────────────────────────────
 * All data structures used across pages. Variable names are
 * semantic so they map 1:1 to a future backend API response.
 * ────────────────────────────────────────────────────────────── */

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

export interface Whisper {
  tip: string;
  date: string;
}

export interface GalleryImage {
  title: string;
  label: string;
  src: string;
  gridSpan: string;
}

export interface Subscription {
  planName: string;
  planDescription: string;
  status: "active" | "inactive" | "trial";
}

export interface ProfileField {
  label: string;
  value: string;
}

export interface Preference {
  label: string;
  value: string;
}

export interface ActiveItinerary {
  destination: string;
  tripName: string;
  countdownDays: number;
  partySize: number;
  strategistCount: number;
  description: string;
  heroImage: string;
  todaysPark: ParkConditions;
  timeReclaimed: string;
  ridesSaved: RideTimeSaved[];
  travelLegs: TravelLeg[];
  preparations: PreparationItem[];
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
  activeItinerary: ActiveItinerary;
  partyMembers: PartyMember[];
  whispers: Whisper[];
  galleryImages: GalleryImage[];
  account: AccountProfile;
}
