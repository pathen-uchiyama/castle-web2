import { useState, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Sun, Sunset, Moon, Clock, MapPin, Utensils, Star,
  Sparkles, ChevronRight, Info, Zap, Heart, Camera, Coffee,
  ShoppingBag, Music, Ticket
} from "lucide-react";
import Footer from "@/components/Footer";

/* ── Types ── */
interface LightningLaneRec {
  type: "LL" | "ILL";
  cost?: string;
  reason: string;
  savings: string; // e.g. "Save 45–70 min"
}

interface ItineraryBlock {
  time: string;
  title: string;
  location: string;
  duration: string;
  category: "ride" | "dining" | "show" | "explore" | "rest" | "snack" | "character" | "photo" | "travel" | "shopping";
  why: string;
  insiderTip?: string;
  vibeMatch?: string[];
  dreamMatch?: boolean;
  intensity: "low" | "moderate" | "high";
  lightningLane?: LightningLaneRec;
}

interface ItineraryDay {
  dayNumber: number;
  label: string;
  parkName: string;
  parkEmoji: string;
  theme: string;
  openingStrategy: string;
  dayNarrative: string;
  blocks: ItineraryBlock[];
}

interface WizardData {
  travelers: { adults: number; kids: number; kidAges: string; firstTime: boolean | null };
  dates: { month: string; duration: number };
  selectedResort: "wdw" | "dlr";
  selectedParks: { id: string; name: string; emoji: string; tagline: string }[];
  selectedVibes: { id: string; label: string; emoji: string }[];
  selectedDining: { id: string; label: string; emoji: string }[];
  selectedDreams: { id: string; label: string; emoji: string; why: string; park: string; category: string }[];
}

const categoryIcon = (cat: ItineraryBlock["category"]) => {
  switch (cat) {
    case "ride": return <Zap className="w-3.5 h-3.5" />;
    case "dining": return <Utensils className="w-3.5 h-3.5" />;
    case "show": return <Music className="w-3.5 h-3.5" />;
    case "explore": return <MapPin className="w-3.5 h-3.5" />;
    case "rest": return <Coffee className="w-3.5 h-3.5" />;
    case "snack": return <Coffee className="w-3.5 h-3.5" />;
    case "character": return <Heart className="w-3.5 h-3.5" />;
    case "photo": return <Camera className="w-3.5 h-3.5" />;
    case "travel": return <MapPin className="w-3.5 h-3.5" />;
    case "shopping": return <ShoppingBag className="w-3.5 h-3.5" />;
  }
};

const categoryColor = (cat: ItineraryBlock["category"]) => {
  switch (cat) {
    case "ride": return "sky";
    case "dining": return "coral";
    case "show": return "lavender";
    case "explore": return "mint";
    case "rest": return "sunshine";
    case "snack": return "gold";
    case "character": return "coral";
    case "photo": return "lavender";
    case "travel": return "mint";
    case "shopping": return "sunshine";
  }
};

const intensityLabel = (i: ItineraryBlock["intensity"]) => {
  switch (i) {
    case "low": return { text: "Easy-Going", color: "mint" };
    case "moderate": return { text: "Moderate", color: "sunshine" };
    case "high": return { text: "High Energy", color: "coral" };
  }
};

const periodIcon = (time: string) => {
  const hour = parseInt(time.split(":")[0]);
  if (hour < 12) return <Sun className="w-3 h-3 text-[hsl(var(--sunshine))]" />;
  if (hour < 17) return <Sunset className="w-3 h-3 text-[hsl(var(--coral))]" />;
  return <Moon className="w-3 h-3 text-[hsl(var(--lavender))]" />;
};

/* ── Plan Generator ── */
function generateFullPlan(data: WizardData): ItineraryDay[] {
  const { dates, selectedParks, selectedVibes, selectedDining, selectedDreams, travelers } = data;
  const vibeIds = new Set(selectedVibes.map(v => v.id));
  const diningIds = new Set(selectedDining.map(d => d.id));
  const hasKids = travelers.kids > 0;
  const isFirstTime = travelers.firstTime === true;
  const isRelaxed = vibeIds.has("relaxed");
  const isFoodie = vibeIds.has("foodie");
  const isThrillSeeker = vibeIds.has("thrill");
  const isLittles = vibeIds.has("littles");
  const isPhotoFocused = vibeIds.has("photo");

  const days: ItineraryDay[] = [];
  const usedDreams = new Set<string>();

  // Build a pool of dreams per park
  const dreamsByPark: Record<string, typeof selectedDreams> = {};
  const universalDreams: typeof selectedDreams = [];
  for (const d of selectedDreams) {
    const parkLower = d.park.toLowerCase();
    let matched = false;
    for (const p of selectedParks) {
      if (parkLower.includes(p.name.toLowerCase()) || parkLower.includes(p.id)) {
        if (!dreamsByPark[p.id]) dreamsByPark[p.id] = [];
        dreamsByPark[p.id].push(d);
        matched = true;
      }
    }
    if (!matched) universalDreams.push(d);
  }

  // WDW park activity databases
  const parkActivities: Record<string, { rides: ItineraryBlock[]; dining: ItineraryBlock[]; shows: ItineraryBlock[]; explore: ItineraryBlock[] }> = {
    mk: {
      rides: [
        { time: "09:00", title: "Space Mountain", location: "Tomorrowland", duration: "30 min", category: "ride", why: "Best experienced first thing — lines balloon to 90+ minutes by midday. The darkness and speed make it thrilling without being scary.", intensity: "high", insiderTip: "Ride in the back row for the most intense experience.", lightningLane: { type: "LL", reason: "Standby averages 60–90 min midday. LL typically saves 45–70 min, making it one of the best value picks in MK.", savings: "Save 45–70 min" } },
        { time: "09:30", title: "TRON Lightcycle / Run", location: "Tomorrowland", duration: "25 min", category: "ride", why: "Disney's fastest coaster and a virtual queue favorite. Riding at rope drop means no wait and the LED canopy still glows in the morning light.", intensity: "high", insiderTip: "Store everything in the free lockers — no bags or loose items allowed on the ride.", lightningLane: { type: "ILL", cost: "$20–25", reason: "TRON is one of MK's hardest-to-ride attractions. Virtual queue slots vanish in seconds. The ILL purchase guarantees a ride without the stress.", savings: "Save 60–100 min" } },
        { time: "10:00", title: "Big Thunder Mountain Railroad", location: "Frontierland", duration: "25 min", category: "ride", why: "The 'wildest ride in the wilderness' — exciting enough for thrill-seekers but gentle enough for most kids. Lines stay moderate all day.", intensity: "moderate", insiderTip: "Ride at night for a completely different experience — the darkness adds magic.", lightningLane: { type: "LL", reason: "Consistently 40–55 min standby. LL drops it to a walk-on most of the day.", savings: "Save 35–50 min" } },
        { time: "10:30", title: "Pirates of the Caribbean", location: "Adventureland", duration: "20 min", category: "ride", why: "A classic Walt-era boat ride through pirate scenes. Perfect AC break. Lines move fast even when they look long.", intensity: "low", insiderTip: "The queue itself is gorgeous — don't rush through it." },
        { time: "11:00", title: "Haunted Mansion", location: "Liberty Square", duration: "25 min", category: "ride", why: "999 happy haunts and one of Disney's most beloved attractions. More whimsical than scary — kids usually love it.", intensity: "low", insiderTip: "Look for the engagement ring embedded in the concrete outside.", lightningLane: { type: "LL", reason: "Wait times spike 30–50 min on busy days. LL saves meaningful time and keeps your momentum going.", savings: "Save 25–40 min" } },
        { time: "11:30", title: "Jungle Cruise", location: "Adventureland", duration: "25 min", category: "ride", why: "Recently updated with new scenes and jokes. Your skipper makes or breaks the experience — it's live comedy on water.", intensity: "low", insiderTip: "The right side of the boat gets slightly better views.", lightningLane: { type: "LL", reason: "Afternoon waits hit 45–60 min. LL keeps this classic in your plan without eating your afternoon.", savings: "Save 30–50 min" } },
        { time: "14:00", title: "Seven Dwarfs Mine Train", location: "Fantasyland", duration: "20 min", category: "ride", why: "The most popular ride in Magic Kingdom — the swaying mine carts and Snow White scenes are enchanting. Lightning Lane recommended.", intensity: "moderate", insiderTip: "If you can only splurge on one Lightning Lane, make it this one.", lightningLane: { type: "ILL", cost: "$15–20", reason: "The single longest standby wait in MK — routinely 80–120 min. ILL is the #1 recommended purchase at Magic Kingdom. Without it, this ride eats 2 hours.", savings: "Save 70–110 min" } },
        { time: "15:00", title: "Buzz Lightyear's Space Ranger Spin", location: "Tomorrowland", duration: "20 min", category: "ride", why: "Interactive shooting gallery ride — great for competitive families. Lines are usually manageable in the afternoon.", intensity: "low" },
        { time: "16:00", title: "it's a small world", location: "Fantasyland", duration: "15 min", category: "ride", why: "A must-do at least once. The air conditioning alone is worth it on a hot day, and the singing is genuinely charming.", intensity: "low" },
      ],
      dining: [
        { time: "07:30", title: "Breakfast at The Crystal Palace", location: "Main Street U.S.A.", duration: "75 min", category: "dining", why: "Winnie the Pooh & friends visit your table during an all-you-can-eat breakfast. Gets you inside the park before general guests — the castle is nearly empty for photos.", intensity: "low", insiderTip: "Book the earliest time slot to walk Main Street with almost no crowds afterward.", vibeMatch: ["magic", "littles"] },
        { time: "12:00", title: "Lunch at Columbia Harbour House", location: "Liberty Square", duration: "45 min", category: "dining", why: "The best quick-service in Magic Kingdom. Lobster mac & cheese, clam chowder, and a hidden upstairs seating area that most guests never find.", intensity: "low", insiderTip: "Go upstairs — it's quieter, has AC, and overlooks the Rivers of America." },
        { time: "18:00", title: "Dinner at Be Our Guest", location: "Fantasyland", duration: "90 min", category: "dining", why: "Dine inside the Beast's Castle across three themed rooms. The West Wing has a magical enchanted rose. One of the most immersive dining experiences in any Disney park.", intensity: "low", insiderTip: "Request the West Wing for the most dramatic atmosphere. The grey stuff IS delicious.", vibeMatch: ["magic", "foodie"], dreamMatch: true },
        { time: "15:00", title: "Dole Whip at Aloha Isle", location: "Adventureland", duration: "15 min", category: "snack", why: "The #1 fan-favorite Disney snack — pineapple soft-serve that's been a tradition since 1986. Dairy-free, too.", intensity: "low", insiderTip: "Get the Dole Whip float — pineapple juice on the bottom adds a whole new dimension.", dreamMatch: true },
      ],
      shows: [
        { time: "14:00", title: "Festival of Fantasy Parade", location: "Main Street U.S.A.", duration: "20 min", category: "show", why: "Disney's best daytime parade — enormous floats, beloved characters, and a fire-breathing dragon. Find your spot 20 minutes early.", intensity: "low", insiderTip: "Watch from Frontierland — less crowded and you see the floats coming from a unique angle.", vibeMatch: ["magic", "photo"] },
        { time: "20:00", title: "Happily Ever After", location: "Main Street U.S.A.", duration: "20 min", category: "show", why: "Castle projections + fireworks + emotional music. Most guests say this is the single most magical moment of their trip. Don't miss it.", intensity: "low", insiderTip: "Stand in the center of Main Street at the hub for the best projection view. Arrive 30 min early.", vibeMatch: ["magic"], dreamMatch: true },
      ],
      explore: [
        { time: "08:45", title: "Main Street U.S.A. Photo Stop", location: "Main Street U.S.A.", duration: "15 min", category: "photo", why: "The castle at the end of Main Street with no crowds — this is the photo you'll frame. Get here right at park open before the masses arrive.", intensity: "low", vibeMatch: ["photo"] },
        { time: "16:30", title: "Explore Tom Sawyer Island", location: "Frontierland", duration: "30 min", category: "explore", why: "A hidden gem most guests skip. Take the raft over for caves, bridges, and a peaceful escape from the crowds. Kids love the fort.", intensity: "low" },
      ],
    },
    epcot: {
      rides: [
        { time: "09:00", title: "Guardians of the Galaxy: Cosmic Rewind", location: "World Discovery", duration: "30 min", category: "ride", why: "The first reverse-launch Disney coaster — each ride plays a different classic rock song. Virtual queue fills up fast, so rope drop is your best bet.", intensity: "high", insiderTip: "You can't choose your song, but every one is a banger. The reverse launch is unforgettable.", lightningLane: { type: "ILL", cost: "$18–22", reason: "Virtual queue slots vanish within minutes. Without ILL, many guests don't ride at all. This is the #1 ILL purchase at EPCOT.", savings: "Save 60–90 min" } },
        { time: "09:30", title: "Test Track", location: "World Discovery", duration: "25 min", category: "ride", why: "Design your own car and test it at 65mph on an outdoor track. The speed at the end is genuinely thrilling.", intensity: "moderate", insiderTip: "Design your car for speed — it makes the results more fun to watch.", lightningLane: { type: "LL", reason: "Standby averages 50–75 min. LL is a solid value pick here — the line barely moves during design phase.", savings: "Save 40–60 min" } },
        { time: "10:00", title: "Frozen Ever After", location: "World Showcase (Norway)", duration: "20 min", category: "ride", why: "A charming boat ride through Arendelle with Elsa, Anna, and incredible animatronics. Lines are worst at midday — go early or late.", intensity: "low", insiderTip: "The bakery next door (Kringla Bakeri) has the best school bread in Disney — grab some after.", lightningLane: { type: "LL", reason: "Frozen fans keep this at 45–65 min all day. LL lets you skip straight to Arendelle.", savings: "Save 35–55 min" } },
        { time: "10:30", title: "Remy's Ratatouille Adventure", location: "World Showcase (France)", duration: "25 min", category: "ride", why: "You shrink to rat-size and scurry through Gusteau's kitchen. The trackless ride system makes every ride feel different.", intensity: "low", lightningLane: { type: "LL", reason: "Newer ride with consistent 40–55 min waits. LL makes this an easy add to your World Showcase stroll.", savings: "Save 30–45 min" } },
        { time: "11:00", title: "Soarin' Around the World", location: "World Nature", duration: "25 min", category: "ride", why: "A hang-gliding simulator over world landmarks — the scents of each scene (orange groves, ocean mist) make it incredibly immersive.", intensity: "low", insiderTip: "Request row B1 for the center, top position — best view with no feet dangling above you.", lightningLane: { type: "LL", reason: "Averages 45–60 min standby. LL is a great pick, especially since row position matters — you skip the worst of the queue.", savings: "Save 35–50 min" } },
      ],
      dining: [
        { time: "12:00", title: "Lunch at Space 220", location: "World Discovery", duration: "90 min", category: "dining", why: "Take an 'elevator to space' and dine overlooking Earth from a simulated space station. The views rotate in real-time. The food is upscale American — but you're here for the experience.", intensity: "low", insiderTip: "The lounge is walk-up (no reservation needed) and cheaper — same views, smaller plates.", vibeMatch: ["foodie"], dreamMatch: true },
        { time: "15:00", title: "Snack Crawl: World Showcase", location: "World Showcase", duration: "120 min", category: "dining", why: "Skip one big meal — instead, eat small plates across 11 countries. Tacos in Mexico, fish & chips in UK, croissants in France, sushi in Japan. This IS the EPCOT experience.", intensity: "low", insiderTip: "Start in Mexico (counterclockwise) — most guests go clockwise, so you'll hit shorter lines.", vibeMatch: ["foodie"], dreamMatch: true },
      ],
      shows: [
        { time: "21:00", title: "Luminous: The Symphony of Us", location: "World Showcase Lagoon", duration: "20 min", category: "show", why: "EPCOT's nighttime spectacular with fireworks, fountains, and lasers over the lagoon. Best viewed from the Japan/America bridge.", intensity: "low" },
      ],
      explore: [
        { time: "17:00", title: "World Showcase Evening Stroll", location: "World Showcase", duration: "60 min", category: "explore", why: "As the sun sets, each country lights up beautifully. Live performers appear in each pavilion — mariachi in Mexico, taiko drums in Japan, comedians in UK.", intensity: "low", vibeMatch: ["magic", "photo"] },
      ],
    },
    hs: {
      rides: [
        { time: "09:00", title: "Rise of the Resistance", location: "Star Wars: Galaxy's Edge", duration: "40 min", category: "ride", why: "Widely considered the best ride ever built. An 18-minute experience where you're captured by the First Order — multiple ride systems, practical effects, and a jaw-dropping scale.", intensity: "moderate", insiderTip: "Go at rope drop. Lightning Lane is $20-25 but worth every penny if you don't want to wait 90+ min.", dreamMatch: true, lightningLane: { type: "ILL", cost: "$20–25", reason: "The most in-demand ride at WDW. Standby routinely hits 90–150 min. ILL is the single best purchase you can make across all 4 parks.", savings: "Save 70–120 min" } },
        { time: "09:45", title: "Millennium Falcon: Smugglers Run", location: "Star Wars: Galaxy's Edge", duration: "25 min", category: "ride", why: "You literally fly the Falcon. The pilot seats control the ship in real-time. Even non-Star Wars fans love this.", intensity: "moderate", insiderTip: "Ask for PILOT position — the other roles (gunner/engineer) are less exciting.", lightningLane: { type: "LL", reason: "Standby 35–55 min. LL is a nice convenience pick but not essential — prioritize other LL selections first.", savings: "Save 25–45 min" } },
        { time: "10:30", title: "Tower of Terror", location: "Sunset Boulevard", duration: "25 min", category: "ride", why: "A haunted hotel elevator that drops you multiple times in randomized patterns. The storytelling is world-class — the queue alone is worth experiencing.", intensity: "high", insiderTip: "Each ride has a slightly different drop sequence — you never know exactly when it'll fall.", lightningLane: { type: "LL", reason: "Consistently 50–75 min standby. One of the best LL picks at HS — high wait, high reward.", savings: "Save 40–60 min" } },
        { time: "11:00", title: "Slinky Dog Dash", location: "Toy Story Land", duration: "25 min", category: "ride", why: "A family coaster where you're toy-sized in Andy's backyard. The theming is delightful and the ride is smooth enough for nervous riders.", intensity: "moderate", insiderTip: "Wait times peak at midday — ride early morning or after 6pm.", lightningLane: { type: "LL", reason: "Averages 60–85 min standby — highest LL value in Toy Story Land. Without it, Slinky eats a big chunk of your day.", savings: "Save 45–70 min" } },
        { time: "11:30", title: "Rock 'n' Roller Coaster", location: "Sunset Boulevard", duration: "20 min", category: "ride", why: "A 0-to-60mph launch in 2.8 seconds with inversions — all set to Aerosmith. Disney's most intense coaster.", intensity: "high", lightningLane: { type: "LL", reason: "40–60 min standby on average. LL makes this a quick thrill without losing park time.", savings: "Save 30–50 min" } },
      ],
      dining: [
        { time: "12:30", title: "Lunch at Docking Bay 7", location: "Star Wars: Galaxy's Edge", duration: "45 min", category: "dining", why: "Quick-service dining inside a cargo bay. The Endorian Tip-Yip (fried chicken) is excellent, and eating in Galaxy's Edge keeps you immersed in the Star Wars world.", intensity: "low", insiderTip: "Portions are generous — consider splitting the Felucian Kefta & Hummus Garden Spread." },
        { time: "18:00", title: "Dinner at 50's Prime Time Café", location: "Echo Lake", duration: "75 min", category: "dining", why: "Sit in a 1950s kitchen while your 'cousin' serves you meatloaf and scolds you for not finishing your veggies. It's hilarious and the comfort food is genuinely good.", intensity: "low", insiderTip: "Put your elbows on the table — the cast members will call you out and it's part of the fun.", vibeMatch: ["foodie"] },
      ],
      shows: [
        { time: "14:00", title: "Indiana Jones Epic Stunt Spectacular", location: "Echo Lake", duration: "35 min", category: "show", why: "Live-action stunts recreating Raiders of the Lost Ark scenes — explosions, fight choreography, and audience volunteers. A rare live entertainment gem.", intensity: "low" },
        { time: "20:30", title: "Fantasmic!", location: "Sunset Boulevard", duration: "30 min", category: "show", why: "Water, fire, projections, and Mickey battling villains on a massive stage. One of Disney's best nighttime shows. Arrive 45+ minutes early for a seat.", intensity: "low", insiderTip: "The dessert party package guarantees great seats and includes themed desserts." },
      ],
      explore: [
        { time: "15:00", title: "Build a Lightsaber at Savi's Workshop", location: "Star Wars: Galaxy's Edge", duration: "30 min", category: "explore", why: "A deeply immersive experience — you build a custom lightsaber in a secret ceremony. Cast members stay in character the entire time. Many adults cry. ($249, reservation required.)", intensity: "low", insiderTip: "Only the builder goes in, but one guest can watch. Choose the 'Peace and Justice' set for a classic Jedi look." },
      ],
    },
    ak: {
      rides: [
        { time: "09:00", title: "Avatar Flight of Passage", location: "Pandora", duration: "30 min", category: "ride", why: "Ride a banshee over Pandora — wind in your face, mist in the air, scents of the forest. Consistently rated the #1 ride in all of Walt Disney World.", intensity: "moderate", insiderTip: "Rope drop is ESSENTIAL — this ride hits 120+ minute waits by 10am.", dreamMatch: true, lightningLane: { type: "ILL", cost: "$15–20", reason: "The longest average wait at WDW — 90–150 min is normal. ILL is strongly recommended. Without it, you're giving up 2+ hours of your Animal Kingdom day.", savings: "Save 80–130 min" } },
        { time: "09:45", title: "Na'vi River Journey", location: "Pandora", duration: "20 min", category: "ride", why: "A peaceful boat ride through bioluminescent Pandora forests. The Shaman animatronic at the end is the most advanced Disney has ever built.", intensity: "low", lightningLane: { type: "LL", reason: "Standby 40–60 min. LL saves solid time on an otherwise slow-loading boat ride.", savings: "Save 30–50 min" } },
        { time: "10:30", title: "Kilimanjaro Safaris", location: "Africa", duration: "25 min", category: "ride", why: "A real African safari with live animals — giraffes, elephants, lions, hippos. Every ride is different because the animals move freely. Morning = most active animals.", intensity: "low", insiderTip: "Morning rides see the most animal activity. Sit on the LEFT side for closer views.", dreamMatch: true, lightningLane: { type: "LL", reason: "Morning waits hit 40–55 min when animals are most active. LL lets you time it right without sacrificing your early window.", savings: "Save 30–45 min" } },
        { time: "11:30", title: "Expedition Everest", location: "Asia", duration: "20 min", category: "ride", why: "A roller coaster through the Himalayas that goes BACKWARDS through a Yeti encounter. Excellent theming and a great moderate thrill.", intensity: "high", lightningLane: { type: "LL", reason: "Averages 35–55 min standby. A good LL pick — the backwards section alone makes it worth not waiting.", savings: "Save 25–45 min" } },
        { time: "14:00", title: "Dinosaur", location: "DinoLand U.S.A.", duration: "20 min", category: "ride", why: "A dark, intense time-travel ride to save a dinosaur. More jarring than it looks — the animatronic carnotaurus is genuinely startling.", intensity: "moderate" },
      ],
      dining: [
        { time: "12:00", title: "Lunch at Satu'li Canteen", location: "Pandora", duration: "45 min", category: "dining", why: "The best quick-service restaurant in all of Walt Disney World. The customizable bowls with grilled chicken or beef are fresh, beautiful, and legitimately delicious.", intensity: "low", insiderTip: "The Blueberry Cream Cheese Mousse dessert is a hidden gem — don't skip it." },
        { time: "17:30", title: "Dinner at Yak & Yeti", location: "Asia", duration: "75 min", category: "dining", why: "Pan-Asian cuisine in a beautifully themed Himalayan merchant's home. The Ahi Tuna Nachos appetizer is legendary among Disney foodies.", intensity: "low", vibeMatch: ["foodie"] },
      ],
      shows: [
        { time: "15:00", title: "Finding Nemo: The Big Blue... and Beyond!", location: "DinoLand U.S.A.", duration: "30 min", category: "show", why: "A Broadway-caliber puppet musical retelling Finding Nemo. The puppetry is stunning and it's a perfect AC break during the hottest part of the day.", intensity: "low" },
      ],
      explore: [
        { time: "19:30", title: "Pandora at Night", location: "Pandora", duration: "45 min", category: "explore", why: "The entire land transforms after dark — bioluminescent plants glow, pathways illuminate, and the atmosphere becomes otherworldly. One of Disney's most photographed locations.", intensity: "low", vibeMatch: ["photo", "magic"], dreamMatch: true },
        { time: "10:00", title: "Gorilla Falls Exploration Trail", location: "Africa", duration: "30 min", category: "explore", why: "A self-paced walking trail with gorillas, hippos, exotic birds, and meerkats. Most guests skip it — their loss. It's peaceful and educational.", intensity: "low" },
      ],
    },
    dl: {
      rides: [
        { time: "09:00", title: "Indiana Jones Adventure", location: "Adventureland", duration: "25 min", category: "ride", why: "A thrilling jeep ride through a cursed temple — exclusive to Disneyland. The practical effects and massive snake animatronic are incredible.", intensity: "moderate", insiderTip: "The queue has a decoder card hidden near the entrance — find it and translate the ancient script on the walls.", dreamMatch: true, lightningLane: { type: "LL", reason: "DLR's busiest ride — 50–80 min standby is standard. LL is essential here; the single-rider line is also a good backup.", savings: "Save 40–65 min" } },
        { time: "09:30", title: "Matterhorn Bobsleds", location: "Fantasyland", duration: "20 min", category: "ride", why: "The world's first tubular steel roller coaster — an icon since 1959. The Abominable Snowman lurks inside the mountain.", intensity: "moderate", lightningLane: { type: "LL", reason: "Averages 40–55 min standby. The ride is short, so LL keeps the ratio of fun-to-wait in your favor.", savings: "Save 30–45 min" } },
        { time: "10:00", title: "Pirates of the Caribbean", location: "New Orleans Square", duration: "20 min", category: "ride", why: "The ORIGINAL — longer and more elaborate than the WDW version. Walt personally oversaw this one. The bayou scene at the start is pure atmosphere.", intensity: "low" },
        { time: "10:30", title: "Haunted Mansion", location: "New Orleans Square", duration: "20 min", category: "ride", why: "The Disneyland version has a unique nightmare-before-Christmas overlay during Halloween season. Year-round, it's eerie perfection.", intensity: "low" },
        { time: "11:00", title: "Space Mountain", location: "Tomorrowland", duration: "20 min", category: "ride", why: "Disneyland's version is smoother and more immersive than WDW's. A must-ride classic in near-total darkness.", intensity: "moderate", lightningLane: { type: "LL", reason: "35–55 min standby. LL makes this a quick stop on your Tomorrowland loop.", savings: "Save 25–45 min" } },
      ],
      dining: [
        { time: "12:00", title: "Lunch at Café Orléans", location: "New Orleans Square", duration: "60 min", category: "dining", why: "Sit on a wrought-iron balcony overlooking the Rivers of America. The pommes frites (three-cheese monte cristo battered fries) are legendary.", intensity: "low", insiderTip: "Ask for patio seating — it's one of the most charming dining spots in any Disney park." },
        { time: "15:00", title: "Mint Julep & Beignets", location: "New Orleans Square", duration: "15 min", category: "snack", why: "Powdered-sugar beignets and a mint julep — a Disneyland-exclusive tradition. Eat them in the nearby garden for peak New Orleans vibes.", intensity: "low" },
      ],
      shows: [
        { time: "21:00", title: "Fantasmic!", location: "Rivers of America", duration: "25 min", category: "show", why: "Water screens, fireworks, a fire-breathing dragon, and Mickey fighting villains. Disneyland's version is widely considered superior to WDW's.", intensity: "low", dreamMatch: true },
        { time: "09:30", title: "Walk Through Sleeping Beauty Castle", location: "Fantasyland", duration: "15 min", category: "explore", why: "Unlike Cinderella Castle at WDW, you can walk THROUGH this one and see dioramas of the Sleeping Beauty story. Intimate and magical.", intensity: "low" },
      ],
      explore: [],
    },
    dca: {
      rides: [
        { time: "09:00", title: "Radiator Springs Racers", location: "Cars Land", duration: "25 min", category: "ride", why: "Race through the desert at 40mph past stunning animatronics of Lightning McQueen and Mater. Often called the best ride at Disneyland Resort.", intensity: "moderate", insiderTip: "Rope drop or Lightning Lane — midday waits hit 90+ minutes.", dreamMatch: true, lightningLane: { type: "ILL", cost: "$20–25", reason: "DCA's most popular ride with 70–120 min waits. ILL is the top purchase at Disneyland Resort — without it, you may wait 2 hours.", savings: "Save 60–100 min" } },
        { time: "09:30", title: "WEB SLINGERS: A Spider-Man Adventure", location: "Avengers Campus", duration: "20 min", category: "ride", why: "Shoot webs from your hands (no controller needed) to capture spider-bots. The motion tracking technology is remarkably responsive.", intensity: "low", lightningLane: { type: "LL", reason: "Averages 40–55 min standby. LL keeps your Avengers Campus time efficient.", savings: "Save 30–45 min" } },
        { time: "10:00", title: "Incredicoaster", location: "Pixar Pier", duration: "20 min", category: "ride", why: "A fast, long California Screamin' coaster re-themed to The Incredibles. Goes 0-55mph with a full loop. The best pure coaster at the resort.", intensity: "high", lightningLane: { type: "LL", reason: "35–50 min standby. LL is a solid pick for thrill-seekers — you'll want to re-ride this one.", savings: "Save 25–40 min" } },
        { time: "10:30", title: "Guardians of the Galaxy – Mission: BREAKOUT!", location: "Avengers Campus", duration: "20 min", category: "ride", why: "A randomized drop tower with Rocket Raccoon narrating. Six different ride profiles mean no two experiences are the same.", intensity: "high", lightningLane: { type: "LL", reason: "40–60 min standby on busy days. LL saves meaningful time on a ride with high replay value.", savings: "Save 30–50 min" } },
      ],
      dining: [
        { time: "12:00", title: "Lunch at Lamplight Lounge", location: "Pixar Pier", duration: "75 min", category: "dining", why: "Waterfront dining with Pixar art covering every surface. The lobster nachos are a must-order. Request a patio table for boardwalk views.", intensity: "low", vibeMatch: ["foodie"], insiderTip: "The downstairs lounge is walk-up only — same menu, shorter wait, incredible views." },
        { time: "15:30", title: "Churro at a Cart", location: "Various", duration: "10 min", category: "snack", why: "Disneyland churros are bigger and better than WDW's. Seasonal flavors appear around holidays — check what's available.", intensity: "low" },
      ],
      shows: [],
      explore: [
        { time: "20:00", title: "Cars Land at Night", location: "Cars Land", duration: "30 min", category: "explore", why: "When the sun goes down, the neon signs of Route 66 light up and transform Cars Land into real-life Radiator Springs. One of Disney's most photographed spots.", intensity: "low", vibeMatch: ["photo", "magic"], dreamMatch: true },
      ],
    },
  };

  // Pool day index
  const poolDayIndex = isRelaxed && dates.duration >= 5 ? Math.floor(dates.duration / 2) : -1;

  for (let d = 0; d < dates.duration; d++) {
    const isArrivalDay = d === 0 && dates.duration >= 5;
    const isDepartureDay = d === dates.duration - 1 && dates.duration >= 5;
    const isPoolDay = d === poolDayIndex;

    if (isArrivalDay) {
      days.push({
        dayNumber: d + 1,
        label: "Arrival Day",
        parkName: "Travel & Settle In",
        parkEmoji: "✈️",
        theme: "Ease into the magic",
        openingStrategy: "",
        dayNarrative: "Your vacation starts the moment you arrive. Rather than rushing to a park jet-lagged and overwhelmed, we've planned a relaxed arrival day that lets you soak in the resort atmosphere, get your bearings, and build anticipation for the days ahead.",
        blocks: [
          { time: "14:00", title: "Resort Check-In & Explore", location: "Your Resort", duration: "90 min", category: "explore", why: "Disney resorts are destinations in themselves — walk the grounds, find the pool, grab resort maps, and let the kids burn off travel energy.", intensity: "low" },
          { time: "16:00", title: "Resort Pool Time", location: "Your Resort Pool", duration: "120 min", category: "rest", why: "Every Disney resort pool has slides, splash areas, and poolside service. It's the perfect way to decompress after traveling.", intensity: "low", insiderTip: "Most resort pools have a 'quiet pool' too — great if you want adult-only relaxation." },
          { time: "18:30", title: data.selectedResort === "wdw" ? "Dinner at Disney Springs" : "Dinner at Downtown Disney", location: data.selectedResort === "wdw" ? "Disney Springs" : "Downtown Disney", duration: "90 min", category: "dining", why: "No park ticket needed. Great restaurants, live entertainment, and the World of Disney store. It's a low-key first evening that gets you into the Disney spirit.", intensity: "low" },
          { time: "20:30", title: "Evening Stroll & Early Night", location: "Your Resort", duration: "60 min", category: "explore", why: "Walk the resort grounds at night — Disney resorts are beautifully lit. Turn in early so you're rested for rope drop tomorrow.", intensity: "low" },
        ],
      });
      continue;
    }

    if (isDepartureDay) {
      days.push({
        dayNumber: d + 1,
        label: "Departure Day",
        parkName: "Final Morning Magic",
        parkEmoji: "🧳",
        theme: "One last sprinkle of pixie dust",
        openingStrategy: "",
        dayNarrative: "Don't waste your last morning! Even with a checkout to handle and a flight to catch, there's time for one final dose of magic. We've planned a light, emotionally satisfying sendoff.",
        blocks: [
          { time: "07:00", title: "Sunrise Walk & Coffee", location: "Your Resort", duration: "45 min", category: "rest", why: "Take a quiet morning walk through the resort before the rush. Grab coffee and soak in the atmosphere one last time. These quiet moments become core memories.", intensity: "low" },
          { time: "08:00", title: "Resort Breakfast", location: "Your Resort Restaurant", duration: "60 min", category: "dining", why: "A sit-down breakfast without rushing. Reflect on the trip, look through your photos, and let the kids recount their favorite moments.", intensity: "low" },
          { time: "09:30", title: "Pack Up & Check Out", location: "Your Resort", duration: "60 min", category: "travel", why: "Bell services can hold your luggage if your flight is later — giving you time for a last-minute resort stop or gift shop run.", intensity: "low" },
          { time: "11:00", title: "Head to Airport / Departure", location: "Airport", duration: "90 min", category: "travel", why: "Allow plenty of buffer time. The Magical Express or Mears Connect handles the drive if you're at WDW.", intensity: "low" },
        ],
      });
      continue;
    }

    if (isPoolDay) {
      days.push({
        dayNumber: d + 1,
        label: "Rest Day",
        parkName: "Resort & Recharge",
        parkEmoji: "🏊",
        theme: "Recharge for the magic ahead",
        openingStrategy: "",
        dayNarrative: "A mid-trip rest day isn't laziness — it's strategy. Guests who take a break day report enjoying their remaining park days significantly more. You'll sleep in, hit the pool, and save your feet for tomorrow.",
        blocks: [
          { time: "09:00", title: "Sleep In & Slow Morning", location: "Your Resort", duration: "120 min", category: "rest", why: "After days of rope drop and park walking, your body needs this. Disney vacations average 20,000+ steps per day — rest is earned.", intensity: "low" },
          { time: "11:00", title: "Pool Day", location: "Your Resort Pool", duration: "180 min", category: "rest", why: "Disney resort pools are world-class — waterslides, lazy rivers, splash zones. Many guests say the pool day was their kids' favorite day of the trip.", intensity: "low" },
          { time: "15:00", title: "Resort Exploration & Shopping", location: "Your Resort & Nearby Resorts", duration: "120 min", category: "explore", why: "Resort hop! You can visit other Disney resorts freely — the Polynesian, Grand Floridian, and Contemporary are worth exploring even if you're not staying there.", intensity: "low", insiderTip: "The monorail connects three WDW resorts — ride it as a free 'tour' of the properties." },
          { time: "18:00", title: data.selectedResort === "wdw" ? "Dinner at Disney Springs" : "Dinner at Downtown Disney", location: data.selectedResort === "wdw" ? "Disney Springs" : "Downtown Disney", duration: "120 min", category: "dining", why: "A relaxed evening with no park closing to worry about. Browse the shops, catch live music, and enjoy a meal without a park crowd.", intensity: "low" },
        ],
      });
      continue;
    }

    // Park day
    const parkIndex = (() => {
      const parkDayCount = days.filter(dd => !["✈️", "🧳", "🏊"].includes(dd.parkEmoji)).length;
      return parkDayCount % selectedParks.length;
    })();
    const park = selectedParks[parkIndex] || selectedParks[0];
    const activities = parkActivities[park.id];

    if (!activities) {
      // Fallback for unknown parks
      days.push({
        dayNumber: d + 1,
        label: `Day ${d + 1}`,
        parkName: park.name,
        parkEmoji: park.emoji,
        theme: "A full day of adventure",
        openingStrategy: "Arrive 30 minutes before published opening.",
        dayNarrative: `Today you'll explore ${park.name}. Arrive early, hit the popular rides first, and enjoy the atmosphere.`,
        blocks: [],
      });
      continue;
    }

    // Build the day's blocks intelligently
    const dayBlocks: ItineraryBlock[] = [];

    // 1. Pick rides — prioritize dreams, then vibes, then essential
    const parkDreamIds = (dreamsByPark[park.id] || []).filter(dm => !usedDreams.has(dm.id));
    const availableRides = [...activities.rides];

    // Add dream-matched rides first
    for (const dr of parkDreamIds) {
      const matchingRide = availableRides.find(r =>
        r.title.toLowerCase().includes(dr.label.toLowerCase().split(" ").slice(-2).join(" ")) ||
        dr.label.toLowerCase().includes(r.title.toLowerCase().split(" ")[0].toLowerCase())
      );
      if (matchingRide) {
        dayBlocks.push({ ...matchingRide, dreamMatch: true });
        usedDreams.add(dr.id);
      }
    }

    // Fill with best rides based on vibes
    const rideCount = isThrillSeeker ? 5 : isRelaxed ? 3 : isLittles ? 3 : 4;
    for (const ride of availableRides) {
      if (dayBlocks.length >= rideCount) break;
      if (dayBlocks.find(b => b.title === ride.title)) continue;
      if (isLittles && ride.intensity === "high") continue;
      dayBlocks.push(ride);
    }

    // 2. Add dining
    for (const meal of activities.dining) {
      const isDreamDining = parkDreamIds.some(dr => meal.title.toLowerCase().includes(dr.label.toLowerCase().split(" ").pop() || ""));
      const matchesVibe = meal.vibeMatch?.some(v => vibeIds.has(v));
      if (isDreamDining || matchesVibe || dayBlocks.filter(b => b.category === "dining" || b.category === "snack").length < 3) {
        dayBlocks.push({ ...meal, dreamMatch: isDreamDining || meal.dreamMatch });
        if (isDreamDining) {
          const dreamId = parkDreamIds.find(dr => meal.title.toLowerCase().includes(dr.label.toLowerCase().split(" ").pop() || ""))?.id;
          if (dreamId) usedDreams.add(dreamId);
        }
      }
    }

    // 3. Add shows
    for (const show of activities.shows) {
      dayBlocks.push(show);
    }

    // 4. Add exploration if photo/magic vibes
    if (isPhotoFocused || vibeIds.has("magic")) {
      for (const exp of activities.explore) {
        dayBlocks.push(exp);
      }
    } else if (activities.explore.length > 0) {
      dayBlocks.push(activities.explore[0]);
    }

    // 5. Add a rest block in the afternoon
    if (!isRelaxed) {
      dayBlocks.push({
        time: "13:00",
        title: "Midday Break",
        location: "Your Resort or Shaded Area",
        duration: "90 min",
        category: "rest",
        why: `${data.dates.month} in ${data.selectedResort === "wdw" ? "Florida" : "California"} can be intense. A midday break to recharge (hotel pool, nap, or air-conditioned restaurant) means you'll have energy for the evening magic instead of being exhausted by 6pm.`,
        intensity: "low",
      });
    }

    // Sort by time
    dayBlocks.sort((a, b) => a.time.localeCompare(b.time));

    // Build narrative
    const dreamCount = dayBlocks.filter(b => b.dreamMatch).length;
    const narrativeParts: string[] = [];
    if (isFirstTime) narrativeParts.push(`This is your first time at ${park.name}, so we've included the absolute must-do experiences`);
    else narrativeParts.push(`We've curated today's ${park.name} itinerary to match your style`);
    if (dreamCount > 0) narrativeParts.push(`and woven in ${dreamCount} of your dream list items`);
    if (isThrillSeeker) narrativeParts.push(`. We front-loaded the biggest thrills at rope drop when lines are shortest`);
    if (isFoodie) narrativeParts.push(`. The dining selections highlight ${park.name}'s best culinary experiences`);
    if (isLittles) narrativeParts.push(`. We skipped intense rides and built in extra rest time for little ones`);
    narrativeParts.push(".");

    days.push({
      dayNumber: d + 1,
      label: `Day ${d + 1}`,
      parkName: park.name,
      parkEmoji: park.emoji,
      theme: isThrillSeeker ? "Front-load the thrills, savor the evening" : isFoodie ? "Taste everything, ride between meals" : isRelaxed ? "Easy pace, no FOMO" : "Hit the highlights, enjoy every moment",
      openingStrategy: `Arrive 30–45 minutes before posted park opening. ${park.name === "Magic Kingdom" || park.name === "Disneyland Park" ? "The castle view at rope drop with minimal crowds is worth the early wake-up." : "Early entry guests get a 30-minute head start — use it for the biggest ride."}`,
      dayNarrative: narrativeParts.join(""),
      blocks: dayBlocks,
    });
  }

  return days;
}

/* ── Component ── */
const DreamItinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wizardData = location.state as WizardData | null;
  const [currentDay, setCurrentDay] = useState(0);
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const [parkOverrides, setParkOverrides] = useState<Record<number, string>>({});
  const [showParkSwap, setShowParkSwap] = useState<number | null>(null);

  // Available parks for swapping (from wizard selections)
  const availableParks = wizardData?.selectedParks || [];

  const plan = useMemo(() => {
    if (!wizardData) return [];
    // Apply park overrides to wizard data
    const modifiedData = { ...wizardData };
    return generateFullPlan(modifiedData);
  }, [wizardData]);

  // Apply park overrides to plan for display
  const displayPlan = useMemo(() => {
    if (!plan.length || !wizardData) return plan;
    return plan.map((day, i) => {
      const overrideParkId = parkOverrides[i];
      if (!overrideParkId || ["✈️", "🧳", "🏊"].includes(day.parkEmoji)) return day;
      const newPark = availableParks.find(p => p.id === overrideParkId);
      if (!newPark || newPark.name === day.parkName) return day;
      // Regenerate this day with the new park
      const regenerated = generateFullPlan({
        ...wizardData,
        selectedParks: [newPark],
        dates: { ...wizardData.dates, duration: 1 },
      });
      if (regenerated.length > 0) {
        return { ...regenerated[0], dayNumber: day.dayNumber, label: day.label };
      }
      return day;
    });
  }, [plan, parkOverrides, wizardData, availableParks]);

  if (!wizardData || plan.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Sparkles className="w-10 h-10 text-gold mb-4" />
        <h1 className="font-display text-2xl text-foreground mb-2">No Dream Plan Found</h1>
        <p className="font-editorial text-sm text-muted-foreground mb-6">Start by building your dream vacation first.</p>
        <Link to="/dream-planner" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" /> Start Dream Planner
        </Link>
      </div>
    );
  }

  const day = displayPlan[currentDay];
  const totalDreamsUsed = displayPlan.reduce((sum, d) => sum + d.blocks.filter(b => b.dreamMatch).length, 0);
  const isParkDay = !["✈️", "🧳", "🏊"].includes(day.parkEmoji);
  const totalLLRecs = day.blocks.filter(b => b.lightningLane).length;
  const totalILLRecs = day.blocks.filter(b => b.lightningLane?.type === "ILL").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-editorial text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Planner
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/10 border border-gold/20 font-editorial text-xs text-gold">
                <Sparkles className="w-3 h-3" /> {wizardData.dates.duration} Days · {wizardData.dates.month}
              </span>
              {totalDreamsUsed > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-lavender/10 border border-lavender/20 font-editorial text-xs text-lavender">
                  <Heart className="w-3 h-3" /> {totalDreamsUsed} Dreams Included
                </span>
              )}
            </div>
          </div>
          <h1 className="font-display text-xl text-foreground">Your Dream Itinerary</h1>
        </div>

        {/* Day navigation */}
        <div className="max-w-6xl mx-auto px-6 pb-0">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0">
            {plan.map((d, i) => (
              <button
                key={i}
                onClick={() => { setCurrentDay(i); setExpandedBlock(null); }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-t-lg font-editorial text-xs transition-all duration-300 border-b-2 ${currentDay === i
                  ? "bg-card border-gold text-foreground shadow-soft"
                  : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="block text-lg leading-none mb-0.5">{d.parkEmoji}</span>
                <span className="block whitespace-nowrap">Day {d.dayNumber}</span>
                {d.blocks.some(b => b.dreamMatch) && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-lavender mx-auto mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Day Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDay}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Day header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{day.parkEmoji}</span>
                <div>
                  <p className="label-text text-gold">{day.label}</p>
                  <h2 className="font-display text-2xl text-foreground">{day.parkName}</h2>
                </div>
              </div>
              <p className="font-editorial text-sm text-muted-foreground italic mt-1">"{day.theme}"</p>

              {/* Day narrative */}
              <div className="mt-4 rounded-lg bg-gold/5 border border-gold/15 p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-editorial text-xs font-medium text-foreground mb-1">Why this plan</p>
                    <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{day.dayNarrative}</p>
                  </div>
                </div>
              </div>

              {day.openingStrategy && (
                <div className="mt-3 rounded-lg bg-sky/5 border border-sky/15 p-4">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-sky mt-0.5 shrink-0" />
                    <div>
                      <p className="font-editorial text-xs font-medium text-foreground mb-1">Opening Strategy</p>
                      <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{day.openingStrategy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-3">
                {day.blocks.map((block, i) => {
                  const color = categoryColor(block.category);
                  const intInfo = intensityLabel(block.intensity);
                  const isExpanded = expandedBlock === i;

                  return (
                    <motion.div
                      key={`${currentDay}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <button
                        onClick={() => setExpandedBlock(isExpanded ? null : i)}
                        className={`w-full text-left rounded-lg border p-4 pl-14 relative transition-all duration-300 ${isExpanded
                          ? `border-${color}/30 bg-${color}-light/30 shadow-soft`
                          : "border-border bg-card hover:border-border hover:shadow-soft"
                        }`}
                        style={isExpanded ? {
                          borderColor: `hsl(var(--${color}) / 0.3)`,
                          backgroundColor: `hsl(var(--${color}) / 0.04)`,
                        } : {}}
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute left-3 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
                          style={{
                            borderColor: `hsl(var(--${color}))`,
                            backgroundColor: block.dreamMatch ? `hsl(var(--${color}))` : `hsl(var(--background))`,
                          }}
                        >
                          {block.dreamMatch && <Star className="w-2.5 h-2.5 text-background" />}
                        </div>

                        {/* Content */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-editorial text-[0.65rem] text-muted-foreground">{block.time}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6rem] font-editorial"
                                style={{
                                  backgroundColor: `hsl(var(--${color}) / 0.08)`,
                                  color: `hsl(var(--${color}))`,
                                }}
                              >
                                {categoryIcon(block.category)}
                                {block.category}
                              </span>
                              {block.dreamMatch && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-lavender/10 text-lavender text-[0.6rem] font-editorial">
                                  <Sparkles className="w-2.5 h-2.5" /> Dream List
                                </span>
                              )}
                            </div>
                            <p className="font-display text-sm text-foreground">{block.title}</p>
                            <p className="font-editorial text-xs text-muted-foreground mt-0.5">{block.location} · {block.duration}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 mt-2 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-3 border-t border-border space-y-3">
                                {/* Why */}
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                                    style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
                                  >
                                    <Info className="w-3 h-3" style={{ color: `hsl(var(--${color}))` }} />
                                  </div>
                                  <div>
                                    <p className="font-editorial text-[0.65rem] font-medium text-foreground mb-0.5">Why we chose this</p>
                                    <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{block.why}</p>
                                  </div>
                                </div>

                                {/* Insider tip */}
                                {block.insiderTip && (
                                  <div className="flex items-start gap-2">
                                    <div className="w-5 h-5 rounded-md bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <Star className="w-3 h-3 text-gold" />
                                    </div>
                                    <div>
                                      <p className="font-editorial text-[0.65rem] font-medium text-foreground mb-0.5">Insider Tip</p>
                                      <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{block.insiderTip}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Intensity + vibe match */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.6rem] font-editorial"
                                    style={{
                                      backgroundColor: `hsl(var(--${intInfo.color}) / 0.08)`,
                                      color: `hsl(var(--${intInfo.color}))`,
                                    }}
                                  >
                                    <Zap className="w-2.5 h-2.5" /> {intInfo.text}
                                  </span>
                                  {block.vibeMatch?.filter(v => wizardData.selectedVibes.some(sv => sv.id === v)).map(v => {
                                    const vibe = wizardData.selectedVibes.find(sv => sv.id === v);
                                    return vibe ? (
                                      <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[0.6rem] font-editorial text-muted-foreground">
                                        {vibe.emoji} Matches your "{vibe.label}" vibe
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Day summary stats */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: "Activities", value: day.blocks.length, icon: <Ticket className="w-3.5 h-3.5 text-sky" /> },
                { label: "Dream Items", value: day.blocks.filter(b => b.dreamMatch).length, icon: <Heart className="w-3.5 h-3.5 text-lavender" /> },
                { label: "Meals & Snacks", value: day.blocks.filter(b => b.category === "dining" || b.category === "snack").length, icon: <Utensils className="w-3.5 h-3.5 text-coral" /> },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center shadow-soft">
                  <div className="flex items-center justify-center gap-1.5 mb-1">{stat.icon}<span className="label-text text-[0.6rem]">{stat.label}</span></div>
                  <p className="font-display text-xl text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom CTA */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-editorial text-xs text-muted-foreground">Love this plan?</p>
            <p className="font-editorial text-sm text-foreground">Turn it into a real trip you can customize.</p>
          </div>
          <Link
            to="/adventure"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background font-editorial text-sm hover:opacity-90 transition-opacity"
          >
            Create This Trip <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DreamItinerary;
