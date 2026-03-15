import castleHero from "@/assets/castle-hero.jpg";
import castleGolden from "@/assets/castle-golden.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import editorialDining from "@/assets/editorial-dining.jpg";
import editorialCarousel from "@/assets/editorial-carousel.jpg";
import editorialNextTrip from "@/assets/editorial-next-trip.jpg";
import editorialResort from "@/assets/editorial-resort-twilight.jpg";
import editorialPacking from "@/assets/editorial-packing.jpg";
import editorialCalendar from "@/assets/editorial-calendar.jpg";
import editorialSunset from "@/assets/editorial-sunset.jpg";
import editorialFamilyWalk from "@/assets/editorial-family-walk.jpg";
import editorialJournal from "@/assets/editorial-travel-journal.jpg";
import type { AppData } from "./types";

export const mockData: AppData = {
  guestName: "Patchen",

  bookedTrip: {
    tripId: "spring-break-2026",
    destination: "Walt Disney World",
    tripName: "Spring Break 2026",
    countdownDays: 6,
    partySize: 4,
    description:
      "Four parks, six days, one family. Your strategists are at work — the Lightning Lanes are yours.",
    heroImage: castleGolden,
    resort: "wdw",

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

    packingLists: [
      { category: "Essentials", items: ["Passports", "Tickets", "Insurance docs", "Chargers"], packedCount: 3, totalCount: 4 },
      { category: "Clothing", items: ["Comfortable shoes", "Rain jackets", "Swimwear", "Layers"], packedCount: 1, totalCount: 4 },
      { category: "Park Gear", items: ["Autograph books", "Glow sticks", "Portable fan", "Ponchos"], packedCount: 0, totalCount: 4 },
    ],
  },

  futureTrips: [
    {
      tripId: "halloween-2026",
      destination: "Disneyland Resort",
      tripName: "Halloween at DLR",
      tentativeDate: "October 2026",
      status: "planning",
      heroImage: editorialNextTrip,
      note: "Oogie Boogie Bash tickets go on sale in June.",
    },
    {
      tripId: "holidays-2026",
      destination: "Walt Disney World",
      tripName: "Holiday Magic",
      tentativeDate: "December 2026",
      status: "dreaming",
      heroImage: editorialSunset,
      note: "MVMCP and Festival of the Holidays.",
    },
  ],

  parkGuides: [
    {
      parkId: "mk",
      parkName: "Magic Kingdom",
      resort: "wdw",
      resortName: "Walt Disney World",
      typicalWeather: "75–92°F, afternoon thunderstorms in summer",
      crowdCalendarSummary: "Low crowds mid-January through mid-February; peak during spring break and holidays.",
      categories: [
        { label: "Attractions", description: "Classic dark rides, thrill coasters, and family favorites", itemCount: 47 },
        { label: "Dining", description: "From quick-service to signature fine dining", itemCount: 32 },
        { label: "Shows", description: "Fireworks, parades, and live entertainment", itemCount: 12 },
        { label: "Seasonal Events", description: "MNSSHP, MVMCP, and festival celebrations", itemCount: 4 },
      ],
      heroImage: editorialCarousel,
      todayWeather: "78°F, Clear",
      todayCrowdLevel: "Moderate",
      operatingHours: "8:00 AM – 11:00 PM",
    },
    {
      parkId: "epcot",
      parkName: "EPCOT",
      resort: "wdw",
      resortName: "Walt Disney World",
      typicalWeather: "75–92°F, afternoon thunderstorms in summer",
      crowdCalendarSummary: "Festival seasons bring moderate crowds; World Showcase quieter on weekday mornings.",
      categories: [
        { label: "Attractions", description: "Future-forward rides and World Showcase experiences", itemCount: 28 },
        { label: "Dining", description: "World-class cuisine from 11 countries", itemCount: 45 },
        { label: "Shows", description: "Harmonious, cultural performances, and more", itemCount: 8 },
        { label: "Festivals", description: "Flower & Garden, Food & Wine, Arts, Holidays", itemCount: 4 },
      ],
      heroImage: editorialDining,
      todayWeather: "80°F, Partly Cloudy",
      todayCrowdLevel: "Low",
      operatingHours: "9:00 AM – 9:00 PM",
    },
    {
      parkId: "hs",
      parkName: "Hollywood Studios",
      resort: "wdw",
      resortName: "Walt Disney World",
      typicalWeather: "75–92°F, afternoon thunderstorms in summer",
      crowdCalendarSummary: "Galaxy's Edge and Toy Story Land draw steady crowds; quietest on weekday mornings outside holidays.",
      categories: [
        { label: "Attractions", description: "Blockbuster thrills and immersive lands", itemCount: 22 },
        { label: "Dining", description: "50's Prime Time, Docking Bay 7, and more", itemCount: 18 },
        { label: "Shows", description: "Fantasmic!, Indiana Jones stunt show, Disney Junior", itemCount: 8 },
        { label: "Seasonal Events", description: "Jollywood Nights and special screenings", itemCount: 3 },
      ],
      heroImage: editorialSunset,
      todayWeather: "79°F, Partly Cloudy",
      todayCrowdLevel: "High",
      operatingHours: "8:30 AM – 9:00 PM",
    },
    {
      parkId: "ak",
      parkName: "Animal Kingdom",
      resort: "wdw",
      resortName: "Walt Disney World",
      typicalWeather: "75–92°F, afternoon thunderstorms in summer",
      crowdCalendarSummary: "Mornings busiest at Flight of Passage; evening hours quieter since Pandora opened extended ops.",
      categories: [
        { label: "Attractions", description: "Pandora, safaris, and expedition thrills", itemCount: 18 },
        { label: "Dining", description: "Tusker House, Satu'li Canteen, Yak & Yeti", itemCount: 22 },
        { label: "Shows", description: "Festival of the Lion King, Finding Nemo musical", itemCount: 6 },
        { label: "Wildlife", description: "Kilimanjaro Safaris, Gorilla Falls, Maharajah Jungle Trek", itemCount: 5 },
      ],
      heroImage: editorialFamilyWalk,
      todayWeather: "81°F, Scattered Clouds",
      todayCrowdLevel: "Moderate",
      operatingHours: "8:00 AM – 8:00 PM",
    },
    {
      parkId: "dl",
      parkName: "Disneyland Park",
      resort: "dlr",
      resortName: "Disneyland Resort",
      typicalWeather: "60–85°F, dry and sunny year-round",
      crowdCalendarSummary: "Lightest January–February; busiest summer, Halloween, and holiday seasons.",
      categories: [
        { label: "Attractions", description: "Walt's originals and modern thrills", itemCount: 42 },
        { label: "Dining", description: "Blue Bayou, Café Orleans, and hidden gems", itemCount: 28 },
        { label: "Shows", description: "Fantasmic!, fireworks, and parades", itemCount: 10 },
        { label: "Seasonal Events", description: "Oogie Boogie Bash, holiday overlays", itemCount: 3 },
      ],
      heroImage: editorialCalendar,
      todayWeather: "72°F, Sunny",
      todayCrowdLevel: "Low",
      operatingHours: "8:00 AM – 12:00 AM",
    },
    {
      parkId: "dca",
      parkName: "Disney California Adventure",
      resort: "dlr",
      resortName: "Disneyland Resort",
      typicalWeather: "60–85°F, dry and sunny year-round",
      crowdCalendarSummary: "Avengers Campus peaks midday; Pixar Pier and Cars Land busiest on weekends and summer.",
      categories: [
        { label: "Attractions", description: "Radiator Springs, Guardians, and Incredicoaster", itemCount: 30 },
        { label: "Dining", description: "Lamplight Lounge, Carthay Circle, Pym Test Kitchen", itemCount: 24 },
        { label: "Shows", description: "World of Color, Avengers encounters", itemCount: 7 },
        { label: "Festivals", description: "Food & Wine, Festival of Holidays, Lunar New Year", itemCount: 3 },
      ],
      heroImage: editorialResort,
      todayWeather: "70°F, Clear",
      todayCrowdLevel: "Low",
      operatingHours: "8:00 AM – 10:00 PM",
    },
  ],

  partyMembers: [
    { name: "Patchen", role: "Trip Captain", initial: "P", adventureCount: 12 },
    { name: "Sarah", role: "Co-planner", initial: "S", adventureCount: 12 },
    { name: "Emma", role: "Little Explorer", initial: "E", adventureCount: 8 },
    { name: "Jack", role: "Snack Scout", initial: "J", adventureCount: 8 },
  ],

  tripMemories: [
    {
      tripId: "christmas-2025",
      destination: "Walt Disney World",
      tripName: "Christmas 2025",
      date: "December 2025",
      coverImage: fireworksNight,
      photoCount: 248,
      gridSpan: "col-span-4 row-span-2",
      highlights: ["MVMCP", "Topolino's breakfast", "First ride on Tron"],
    },
    {
      tripId: "summer-2025",
      destination: "Disneyland Resort",
      tripName: "Summer in Anaheim",
      date: "July 2025",
      coverImage: editorialFamilyWalk,
      photoCount: 186,
      gridSpan: "col-span-2 row-span-1",
      highlights: ["Oga's Cantina", "Radiator Springs Racers", "Fireworks from the hub"],
    },
    {
      tripId: "spring-2025",
      destination: "Walt Disney World",
      tripName: "Spring Break 2025",
      date: "March 2025",
      coverImage: castleHero,
      photoCount: 312,
      gridSpan: "col-span-2 row-span-1",
      highlights: ["Flower & Garden Festival", "Space 220 dinner", "Savi's lightsaber build"],
    },
    {
      tripId: "fall-2024",
      destination: "Walt Disney World",
      tripName: "Fall Festival",
      date: "October 2024",
      coverImage: familyMainstreet,
      photoCount: 154,
      gridSpan: "col-span-3 row-span-1",
      highlights: ["MNSSHP", "Haunted Mansion", "Boo Bash"],
    },
    {
      tripId: "summer-2024",
      destination: "Disneyland Resort",
      tripName: "Pixar Fest",
      date: "June 2024",
      coverImage: editorialResort,
      photoCount: 203,
      gridSpan: "col-span-3 row-span-1",
      highlights: ["Together Forever fireworks", "Pixar Pier", "Cars Land at night"],
    },
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
