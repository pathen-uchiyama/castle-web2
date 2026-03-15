import castleHero from "@/assets/castle-hero.jpg";
import castleGolden from "@/assets/castle-golden.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import editorialNextTrip from "@/assets/editorial-next-trip.jpg";
import editorialResort from "@/assets/editorial-resort-twilight.jpg";
import editorialSunset from "@/assets/editorial-sunset.jpg";
import editorialFamilyWalk from "@/assets/editorial-family-walk.jpg";
import editorialJournal from "@/assets/editorial-travel-journal.jpg";
import parkHollywoodStudios from "@/assets/park-hollywood-studios.jpg";
import parkEpcot from "@/assets/park-epcot.jpg";
import parkAnimalKingdom from "@/assets/park-animal-kingdom.jpg";
import parkDisneyland from "@/assets/park-disneyland.jpg";
import parkCaliforniaAdventure from "@/assets/park-california-adventure.jpg";
import editorialCarousel from "@/assets/editorial-carousel.jpg";
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
      operatingHours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "78°F, Clear", crowdLevel: "Moderate", crowdScore: 5, notes: "Spring Break begins — expect steady crowds by mid-morning." },
        { date: "2026-03-22", hours: { regular: "9:00 AM – 11:00 PM", earlyEntry: "8:30 AM", extendedEvening: "11:00 PM – 1:00 AM" }, weather: "80°F, Partly Cloudy", crowdLevel: "High", crowdScore: 7, notes: "Saturday — peak day. Rope drop is essential." },
        { date: "2026-03-23", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM" }, weather: "76°F, Scattered Showers", crowdLevel: "Moderate", crowdScore: 5, notes: "Rain expected 2–4 PM. Great time for indoor rides." },
        { date: "2026-03-24", hours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM", extendedEvening: "9:00 PM – 11:00 PM" }, weather: "74°F, Clear", crowdLevel: "Low", crowdScore: 3, notes: "Monday dip — shorter waits across the board." },
        { date: "2026-03-25", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "79°F, Sunny", crowdLevel: "Moderate", crowdScore: 5 },
        { date: "2026-03-26", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM" }, weather: "81°F, Humid", crowdLevel: "High", crowdScore: 7, notes: "Mid-week surge. Hydrate and plan for shade breaks." },
        { date: "2026-03-27", hours: { regular: "9:00 AM – 11:00 PM", earlyEntry: "8:30 AM", extendedEvening: "11:00 PM – 1:00 AM" }, weather: "77°F, Clear", crowdLevel: "Moderate", crowdScore: 6 },
        { date: "2026-03-28", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "75°F, Sunny", crowdLevel: "Low", crowdScore: 3, notes: "Friday wind-down. Great for bucket-list re-rides." },
      ],
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
      heroImage: parkEpcot,
      todayWeather: "80°F, Partly Cloudy",
      todayCrowdLevel: "Low",
      operatingHours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM", extendedEvening: "9:00 PM – 11:00 PM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM", extendedEvening: "9:00 PM – 11:00 PM" }, weather: "78°F, Clear", crowdLevel: "Low", crowdScore: 3 },
        { date: "2026-03-22", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "80°F, Partly Cloudy", crowdLevel: "Moderate", crowdScore: 5 },
        { date: "2026-03-23", hours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM" }, weather: "76°F, Scattered Showers", crowdLevel: "Low", crowdScore: 2, notes: "Flower & Garden Festival — food booths open at 11 AM." },
        { date: "2026-03-24", hours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM", extendedEvening: "9:00 PM – 11:00 PM" }, weather: "74°F, Clear", crowdLevel: "Low", crowdScore: 2 },
        { date: "2026-03-25", hours: { regular: "9:00 AM – 9:00 PM", earlyEntry: "8:30 AM" }, weather: "79°F, Sunny", crowdLevel: "Moderate", crowdScore: 4 },
        { date: "2026-03-26", hours: { regular: "9:00 AM – 10:00 PM", earlyEntry: "8:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "81°F, Humid", crowdLevel: "Moderate", crowdScore: 5, notes: "World Showcase evening dining at peak." },
      ],
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
      heroImage: parkHollywoodStudios,
      todayWeather: "79°F, Partly Cloudy",
      todayCrowdLevel: "High",
      operatingHours: { regular: "8:30 AM – 9:00 PM", earlyEntry: "8:00 AM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "8:30 AM – 9:00 PM", earlyEntry: "8:00 AM" }, weather: "78°F, Clear", crowdLevel: "High", crowdScore: 7, notes: "Rise of the Resistance virtual queue opens at 7 AM." },
        { date: "2026-03-22", hours: { regular: "8:30 AM – 10:00 PM", earlyEntry: "8:00 AM" }, weather: "80°F, Partly Cloudy", crowdLevel: "High", crowdScore: 8, notes: "Saturday — expect 90+ min waits for headliners." },
        { date: "2026-03-23", hours: { regular: "8:30 AM – 9:00 PM", earlyEntry: "8:00 AM" }, weather: "76°F, Scattered Showers", crowdLevel: "Moderate", crowdScore: 5 },
        { date: "2026-03-24", hours: { regular: "8:30 AM – 8:00 PM", earlyEntry: "8:00 AM" }, weather: "74°F, Clear", crowdLevel: "Low", crowdScore: 3 },
      ],
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
      heroImage: parkAnimalKingdom,
      todayWeather: "81°F, Scattered Clouds",
      todayCrowdLevel: "Moderate",
      operatingHours: { regular: "8:00 AM – 7:00 PM", earlyEntry: "7:30 AM", extendedEvening: "7:00 PM – 9:00 PM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "8:00 AM – 7:00 PM", earlyEntry: "7:30 AM", extendedEvening: "7:00 PM – 9:00 PM" }, weather: "81°F, Scattered Clouds", crowdLevel: "Moderate", crowdScore: 5 },
        { date: "2026-03-22", hours: { regular: "8:00 AM – 8:00 PM", earlyEntry: "7:30 AM", extendedEvening: "8:00 PM – 10:00 PM" }, weather: "82°F, Partly Cloudy", crowdLevel: "High", crowdScore: 7, notes: "Safaris best before 10 AM or after 4 PM." },
        { date: "2026-03-23", hours: { regular: "8:00 AM – 7:00 PM", earlyEntry: "7:30 AM" }, weather: "76°F, Scattered Showers", crowdLevel: "Low", crowdScore: 2, notes: "Rainy mornings thin crowds at Pandora." },
      ],
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
      heroImage: parkDisneyland,
      todayWeather: "72°F, Sunny",
      todayCrowdLevel: "Low",
      operatingHours: { regular: "8:00 AM – 12:00 AM", earlyEntry: "7:30 AM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "8:00 AM – 12:00 AM", earlyEntry: "7:30 AM" }, weather: "72°F, Sunny", crowdLevel: "Low", crowdScore: 3 },
        { date: "2026-03-22", hours: { regular: "8:00 AM – 12:00 AM", earlyEntry: "7:30 AM" }, weather: "74°F, Clear", crowdLevel: "Moderate", crowdScore: 5 },
      ],
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
      heroImage: parkCaliforniaAdventure,
      todayWeather: "70°F, Clear",
      todayCrowdLevel: "Low",
      operatingHours: { regular: "8:00 AM – 10:00 PM", earlyEntry: "7:30 AM", extendedEvening: "10:00 PM – 12:00 AM" },
      schedule: [
        { date: "2026-03-21", hours: { regular: "8:00 AM – 10:00 PM", earlyEntry: "7:30 AM", extendedEvening: "10:00 PM – 12:00 AM" }, weather: "70°F, Clear", crowdLevel: "Low", crowdScore: 2 },
        { date: "2026-03-22", hours: { regular: "8:00 AM – 11:00 PM", earlyEntry: "7:30 AM", extendedEvening: "11:00 PM – 1:00 AM" }, weather: "73°F, Clear", crowdLevel: "Moderate", crowdScore: 4 },
      ],
    },
  ],

  partyMembers: [
    {
      memberId: "P", name: "Patchen", role: "Trip Captain", initial: "P", adventureCount: 12,
      age: 38, birthday: "June 15", heightInches: 72, dietaryRestrictions: [],
      favoriteCharacter: "Goofy", favoriteRide: "Rise of the Resistance",
      thrillTolerance: "high", magicStatus: ["Annual Passholder", "DVC Member"],
      notes: "Prefers rope drop strategy. Comfortable with all thrill rides.",
    },
    {
      memberId: "S", name: "Sarah", role: "Co-planner", initial: "S", adventureCount: 12,
      age: 36, birthday: "November 3", heightInches: 65, dietaryRestrictions: ["Gluten-free"],
      favoriteCharacter: "Rapunzel", favoriteRide: "Flight of Passage",
      thrillTolerance: "moderate", magicStatus: ["Annual Passholder", "DVC Member"],
      sensoryNotes: "Sensitive to loud sudden noises (Tower of Terror drop sirens).",
      notes: "Loves character dining. Needs shade breaks in summer.",
    },
    {
      memberId: "E", name: "Emma", role: "Little Explorer", initial: "E", adventureCount: 8,
      age: 9, birthday: "March 28", heightInches: 52, dietaryRestrictions: ["Nut allergy"],
      favoriteCharacter: "Elsa", favoriteRide: "Frozen Ever After",
      thrillTolerance: "moderate", magicStatus: [],
      sensoryNotes: "Can handle dark rides but not big drops.",
      notes: "Loves princess meet-and-greets. Tall enough for most rides.",
    },
    {
      memberId: "J", name: "Jack", role: "Snack Scout", initial: "J", adventureCount: 8,
      age: 6, birthday: "September 12", heightInches: 44, dietaryRestrictions: [],
      favoriteCharacter: "Buzz Lightyear", favoriteRide: "Slinky Dog Dash",
      thrillTolerance: "low", magicStatus: [],
      sensoryNotes: "Does not like dark enclosed spaces. Scared by loud effects.",
      notes: "Height limit may restrict some rides. Loves snack stands.",
    },
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

  partySurvey: {
    tripId: "spring-break-2026",
    attractions: [
      // Magic Kingdom
      { attractionId: "mk-tron", name: "Tron Lightcycle / Run", parkId: "mk", category: "ride", heightRequirement: "48\"", sensoryTags: ["dark", "speed", "loud"], description: "Indoor launch coaster through a digital grid." },
      { attractionId: "mk-space", name: "Space Mountain", parkId: "mk", category: "ride", heightRequirement: "44\"", sensoryTags: ["dark", "speed"], description: "Classic indoor roller coaster through the cosmos." },
      { attractionId: "mk-pirates", name: "Pirates of the Caribbean", parkId: "mk", category: "ride", description: "Gentle boat ride through pirate scenes." },
      { attractionId: "mk-haunted", name: "Haunted Mansion", parkId: "mk", category: "ride", sensoryTags: ["dark"], description: "Doom buggy tour of 999 happy haunts." },
      { attractionId: "mk-jungle", name: "Jungle Cruise", parkId: "mk", category: "ride", description: "Guided boat tour with legendary skipper humor." },
      { attractionId: "mk-boo", name: "Monsters Inc. Laugh Floor", parkId: "mk", category: "show", description: "Interactive comedy show starring Mike Wazowski." },
      { attractionId: "mk-mickey", name: "Meet Mickey at Town Square", parkId: "mk", category: "character", description: "Classic meet-and-greet with the big cheese." },
      // EPCOT
      { attractionId: "ep-guardians", name: "Guardians of the Galaxy: Cosmic Rewind", parkId: "epcot", category: "ride", heightRequirement: "42\"", sensoryTags: ["dark", "speed", "spinning"], description: "Reverse-launch indoor coaster with a killer soundtrack." },
      { attractionId: "ep-frozen", name: "Frozen Ever After", parkId: "epcot", category: "ride", description: "Boat ride through Arendelle with Anna and Elsa." },
      { attractionId: "ep-test-track", name: "Test Track", parkId: "epcot", category: "ride", heightRequirement: "40\"", sensoryTags: ["speed", "outdoor"], description: "Design a virtual car and take it for a 65 mph spin." },
      { attractionId: "ep-space220", name: "Space 220", parkId: "epcot", category: "dining", description: "Fine dining aboard a simulated space station." },
      { attractionId: "ep-remy", name: "Remy's Ratatouille Adventure", parkId: "epcot", category: "ride", description: "Trackless ride shrunk to rat-sized in Gusteau's kitchen." },
      // Hollywood Studios
      { attractionId: "hs-rise", name: "Rise of the Resistance", parkId: "hs", category: "ride", heightRequirement: "40\"", sensoryTags: ["dark", "loud", "motion"], description: "Epic Star Wars attraction with multiple ride systems." },
      { attractionId: "hs-tot", name: "Tower of Terror", parkId: "hs", category: "ride", heightRequirement: "40\"", sensoryTags: ["drops", "dark"], description: "Plunging elevator in the Twilight Zone." },
      { attractionId: "hs-slinky", name: "Slinky Dog Dash", parkId: "hs", category: "ride", heightRequirement: "38\"", description: "Family coaster through Andy's backyard." },
      { attractionId: "hs-fantasmic", name: "Fantasmic!", parkId: "hs", category: "show", sensoryTags: ["loud", "fire", "water"], description: "Nighttime spectacular of water, fire, and Disney magic." },
      // Animal Kingdom
      { attractionId: "ak-flight", name: "Avatar Flight of Passage", parkId: "ak", category: "ride", heightRequirement: "44\"", sensoryTags: ["3D", "motion", "wind"], description: "Soar on a banshee over Pandora." },
      { attractionId: "ak-safari", name: "Kilimanjaro Safaris", parkId: "ak", category: "ride", description: "Open-air safari through 110 acres of African savanna." },
      { attractionId: "ak-everest", name: "Expedition Everest", parkId: "ak", category: "ride", heightRequirement: "44\"", sensoryTags: ["speed", "dark", "drops"], description: "High-speed train ride confronting the Yeti." },
      { attractionId: "ak-lion", name: "Festival of the Lion King", parkId: "ak", category: "show", description: "Broadway-caliber celebration of the Lion King." },
    ],
    responses: [
      {
        memberId: "P",
        memberName: "Patchen",
        rankings: {
          "mk-tron": "must-do", "mk-space": "must-do", "mk-pirates": "like-to-do", "mk-haunted": "must-do",
          "mk-jungle": "like-to-do", "mk-boo": "will-avoid", "mk-mickey": "like-to-do",
          "ep-guardians": "must-do", "ep-frozen": "like-to-do", "ep-test-track": "must-do", "ep-space220": "must-do",
          "ep-remy": "like-to-do", "hs-rise": "must-do", "hs-tot": "must-do", "hs-slinky": "like-to-do",
          "hs-fantasmic": "must-do", "ak-flight": "must-do", "ak-safari": "like-to-do",
          "ak-everest": "must-do", "ak-lion": "like-to-do",
        },
        openToAnything: false,
        topFiveMustDos: ["hs-rise", "mk-tron", "ak-flight", "ep-guardians", "hs-fantasmic"],
        status: "completed",
      },
      {
        memberId: "S",
        memberName: "Sarah",
        rankings: {
          "mk-tron": "like-to-do", "mk-space": "will-avoid", "mk-pirates": "must-do", "mk-haunted": "must-do",
          "mk-jungle": "must-do", "mk-boo": "like-to-do", "mk-mickey": "must-do",
          "ep-guardians": "will-avoid", "ep-frozen": "must-do", "ep-test-track": "like-to-do", "ep-space220": "must-do",
          "ep-remy": "must-do", "hs-rise": "must-do", "hs-tot": "will-avoid", "hs-slinky": "must-do",
          "hs-fantasmic": "must-do", "ak-flight": "must-do", "ak-safari": "must-do",
          "ak-everest": "will-avoid", "ak-lion": "must-do",
        },
        openToAnything: true,
        topFiveMustDos: ["ak-flight", "ep-space220", "hs-fantasmic", "mk-pirates", "ep-frozen"],
        status: "completed",
      },
      {
        memberId: "E",
        memberName: "Emma",
        rankings: {},
        openToAnything: false,
        topFiveMustDos: [],
        status: "pending",
      },
      {
        memberId: "J",
        memberName: "Jack",
        rankings: {},
        openToAnything: false,
        topFiveMustDos: [],
        status: "pending",
      },
    ],
  },
};
