/* ─── Park Status & News Data ───────────────────────────────────
 * Closures, refurbishments, permanent closings, re-themings,
 * upcoming openings, and under-construction projects for all parks.
 * ─────────────────────────────────────────────────────────────── */

export type ParkNewsCategory = "refurbishment" | "closing-permanently" | "re-theming" | "opening-soon" | "under-construction" | "seasonal-closure";

export interface ParkNewsItem {
  id: string;
  parkId: string;
  category: ParkNewsCategory;
  title: string;
  description: string;
  expectedDate?: string;
  dateLabel?: string;
  impact: "low" | "moderate" | "high";
  icon: string;
}

export const parkNewsItems: ParkNewsItem[] = [
  // ═══ MAGIC KINGDOM ═══
  { id: "mk-space-refurb", parkId: "mk", category: "refurbishment", title: "Space Mountain — Track Refurbishment", description: "Periodic track maintenance and lighting updates. Expected to reopen within 2 weeks with smoother ride experience.", expectedDate: "April 2026", dateLabel: "Reopening April 2026", impact: "moderate", icon: "🔧" },
  { id: "mk-tomorrowland-speedway", parkId: "mk", category: "re-theming", title: "Tomorrowland Speedway — Electric Reimagining", description: "Converting gas-powered cars to electric with new theming. Part of the broader Tomorrowland refresh.", expectedDate: "Late 2027", dateLabel: "Expected Late 2027", impact: "moderate", icon: "🎨" },
  { id: "mk-new-villains-coaster", parkId: "mk", category: "under-construction", title: "Villains-Themed Coaster — Beyond Big Thunder", description: "A major new coaster themed to Disney Villains in a new land expansion beyond Big Thunder Mountain. Will be one of WDW's most ambitious builds.", expectedDate: "2027", dateLabel: "Projected 2027", impact: "high", icon: "🏗️" },
  { id: "mk-cars-land", parkId: "mk", category: "under-construction", title: "Cars Land Expansion", description: "A full Cars Land expansion is in early planning stages, bringing Radiator Springs to WDW for the first time.", expectedDate: "2028+", dateLabel: "Early Planning — 2028+", impact: "high", icon: "🏗️" },

  // ═══ EPCOT ═══
  { id: "epcot-test-track-refurb", parkId: "epcot", category: "refurbishment", title: "Test Track — Full Reimagining", description: "Closed for a complete overhaul. New ride design experience and updated track systems. One of EPCOT's biggest transformations.", expectedDate: "Late 2026", dateLabel: "Reopening Late 2026", impact: "high", icon: "🔧" },
  { id: "epcot-journey-of-water", parkId: "epcot", category: "opening-soon", title: "Journey of Water — Moana Expansion", description: "Interactive walk-through water attraction inspired by Moana. Expanded with new scenes and nighttime elements.", expectedDate: "Summer 2026", dateLabel: "Expanding Summer 2026", impact: "moderate", icon: "🆕" },
  { id: "epcot-play-pavilion", parkId: "epcot", category: "under-construction", title: "Play! Pavilion", description: "Interactive gaming pavilion in World Celebration. Will feature immersive digital experiences with Disney characters.", expectedDate: "2027", dateLabel: "Projected 2027", impact: "moderate", icon: "🏗️" },
  { id: "epcot-spaceship-earth", parkId: "epcot", category: "re-theming", title: "Spaceship Earth — Narrative Update", description: "Planned story refresh with updated scenes and new finale. The ride vehicle and basic dark ride format will remain.", expectedDate: "TBD", dateLabel: "Announced — Date TBD", impact: "moderate", icon: "🎨" },

  // ═══ HOLLYWOOD STUDIOS ═══
  { id: "hs-rock-n-roller-retheme", parkId: "hs", category: "re-theming", title: "Rock 'n' Roller Coaster — New IP Overlay", description: "Rumored re-theming from Aerosmith to a new musical IP. Launch coaster mechanics will remain. Details pending official announcement.", expectedDate: "TBD", dateLabel: "Rumored — Not Confirmed", impact: "moderate", icon: "🎨" },
  { id: "hs-muppets-seasonal", parkId: "hs", category: "seasonal-closure", title: "MuppetVision 3D — Seasonal Operation", description: "Operating on a seasonal schedule with periodic closures for maintenance. Check park calendar for show times.", dateLabel: "Seasonal Schedule", impact: "low", icon: "📅" },
  { id: "hs-new-lands", parkId: "hs", category: "under-construction", title: "Monsters Inc. Land", description: "New themed land replacing part of the current Streets of America area. Will include a major E-ticket attraction and themed dining.", expectedDate: "2028", dateLabel: "Projected 2028", impact: "high", icon: "🏗️" },
  { id: "hs-indiana-jones", parkId: "hs", category: "under-construction", title: "Indiana Jones Adventure", description: "A version of Disneyland's beloved Indiana Jones Adventure is coming to Hollywood Studios, replacing a current attraction.", expectedDate: "2027-2028", dateLabel: "Announced — 2027-2028", impact: "high", icon: "🏗️" },

  // ═══ ANIMAL KINGDOM ═══
  { id: "ak-dinoland-retheme", parkId: "ak", category: "re-theming", title: "DinoLand U.S.A. — Tropical Americas", description: "Complete replacement of DinoLand with a new land themed to Encanto and Indiana Jones. Major new attractions and dining planned.", expectedDate: "2027", dateLabel: "Projected 2027", impact: "high", icon: "🎨" },
  { id: "ak-dinosaur-closing", parkId: "ak", category: "closing-permanently", title: "DINOSAUR — Permanent Closure", description: "DINOSAUR will close permanently as part of the DinoLand U.S.A. transformation to Tropical Americas. Enjoy final rides before closure.", expectedDate: "Late 2026", dateLabel: "Closing Late 2026", impact: "moderate", icon: "🚫" },
  { id: "ak-primeval-whirl-closed", parkId: "ak", category: "closing-permanently", title: "Primeval Whirl — Permanently Closed", description: "This spinning coaster has been permanently removed. Site being cleared for the Tropical Americas expansion.", dateLabel: "Permanently Closed", impact: "low", icon: "🚫" },
  { id: "ak-encanto-ride", parkId: "ak", category: "under-construction", title: "Encanto E-Ticket Attraction", description: "A major new attraction themed to Encanto is being developed as part of the Tropical Americas land. Expected to be a groundbreaking ride experience.", expectedDate: "2027-2028", dateLabel: "Under Development", impact: "high", icon: "🏗️" },

  // ═══ DISNEYLAND ═══
  { id: "dl-fantasmic-seasonal", parkId: "dl", category: "seasonal-closure", title: "Fantasmic! — Seasonal Schedule", description: "Operating on select nights. Check the park calendar for performance dates — typically weekends and peak periods.", dateLabel: "Select Nights Only", impact: "low", icon: "📅" },
  { id: "dl-toontown-refresh", parkId: "dl", category: "opening-soon", title: "Mickey's Toontown — Completed Refresh", description: "The reimagined Toontown is now fully open with CenTOONial Park, new play areas, and the Goofy's How-To-Play Yard.", dateLabel: "Now Open", impact: "low", icon: "🆕" },
  { id: "dl-new-avengers-ride", parkId: "dl", category: "under-construction", title: "Avengers Campus — New E-Ticket", description: "A major new Avengers attraction is in development for the expanded Avengers Campus, featuring a multi-level ride system.", expectedDate: "2027-2028", dateLabel: "In Development", impact: "high", icon: "🏗️" },
  { id: "dl-rivers-of-america", parkId: "dl", category: "refurbishment", title: "Rivers of America — Infrastructure Work", description: "Periodic maintenance on the waterway infrastructure. Mark Twain and Sailing Ship Columbia may have limited operating hours.", dateLabel: "Intermittent Closures", impact: "low", icon: "🔧" },

  // ═══ DISNEY CALIFORNIA ADVENTURE ═══
  { id: "dca-pacific-wharf-retheme", parkId: "dca", category: "re-theming", title: "Pacific Wharf → San Fransokyo", description: "Pacific Wharf is being reimagined into San Fransokyo from Big Hero 6. New theming, dining options, and character experiences.", expectedDate: "2026", dateLabel: "Opening 2026", impact: "moderate", icon: "🎨" },
  { id: "dca-avengers-expansion", parkId: "dca", category: "under-construction", title: "Avengers Campus Expansion — King Thanos", description: "Phase 2 expansion of Avengers Campus with a new Multiverse-themed E-ticket attraction.", expectedDate: "2027", dateLabel: "Projected 2027", impact: "high", icon: "🏗️" },
  { id: "dca-incredicoaster-maintenance", parkId: "dca", category: "refurbishment", title: "Incredicoaster — Annual Maintenance", description: "Standard annual track inspection and repaint. Typically a 2-3 week closure.", expectedDate: "Jan-Feb 2027", dateLabel: "Jan-Feb 2027", impact: "low", icon: "🔧" },
];
