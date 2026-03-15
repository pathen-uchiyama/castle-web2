/* ─── Mock Data ──────────────────────────────────────────────────
 * Placeholder data that mirrors the shape of a future API
 * response. Every value previously hard-coded in components
 * now lives here and is passed down via props.
 * ─────────────────────────────────────────────────────────────── */

import castleHero from "@/assets/castle-hero.jpg";
import castleGolden from "@/assets/castle-golden.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import travelFlatlay from "@/assets/travel-flatlay.jpg";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import type { AppData } from "./types";

export const mockData: AppData = {
  guestName: "Patchen",

  activeItinerary: {
    destination: "Walt Disney World",
    tripName: "Spring Break 2026",
    countdownDays: 6,
    partySize: 4,
    strategistCount: 3,
    description:
      "Four parks, six days, one family. Your strategists are at work — the Lightning Lanes are yours.",
    heroImage: castleGolden,

    todaysPark: {
      parkName: "Magic Kingdom",
      weather: "78°F, clear skies",
      crowdLevel: "Moderate",
      strategy: "Rope-drop Tron, evening at Tomorrowland",
    },

    timeReclaimed: "4h 35m",
    ridesSaved: [
      { rideName: "Tron Lightcycle / Run", minutesSaved: "95 min", emoji: "⚡" },
      { rideName: "Rise of the Resistance", minutesSaved: "82 min", emoji: "✦" },
      { rideName: "Flight of Passage", minutesSaved: "70 min", emoji: "🌿" },
    ],

    travelLegs: [
      { legName: "Home → MCO", date: "March 21", time: "8:45 AM", note: "The adventure begins at the gate." },
      { legName: "Resort Check-in", date: "March 21", time: "3:00 PM", note: "Contemporary Resort, Garden Wing." },
      { legName: "MCO → Home", date: "March 28", time: "6:30 PM", note: "One last churro at the airport." },
    ],

    preparations: [
      { description: "Park reservations booked — all four parks with extended evening hours.", isComplete: true },
      { description: "Dining confirmed — Be Our Guest, Ohana, Space 220, Topolino's.", isComplete: true },
      { description: "Lightning Lane strategy optimized with backup plans.", isComplete: true },
      { description: "Packing list under review.", isComplete: false },
      { description: "PhotoPass and MagicBand+ setup for the entire party.", isComplete: false },
    ],
  },

  partyMembers: [
    { name: "Patchen", role: "Trip Captain", initial: "P", adventureCount: 12 },
    { name: "Sarah", role: "Co-planner", initial: "S", adventureCount: 12 },
    { name: "Emma", role: "Little Explorer", initial: "E", adventureCount: 8 },
    { name: "Jack", role: "Snack Scout", initial: "J", adventureCount: 8 },
  ],

  whispers: [
    { tip: "The hidden Mickey in the Haunted Mansion queue — look at the wallpaper near the stretching room.", date: "March 14" },
    { tip: "Best fireworks spot: the rose garden by Casey's Corner. Arrive early with a blanket.", date: "March 12" },
    { tip: "Ask for the secret orange swirl float at the Dole Whip stand. Not on the menu.", date: "March 10" },
  ],

  galleryImages: [
    { title: "Castle at Golden Hour", label: "Magic Kingdom", src: castleGolden, gridSpan: "col-span-4 row-span-2" },
    { title: "Family on Main Street", label: "Day One", src: familyMainstreet, gridSpan: "col-span-2 row-span-1" },
    { title: "Fireworks Finale", label: "Happily Ever After", src: fireworksNight, gridSpan: "col-span-2 row-span-1" },
    { title: "Travel Essentials", label: "The Trunk", src: travelFlatlay, gridSpan: "col-span-3 row-span-1" },
    { title: "The Grand Entrance", label: "Day One", src: castleHero, gridSpan: "col-span-3 row-span-1" },
  ],

  account: {
    guestName: "Patchen Noelke",
    email: "patchen@example.com",
    memberSince: "January 2024",
    adventuresCompleted: 12,
    subscription: {
      planName: "Royal Charter",
      planDescription: "Unlimited adventures · Priority Lightning Lane · Family sync",
      status: "active",
    },
    preferences: [
      { label: "Notifications", value: "Lightning Lane alerts, dining reminders" },
      { label: "Default party", value: "The Noelke Four" },
      { label: "Home park", value: "Magic Kingdom" },
    ],
  },
};
