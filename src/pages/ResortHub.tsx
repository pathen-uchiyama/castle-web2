import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Search, Star, ChevronDown, MapPin, Thermometer, Clock, Users, Car, Utensils, BedDouble, ShoppingBag, TreePine, Waves, Zap, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import {
  wdwResort, wdwHotels, wdwRestaurants, wdwParks, wdwShopping,
  type ResortDestination, type ResortHotel, type ResortRestaurant, type ParkOverview, type ParkAttraction,
  type HotelCategory, type ServiceType, type PriceRange, type ShoppingArea,
} from "@/data/resortEncyclopedia";
import { dlrResort, dlrHotels, dlrRestaurants, dlrParks, dlrShopping } from "@/data/dlrEncyclopedia";
import { wdwEncyclopediaAttractions, dlrEncyclopediaAttractions } from "@/data/encyclopediaAttractions";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

const crowdColors: Record<string, { bg: string; text: string }> = {
  low: { bg: "hsl(142 60% 45% / 0.1)", text: "hsl(142 60% 35%)" },
  moderate: { bg: "hsl(var(--gold) / 0.1)", text: "hsl(var(--gold-dark))" },
  high: { bg: "hsl(25 90% 50% / 0.1)", text: "hsl(25 90% 40%)" },
  "very-high": { bg: "hsl(var(--destructive) / 0.08)", text: "hsl(var(--destructive))" },
  extreme: { bg: "hsl(var(--destructive) / 0.15)", text: "hsl(var(--destructive))" },
};

const categoryLabels: Record<HotelCategory, string> = {
  value: "Value", moderate: "Moderate", deluxe: "Deluxe", "deluxe-villa": "Deluxe Villa / DVC", campground: "Campground",
};

const serviceLabels: Record<ServiceType, string> = {
  signature: "Signature", "table-service": "Table Service", "quick-service": "Quick Service", snack: "Snack",
  lounge: "Lounge", "dinner-show": "Dinner Show", "character-dining": "Character Dining",
  "food-truck": "Food Truck", kiosk: "Kiosk", buffet: "Buffet", "prix-fixe": "Prix Fixe",
};

const priceLabel: Record<PriceRange, string> = { "$": "Budget", "$$": "Moderate", "$$$": "Upscale", "$$$$": "Premium" };

const thrillColors: Record<string, { bg: string; text: string }> = {
  gentle: { bg: "hsl(142 60% 45% / 0.1)", text: "hsl(142 60% 35%)" },
  moderate: { bg: "hsl(var(--gold) / 0.1)", text: "hsl(var(--gold-dark))" },
  thrilling: { bg: "hsl(25 90% 50% / 0.1)", text: "hsl(25 90% 40%)" },
  intense: { bg: "hsl(var(--destructive) / 0.1)", text: "hsl(var(--destructive))" },
};

type Tab = "overview" | "parks" | "hotels" | "dining" | "transport" | "shopping";

function getResortData(resortId: string): {
  resort: ResortDestination;
  hotels: ResortHotel[];
  restaurants: ResortRestaurant[];
  parks: ParkOverview[];
  shopping: ShoppingArea[];
  attractions: ParkAttraction[];
} | null {
  if (resortId === "wdw") return { resort: wdwResort, hotels: wdwHotels, restaurants: wdwRestaurants, parks: wdwParks, shopping: wdwShopping, attractions: wdwEncyclopediaAttractions };
  if (resortId === "dlr") return { resort: dlrResort, hotels: dlrHotels, restaurants: dlrRestaurants, parks: dlrParks, shopping: dlrShopping, attractions: dlrEncyclopediaAttractions };
  return null;
}

const ResortHub = () => {
  const { resortId } = useParams<{ resortId: string }>();
  const data = getResortData(resortId || "");

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [hotelCategoryFilter, setHotelCategoryFilter] = useState<HotelCategory | "all">("all");
  const [diningSearch, setDiningSearch] = useState("");
  const [diningLocation, setDiningLocation] = useState<string>("all");
  const [diningService, setDiningService] = useState<ServiceType | "all">("all");
  const [diningPrice, setDiningPrice] = useState<PriceRange | "all">("all");
  const [diningCharOnly, setDiningCharOnly] = useState(false);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [parkType, setParkType] = useState<"all" | "theme-park" | "water-park">("all");
  const [expandedPark, setExpandedPark] = useState<string | null>(null);

  const filteredHotels = useMemo(() =>
    data ? (hotelCategoryFilter === "all" ? data.hotels : data.hotels.filter(h => h.category === hotelCategoryFilter)) : [],
    [hotelCategoryFilter, data]
  );

  const diningLocations = useMemo(() => {
    if (!data) return ["all"];
    const locs = new Set(data.restaurants.map(r => r.locationName));
    return ["all", ...Array.from(locs).sort()];
  }, [data]);

  const filteredRestaurants = useMemo(() =>
    data ? data.restaurants.filter(r => {
      if (diningSearch && !r.name.toLowerCase().includes(diningSearch.toLowerCase()) && !r.cuisine.toLowerCase().includes(diningSearch.toLowerCase())) return false;
      if (diningLocation !== "all" && r.locationName !== diningLocation) return false;
      if (diningService !== "all" && r.serviceType !== diningService) return false;
      if (diningPrice !== "all" && r.priceRange !== diningPrice) return false;
      if (diningCharOnly && !r.characterDining) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating) : [],
    [diningSearch, diningLocation, diningService, diningPrice, diningCharOnly, data]
  );

  const filteredParks = useMemo(() =>
    data ? (parkType === "all" ? data.parks : data.parks.filter(p => p.type === parkType)) : [],
    [parkType, data]
  );

  if (!data) return <Navigate to="/guides" replace />;

  const { resort, shopping, attractions } = data;

  const hotelCategories = useMemo(() => {
    const cats = new Set(data.hotels.map(h => h.category));
    return ["all" as const, ...Array.from(cats)] as (HotelCategory | "all")[];
  }, [data]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: "parks", label: "Parks", icon: <TreePine className="w-3.5 h-3.5" /> },
    { id: "hotels", label: "Hotels", icon: <BedDouble className="w-3.5 h-3.5" /> },
    { id: "dining", label: "Dining", icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: "transport", label: "Getting Around", icon: <Car className="w-3.5 h-3.5" /> },
    { id: "shopping", label: "Shopping & Entertainment", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" : "text-border"}`} />
      ))}
      <span className="font-display text-xs text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  const getAttractionsForPark = (parkId: string) => attractions.filter(a => a.parkId === parkId);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-foreground text-background px-8 lg:px-16 pt-32 pb-16">
        <motion.div {...fade()}>
          <Link to="/guides" className="inline-flex items-center gap-1.5 text-background/40 hover:text-background/70 transition-colors mb-6 text-[0.625rem] uppercase tracking-[0.2em]">
            <ArrowLeft className="w-3 h-3" /> All Resorts
          </Link>
          <p className="text-[0.625rem] uppercase tracking-[0.3em] text-background/50 mb-4">Resort Guide</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-4">{resort.name}</h1>
          <p className="font-editorial text-lg text-background/60 max-w-2xl mb-6">{resort.tagline} · {resort.location}</p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border border-background/20 text-background/70">📍 {resort.size}</span>
            <span className="px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border border-background/20 text-background/70">🗓 Est. {resort.opened}</span>
            <span className="px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border border-background/20 text-background/70">
              🏰 {data.parks.filter(p => p.type === "theme-park").length} Theme Parks{data.parks.filter(p => p.type === "water-park").length > 0 ? ` · ${data.parks.filter(p => p.type === "water-park").length} Water Parks` : ""}
            </span>
            <span className="px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border border-background/20 text-background/70">🏨 {data.hotels.length} Resort Hotels</span>
          </div>
          {/* Resort switcher */}
          <div className="mt-6 flex gap-2">
            {["wdw", "dlr"].map(rid => (
              <Link key={rid} to={`/resort/${rid}`}
                className={`px-4 py-2 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border transition-all ${
                  resortId === rid ? "bg-background text-foreground border-background" : "text-background/40 border-background/20 hover:text-background/70 hover:border-background/40"
                }`}>
                {rid === "wdw" ? "Walt Disney World" : "Disneyland Resort"}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[60px] z-30 bg-card border-b border-border shadow-[var(--shadow-soft)]">
        <div className="px-8 lg:px-16 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-4 transition-all duration-500 shrink-0 ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
              }`}>
              {tab.icon}
              <span className="uppercase tracking-[0.2em] text-[0.6875rem] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[hsl(var(--gold))]" layoutId="resort-tab" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 lg:px-16 py-12 lg:py-20">
        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-16">
            <motion.div {...fade()}>
              <p className="label-text mb-4">About the Resort</p>
              <p className="font-editorial text-lg text-foreground/80 leading-relaxed max-w-3xl mb-8">{resort.description}</p>
              <div className="flex flex-wrap gap-2 mb-12">
                {resort.knownFor.map(item => (
                  <span key={item} className="px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.1em] bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">{item}</span>
                ))}
              </div>
            </motion.div>

            <motion.div {...fade(0.1)}>
              <p className="label-text mb-2 flex items-center gap-2"><Thermometer className="w-4 h-4" /> Weather</p>
              <p className="font-editorial text-sm text-muted-foreground mb-6 max-w-2xl">{resort.weatherSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {resort.weatherByMonth.map(w => (
                  <div key={w.month} className="border border-border bg-card rounded-lg p-4 shadow-[var(--shadow-soft)]">
                    <p className="font-display text-sm text-foreground mb-1">{w.month}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-xl text-foreground">{w.avgHigh}°</span>
                      <span className="text-xs text-muted-foreground">/ {w.avgLow}°</span>
                    </div>
                    <p className="text-[0.5rem] text-muted-foreground">🌧 {w.rainDays} rain days</p>
                    <p className="font-editorial text-[0.625rem] text-muted-foreground mt-1.5 italic">{w.note}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fade(0.15)}>
              <p className="label-text mb-6">The Parks at a Glance</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.parks.map(park => (
                  <button key={park.parkId} onClick={() => { setActiveTab("parks"); setParkType(park.type); }}
                    className="text-left border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{park.icon}</span>
                      <h3 className="font-display text-lg text-foreground">{park.name}</h3>
                    </div>
                    <p className="font-editorial text-xs text-muted-foreground mb-3">{park.tagline}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {park.knownFor.slice(0, 3).map(k => (
                        <span key={k} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{k}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ═══ PARKS ═══ */}
        {activeTab === "parks" && (
          <div>
            <motion.div {...fade()}>
              <p className="label-text mb-4">The Parks</p>
              <h2 className="font-display text-4xl text-foreground leading-[1.08] mb-4">Theme Parks{data.parks.some(p => p.type === "water-park") ? " & Water Parks" : ""}</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">{data.parks.length} incredible parks — each with its own personality, attractions, and dining.</p>
            </motion.div>

            {data.parks.some(p => p.type === "water-park") && (
              <div className="flex gap-2 mb-8">
                {(["all", "theme-park", "water-park"] as const).map(t => (
                  <button key={t} onClick={() => setParkType(t)}
                     className={`px-4 py-2 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                       parkType === t ? "bg-foreground text-background border-foreground" : "text-muted-foreground border-border hover:border-foreground/30"
                     }`}>
                    {t === "all" ? "All Parks" : t === "theme-park" ? "🏰 Theme Parks" : "🌊 Water Parks"}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-8">
              {filteredParks.map((park, i) => {
                const parkAttractions = getAttractionsForPark(park.parkId);
                const isExpanded = expandedPark === park.parkId;
                return (
                  <motion.div key={park.parkId} {...fade(0.05 + i * 0.03)}
                    className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] overflow-hidden">
                    <div className="p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{park.icon}</span>
                          <div>
                            <h3 className="font-display text-2xl text-foreground">{park.name}</h3>
                            <p className="font-editorial text-sm text-muted-foreground">{park.tagline} · {park.size} · Est. {park.opened}</p>
                          </div>
                        </div>
                         <span className={`px-3 py-1 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border ${
                           park.type === "water-park" ? "bg-[hsl(200,70%,50%,0.1)] text-[hsl(200,70%,40%)] border-[hsl(200,70%,50%,0.2)]" : "bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.2)]"
                         }`}>
                          {park.type === "water-park" ? "Water Park" : "Theme Park"}
                        </span>
                      </div>

                      <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-6 max-w-3xl">{park.description}</p>

                      {/* Hours */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border border-border">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[0.5625rem] text-foreground font-medium">{park.operatingHours.regular}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[hsl(var(--gold)/0.06)] border border-[hsl(var(--gold)/0.2)]">
                          <span className="text-[0.5rem]">⭐</span>
                          <span className="text-[0.5625rem] text-[hsl(var(--gold-dark))] font-medium">Early Entry: {park.operatingHours.earlyEntry}</span>
                        </div>
                        {park.operatingHours.extendedEvening && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground/5 border border-border">
                            <span className="text-[0.5rem]">🌙</span>
                            <span className="text-[0.5625rem] text-foreground font-medium">Extended: {park.operatingHours.extendedEvening}</span>
                          </div>
                        )}
                      </div>

                      {/* Crowd calendar */}
                      <div className="mb-6">
                        <p className="label-text mb-3">Typical Crowd Levels by Day</p>
                        <div className="flex gap-2 flex-wrap">
                          {park.typicalCrowds.map(c => (
                            <div key={c.day} className="border rounded-md px-3 py-2 text-center min-w-[90px]"
                              style={{ background: crowdColors[c.level]?.bg, borderColor: `${crowdColors[c.level]?.text}30` }}>
                              <p className="font-display text-[0.625rem] text-foreground mb-0.5">{c.day}</p>
                              <p className="text-[0.5rem] uppercase tracking-[0.1em] font-medium" style={{ color: crowdColors[c.level]?.text }}>
                                {c.level.replace("-", " ")}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[0.5rem] text-muted-foreground">✅ Best: <strong className="text-foreground">{park.bestDays.join(", ")}</strong></span>
                          <span className="text-[0.5rem] text-muted-foreground">❌ Avoid: <strong className="text-destructive">{park.worstDays.join(", ")}</strong></span>
                        </div>
                      </div>

                      {/* Lands */}
                      <div className="mb-6">
                        <p className="label-text mb-3">Themed Lands</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {park.lands.map(land => (
                            <div key={land.name} className="border border-border bg-[hsl(var(--warm))] rounded-lg p-3">
                              <p className="font-display text-sm text-foreground mb-0.5">{land.name}</p>
                              <p className="font-editorial text-[0.625rem] text-muted-foreground">{land.description}</p>
                              {land.iconicAttraction && (
                                <p className="text-[0.5rem] text-[hsl(var(--gold-dark))] mt-1">⭐ {land.iconicAttraction}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Must Do & Tips */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p className="label-text mb-2">Must-Do</p>
                          <div className="space-y-1">
                            {park.mustDo.map(item => (
                              <div key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[hsl(var(--gold)/0.04)] border border-[hsl(var(--gold)/0.1)]">
                                <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                                <span className="font-editorial text-xs text-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="label-text mb-2">Insider Tips</p>
                          <div className="space-y-1">
                            {park.tips.map(tip => (
                              <div key={tip} className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
                                <span className="text-[0.5rem] mt-0.5">💡</span>
                                <span className="font-editorial text-[0.6875rem] text-muted-foreground">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Attractions Toggle */}
                      {parkAttractions.length > 0 && (
                        <button onClick={() => setExpandedPark(isExpanded ? null : park.parkId)}
                          className="flex items-center gap-2 mt-4 px-4 py-2 rounded-md border border-border hover:border-foreground/30 transition-colors text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground">
                          <Zap className="w-3 h-3" />
                          {isExpanded ? "Hide" : "Show"} {parkAttractions.length} Attractions
                          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {/* Expanded Attractions */}
                    {isExpanded && parkAttractions.length > 0 && (
                      <div className="border-t border-border bg-[hsl(var(--warm))] p-6 lg:p-8">
                        <p className="label-text mb-4">Attractions at {park.name}</p>
                        <div className="space-y-3">
                          {parkAttractions.map(a => (
                            <div key={a.attractionId} className="border border-border bg-card rounded-lg p-4 shadow-[var(--shadow-soft)]">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    {a.mustDo && <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />}
                                    <h4 className="font-display text-base text-foreground">{a.name}</h4>
                                  </div>
                                  <p className="text-[0.5rem] text-muted-foreground">{a.land} · {a.duration}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {a.heightRequirement && (
                                    <span className="px-2 py-0.5 rounded-md text-[0.4375rem] uppercase tracking-[0.08em] bg-muted text-muted-foreground border border-border">↕ {a.heightRequirement}</span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-md text-[0.4375rem] uppercase tracking-[0.08em] border" style={{ background: thrillColors[a.thrillLevel]?.bg, color: thrillColors[a.thrillLevel]?.text, borderColor: `${thrillColors[a.thrillLevel]?.text}30` }}>
                                    {a.thrillLevel}
                                  </span>
                                </div>
                              </div>
                              <p className="font-editorial text-xs text-foreground/80 mb-3">{a.description}</p>
                              <div className="flex flex-wrap gap-3 mb-2">
                                <div>
                                  <p className="text-[0.375rem] uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Avg Wait</p>
                                  <div className="flex gap-1.5">
                                     <span className="text-[0.5rem] px-1.5 py-0.5 rounded-md bg-[hsl(142,60%,45%,0.1)] text-[hsl(142,60%,35%)] border border-[hsl(142,60%,45%,0.2)]">{a.avgWaitMinutes.low}m</span>
                                     <span className="text-[0.5rem] px-1.5 py-0.5 rounded-md bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">{a.avgWaitMinutes.typical}m</span>
                                     <span className="text-[0.5rem] px-1.5 py-0.5 rounded-md bg-[hsl(var(--destructive)/0.08)] text-destructive border border-[hsl(var(--destructive)/0.15)]">{a.avgWaitMinutes.peak}m</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 items-end">
                                  {a.lightningLane && (
                                    <span className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">
                                       ⚡ {a.lightningLaneType === "individual" ? "Individual LL" : "Multi Pass"}
                                    </span>
                                  )}
                                  {a.singleRider && <span className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-muted text-muted-foreground border border-border">🧍 Single Rider</span>}
                                  {a.riderSwitch && <span className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-muted text-muted-foreground border border-border">🔄 Rider Switch</span>}
                                </div>
                              </div>
                              <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
                                <p className="font-editorial text-[0.625rem] text-muted-foreground italic">💡 {a.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ HOTELS ═══ */}
        {activeTab === "hotels" && (
          <div>
            <motion.div {...fade()}>
              <p className="label-text mb-4">Where to Stay</p>
              <h2 className="font-display text-4xl text-foreground leading-[1.08] mb-4">Resort Hotels</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">
                {resortId === "wdw"
                  ? "From budget-friendly value resorts to ultra-luxurious deluxe hotels — every WDW resort includes complimentary transport, Early Entry, and MagicBand+."
                  : "Three on-property hotels — all within walking distance of both parks. On-property perks include Early Entry and exclusive merchandise."}
              </p>
            </motion.div>

            <div className="flex gap-2 mb-8 flex-wrap">
              {hotelCategories.map(cat => (
                <button key={cat} onClick={() => setHotelCategoryFilter(cat)}
                   className={`px-4 py-2 rounded-md text-[0.5625rem] uppercase tracking-[0.12em] border transition-all duration-300 ${
                     hotelCategoryFilter === cat ? "bg-foreground text-background border-foreground" : "text-muted-foreground border-border hover:border-foreground/30"
                   }`}>
                  {cat === "all" ? "All" : categoryLabels[cat]}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {filteredHotels.map((hotel, i) => (
                 <motion.div key={hotel.hotelId} {...fade(0.05 + i * 0.02)}
                   className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display text-xl text-foreground">{hotel.name}</h3>
                        <p className="font-editorial text-sm text-muted-foreground">{hotel.theme}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="px-2.5 py-1 rounded-md text-[0.5625rem] uppercase tracking-[0.1em] border bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border-[hsl(var(--gold)/0.2)]">
                          {categoryLabels[hotel.category]}
                        </span>
                        <p className="font-display text-lg text-foreground mt-1">${hotel.priceRange.low}<span className="text-xs text-muted-foreground font-editorial">–${hotel.priceRange.high}/night</span></p>
                      </div>
                    </div>

                    <StarRating rating={hotel.rating} />
                    <span className="text-[0.5rem] text-muted-foreground ml-2">{hotel.reviewCount.toLocaleString()} reviews</span>

                    <p className="font-editorial text-sm text-foreground/80 leading-relaxed my-4">{hotel.description}</p>

                    <div className="mb-4 pl-3 border-l-2 border-[hsl(var(--gold)/0.4)]">
                      <p className="font-editorial text-xs text-muted-foreground italic">"{hotel.vibe}"</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">Transport to Parks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hotel.transportTo.map(t => (
                          <span key={`${t.parkName}-${t.mode}`} className="px-2 py-1 rounded-md text-[0.5rem] bg-muted border border-border text-muted-foreground">
                            {t.parkName} · {t.mode} · ~{t.estimatedMinutes}min
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">Room Types</p>
                      <div className="flex flex-wrap gap-2">
                        {hotel.roomTypes.map(r => (
                          <div key={r.name} className="px-3 py-2 rounded-md border border-border bg-[hsl(var(--warm))]">
                            <p className="font-display text-[0.625rem] text-foreground">{r.name}</p>
                            <p className="text-[0.5rem] text-muted-foreground">Sleeps {r.sleeps} · From ${r.priceFrom}/night</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {hotel.bestFor.map(b => (
                        <span key={b} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.15)]">✦ {b}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotel.tags.map(tag => (
                         <span key={tag} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>

                    {hotel.tips.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">💡 Insider Tips</p>
                        {hotel.tips.map(tip => (
                          <p key={tip} className="font-editorial text-[0.625rem] text-muted-foreground leading-relaxed">• {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ DINING ═══ */}
        {activeTab === "dining" && (
          <div>
            <motion.div {...fade()}>
              <p className="label-text mb-4">Where to Eat</p>
              <h2 className="font-display text-4xl text-foreground leading-[1.08] mb-4">Dining Guide</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">
                {data.restaurants.length} curated restaurants across the resort.
              </p>
            </motion.div>

            <div className="border border-border bg-card rounded-lg p-4 mb-8 shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                  <input type="text" placeholder="Search restaurants or cuisine..."
                    value={diningSearch} onChange={e => setDiningSearch(e.target.value)}
                    className="w-full border border-border bg-background rounded-md pl-9 pr-3 py-2 font-editorial text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-[hsl(var(--gold))]"
                  />
                </div>
                <span className="font-display text-sm text-muted-foreground">{filteredRestaurants.length} results</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-1 flex-wrap">
                  {diningLocations.map(loc => (
                    <button key={loc} onClick={() => setDiningLocation(loc)}
                      className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.08em] border transition-all ${
                        diningLocation === loc ? "bg-foreground text-background border-foreground" : "text-muted-foreground border-border hover:border-foreground/30"
                      }`}>
                      {loc === "all" ? "All Locations" : loc}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["all", "signature", "table-service", "quick-service", "character-dining", "buffet", "lounge", "snack"] as (ServiceType | "all")[]).map(s => (
                  <button key={s} onClick={() => setDiningService(s)}
                    className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.08em] border transition-all ${
                      diningService === s ? "bg-foreground text-background border-foreground" : "text-muted-foreground border-border hover:border-foreground/30"
                    }`}>
                    {s === "all" ? "All Types" : serviceLabels[s]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["all", "$", "$$", "$$$", "$$$$"] as (PriceRange | "all")[]).map(p => (
                  <button key={p} onClick={() => setDiningPrice(p)}
                    className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.08em] border transition-all ${
                      diningPrice === p ? "bg-foreground text-background border-foreground" : "text-muted-foreground border-border hover:border-foreground/30"
                    }`}>
                    {p === "all" ? "Any Price" : `${p} ${priceLabel[p]}`}
                  </button>
                ))}
                <button onClick={() => setDiningCharOnly(!diningCharOnly)}
                  className={`px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.08em] border transition-all ${
                    diningCharOnly ? "bg-[hsl(var(--gold))] text-background border-[hsl(var(--gold))]" : "text-muted-foreground border-border hover:border-foreground/30"
                  }`}>
                  🧚 Character Dining Only
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRestaurants.map((r, i) => {
                const isExpanded = expandedRestaurant === r.restaurantId;
                return (
                   <motion.div key={r.restaurantId} {...fade(0.02 + i * 0.01)}
                     className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500">
                    <button onClick={() => setExpandedRestaurant(isExpanded ? null : r.restaurantId)}
                      className="w-full text-left p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {r.characterDining && <span className="text-sm">🧚</span>}
                            <h3 className="font-display text-lg text-foreground truncate">{r.name}</h3>
                          </div>
                          <p className="font-editorial text-xs text-muted-foreground">{r.locationName} · {r.locationArea}</p>
                          <p className="font-editorial text-xs text-muted-foreground">{r.cuisine}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <StarRating rating={r.rating} />
                          <p className="text-[0.5rem] text-muted-foreground">{r.reviewCount.toLocaleString()} reviews</p>
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            <span className="font-display text-sm text-foreground">{r.priceRange}</span>
                            <span className="px-2 py-0.5 text-[0.4375rem] uppercase tracking-[0.08em] bg-muted text-muted-foreground border border-border">
                              {serviceLabels[r.serviceType]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.mealPeriods.map(m => (
                          <span key={m} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-[hsl(var(--gold)/0.06)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.1)]">{m}</span>
                        ))}
                        {r.requiresReservation && (
                          <span className={`text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 border ${
                            r.reservationDifficulty === "legendary" || r.reservationDifficulty === "hard"
                              ? "bg-[hsl(var(--destructive)/0.06)] text-destructive border-[hsl(var(--destructive)/0.15)]"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>📋 {r.reservationDifficulty} to book</span>
                        )}
                        {!r.requiresReservation && (
                          <span className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-[hsl(142,60%,45%,0.08)] text-[hsl(142,60%,35%)] border border-[hsl(142,60%,45%,0.15)]">✓ No reservation needed</span>
                        )}
                        <ChevronDown className={`w-3 h-3 text-muted-foreground ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-border/50 pt-4">
                        <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-4">{r.description}</p>
                        <div className="mb-4 pl-3 border-l-2 border-[hsl(var(--gold)/0.4)]">
                          <p className="font-editorial text-xs text-muted-foreground italic">"{r.vibe}"</p>
                        </div>
                        <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">✦ Signature Items</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {r.signatureItems.map(item => (
                            <span key={item} className="px-2.5 py-1 text-[0.5625rem] bg-[hsl(var(--gold)/0.06)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.15)] font-editorial">{item}</span>
                          ))}
                        </div>
                        <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Pricing</p>
                        <p className="font-editorial text-xs text-foreground mb-4">{r.priceNote}</p>
                        <div className="flex flex-wrap gap-4 mb-4 text-xs">
                          {r.kidFriendly && <span className="font-editorial text-muted-foreground">👶 Kid-friendly</span>}
                          {r.dressCode && <span className="font-editorial text-muted-foreground">👔 {r.dressCode}</span>}
                          {r.dietaryAccommodations.length > 0 && (
                            <span className="font-editorial text-muted-foreground">🥗 {r.dietaryAccommodations.join(", ")}</span>
                          )}
                        </div>
                        {(r.noShowFee || r.cancelPolicy) && (
                          <div className="mb-4 px-3 py-2 rounded-md bg-[hsl(var(--destructive)/0.04)] border border-[hsl(var(--destructive)/0.15)]">
                            <p className="text-[0.4375rem] uppercase tracking-[0.1em] text-destructive mb-1">⚠ Cancellation Policy</p>
                            {r.noShowFee && <p className="font-editorial text-[0.625rem] text-muted-foreground">No-show fee: <strong className="text-foreground">{r.noShowFee}</strong></p>}
                            {r.cancelPolicy && <p className="font-editorial text-[0.625rem] text-muted-foreground">{r.cancelPolicy}</p>}
                          </div>
                        )}
                        <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)] mb-4">
                          <p className="text-[0.4375rem] uppercase tracking-[0.1em] text-[hsl(var(--gold-dark))] mb-1">💡 Insider Tip</p>
                          <p className="font-editorial text-[0.6875rem] text-muted-foreground italic">{r.insiderTip}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {r.bestFor.map(b => (
                            <span key={b} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))]">{b}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map(tag => (
                            <span key={tag} className="text-[0.4375rem] uppercase tracking-[0.08em] px-2 py-0.5 bg-muted text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {filteredRestaurants.length === 0 && (
                <div className="py-16 text-center">
                  <p className="font-editorial text-sm text-muted-foreground/40 italic">No restaurants match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TRANSPORT ═══ */}
        {activeTab === "transport" && (
          <div>
            <motion.div {...fade()}>
              <p className="label-text mb-4">Getting Around</p>
              <h2 className="font-display text-4xl text-foreground leading-[1.08] mb-4">Transportation</h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-4">{resort.transportOverview}</p>
            </motion.div>

            <div className="space-y-4">
              {resort.transportModes.map((t, i) => {
                const modeEmoji: Record<string, string> = { bus: "🚌", monorail: "🚝", skyliner: "🚡", boat: "⛴", "minnie-van": "🚗", car: "🅿️", walking: "🚶" };
                return (
                  <motion.div key={t.mode} {...fade(0.05 + i * 0.03)}
                    className="border border-border bg-card rounded-lg p-6 shadow-[var(--shadow-soft)]">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{modeEmoji[t.mode]}</span>
                      <div className="flex-1">
                        <h3 className="font-display text-xl text-foreground mb-1">{t.name}</h3>
                        <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-3">{t.description}</p>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div>
                            <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">Cost</p>
                            <p className="font-display text-sm text-foreground">{t.cost}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[0.4375rem] uppercase tracking-[0.12em] text-muted-foreground mb-1">Serves</p>
                            <div className="flex flex-wrap gap-1">
                              {t.servesAreas.map(a => (
                                <span key={a} className="text-[0.5rem] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">{a}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
                          <p className="font-editorial text-[0.6875rem] text-muted-foreground italic">💡 {t.tip}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SHOPPING ═══ */}
        {activeTab === "shopping" && (
          <div>
            <motion.div {...fade()}>
              <p className="label-text mb-4">Shopping & Entertainment</p>
              <h2 className="font-display text-4xl text-foreground leading-[1.08] mb-4">
                {resortId === "wdw" ? "Disney Springs & Beyond" : "Downtown Disney & Beyond"}
              </h2>
              <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-8">Free admission shopping, dining, and entertainment districts.</p>
            </motion.div>

            {shopping.map(area => (
              <motion.div key={area.areaId} {...fade(0.05)} className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)]">
                <div className="p-6 lg:p-8">
                  <h3 className="font-display text-2xl text-foreground mb-2">{area.name}</h3>
                  <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-6">{area.description}</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                     <span className="px-3 py-1.5 rounded-md text-[0.5625rem] bg-muted border border-border text-muted-foreground">📍 {area.location}</span>
                     <span className="px-3 py-1.5 rounded-md text-[0.5625rem] bg-muted border border-border text-muted-foreground">🕐 {area.hours}</span>
                     <span className="px-3 py-1.5 rounded-md text-[0.5625rem] bg-[hsl(142,60%,45%,0.08)] border border-[hsl(142,60%,45%,0.15)] text-[hsl(142,60%,35%)]">🅿️ {area.parking}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="label-text mb-3">Notable Stores</p>
                      <div className="space-y-2">
                        {area.notableStores.map(store => (
                          <div key={store.name} className="border border-border bg-[hsl(var(--warm))] rounded-lg p-3">
                            <p className="font-display text-sm text-foreground">{store.name}</p>
                            <p className="font-editorial text-[0.625rem] text-muted-foreground">{store.description}</p>
                            <span className="text-[0.4375rem] uppercase tracking-[0.08em] text-muted-foreground/60">{store.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="label-text mb-3">Dining</p>
                      <div className="space-y-1">
                        {area.dining.map(d => (
                          <div key={d} className="px-3 py-2 rounded-md border border-border bg-card text-sm font-editorial text-foreground">🍽 {d}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="label-text mb-3">Entertainment</p>
                      <div className="space-y-1">
                        {area.entertainment.map(e => (
                          <div key={e} className="px-3 py-2 border border-border bg-card text-sm font-editorial text-foreground">🎭 {e}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default ResortHub;
