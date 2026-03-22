import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

/* ── CC Score stars ── */
const CCStars = ({ score }: { score: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn("w-3 h-3", i < score ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-border")}
      />
    ))}
  </div>
);

/* ── Types ── */
interface RideItem {
  id: string;
  name: string;
  ccScore: number;
  typeBadge: string;
  heightRequirement?: string;
  avgWait: number;
  lightningLane: boolean;
  llType?: "individual" | "multi-pass";
  tip: string;
}

interface DiningItem {
  id: string;
  name: string;
  ccScore: number;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  reservationsRecommended: boolean;
  tip: string;
}

interface ShowItem {
  id: string;
  name: string;
  ccScore: number;
  duration: string;
  showtimes: string[];
  tip: string;
}

/* ── MK Mock Data ── */
const mkRides: RideItem[] = [
  { id: "space-mountain", name: "Space Mountain", ccScore: 4, typeBadge: "Thrill", heightRequirement: "44\"", avgWait: 40, lightningLane: true, llType: "multi-pass", tip: "Ride at night for the full effect — much rougher than the Disneyland version." },
  { id: "seven-dwarfs", name: "Seven Dwarfs Mine Train", ccScore: 5, typeBadge: "Family", heightRequirement: "38\"", avgWait: 60, lightningLane: true, llType: "individual", tip: "Second best rope drop choice after TRON. Ride at night for stunning mine lighting." },
  { id: "tron", name: "TRON Lightcycle / Run", ccScore: 5, typeBadge: "Thrill", heightRequirement: "48\"", avgWait: 75, lightningLane: true, llType: "individual", tip: "Rope drop this first at Early Entry or buy Individual LL. The nighttime canopy is spectacular." },
  { id: "haunted-mansion", name: "Haunted Mansion", ccScore: 5, typeBadge: "Dark Ride", avgWait: 30, lightningLane: true, llType: "multi-pass", tip: "Never skip this — the stretching room is a WDW original. Look for the raven throughout." },
  { id: "pirates", name: "Pirates of the Caribbean", ccScore: 4, typeBadge: "Dark Ride", avgWait: 20, lightningLane: false, tip: "Save for afternoon when other lines are long — never a long wait, plus AC." },
  { id: "tiana", name: "Tiana's Bayou Adventure", ccScore: 4, typeBadge: "Family", heightRequirement: "40\"", avgWait: 45, lightningLane: true, llType: "multi-pass", tip: "Sit in front for best view, back for biggest splash on the 50-foot drop." },
  { id: "big-thunder", name: "Big Thunder Mountain Railroad", ccScore: 4, typeBadge: "Thrill", heightRequirement: "40\"", avgWait: 30, lightningLane: true, llType: "multi-pass", tip: "Ride at night — the lighting on the rockwork is gorgeous." },
  { id: "jungle-cruise", name: "Jungle Cruise", ccScore: 3, typeBadge: "Family", avgWait: 30, lightningLane: true, llType: "multi-pass", tip: "Night rides are magical — completely different lighting. Your Skipper makes it." },
  { id: "buzz-lightyear", name: "Buzz Lightyear's Space Ranger Spin", ccScore: 3, typeBadge: "Family", avgWait: 20, lightningLane: true, llType: "multi-pass", tip: "Aim at triangles and diamonds — Zurg's arm targets are worth 100K each." },
  { id: "small-world", name: "\"it's a small world\"", ccScore: 3, typeBadge: "Family", avgWait: 15, lightningLane: false, tip: "Great afternoon AC break. The classic Walt Disney original — 11 minutes of air conditioning." },
];

const mkDining: DiningItem[] = [
  { id: "be-our-guest", name: "Be Our Guest Restaurant", ccScore: 4, cuisine: "French-American", priceRange: "$$$", reservationsRecommended: true, tip: "The Beast's West Wing is the best room — moody and atmospheric. Book 60 days out." },
  { id: "liberty-tree", name: "Liberty Tree Tavern", ccScore: 4, cuisine: "American Comfort", priceRange: "$$", reservationsRecommended: true, tip: "All-you-care-to-enjoy Thanksgiving feast every day. Great for families." },
  { id: "columbia-harbour", name: "Columbia Harbour House", ccScore: 5, cuisine: "Seafood & American", priceRange: "$", reservationsRecommended: false, tip: "Best quick-service in MK. Head upstairs for a quiet dining room most guests miss." },
  { id: "pecos-bills", name: "Pecos Bill Tall Tale Inn & Cafe", ccScore: 3, cuisine: "Tex-Mex", priceRange: "$", reservationsRecommended: false, tip: "Huge portions, great toppings bar. Solid value for a quick lunch between rides." },
  { id: "caseys-corner", name: "Casey's Corner", ccScore: 4, cuisine: "Hot Dogs & Corn Dog Nuggets", priceRange: "$", reservationsRecommended: false, tip: "The corn dog nuggets are legendary. Grab a seat facing the Castle for fireworks views." },
];

const mkShows: ShowItem[] = [
  { id: "happily-ever-after", name: "Happily Ever After", ccScore: 5, duration: "18 min", showtimes: ["9:00 PM"], tip: "Stake out the hub grass 30-45 min early. Watch the castle projections, not just the fireworks." },
  { id: "festival-of-fantasy", name: "Festival of Fantasy Parade", ccScore: 4, duration: "12 min", showtimes: ["2:00 PM", "5:00 PM"], tip: "Best viewing near the entrance to Liberty Square — less crowded than Main Street." },
  { id: "country-bear", name: "Country Bear Jamboree", ccScore: 3, duration: "16 min", showtimes: ["Continuous"], tip: "Recently refreshed with pop-country arrangements. Great air-conditioned break." },
];

type CategoryId = "rides" | "dining" | "shows";

interface CategoryDef {
  id: CategoryId;
  label: string;
  emoji: string;
  count: number;
}

interface ParkCategoryBrowserProps {
  parkId: string;
  parkName: string;
}

const ParkCategoryBrowser = ({ parkId, parkName }: ParkCategoryBrowserProps) => {
  const [expandedCategory, setExpandedCategory] = useState<CategoryId | null>(null);
  const isMK = parkId === "mk";

  const categories: CategoryDef[] = isMK
    ? [
        { id: "rides", label: "Attractions", emoji: "🎢", count: mkRides.length },
        { id: "dining", label: "Dining", emoji: "🍽️", count: mkDining.length },
        { id: "shows", label: "Shows & Entertainment", emoji: "🎆", count: mkShows.length },
      ]
    : [
        { id: "rides", label: "Attractions", emoji: "🎢", count: 0 },
        { id: "dining", label: "Dining", emoji: "🍽️", count: 0 },
        { id: "shows", label: "Shows & Entertainment", emoji: "🎆", count: 0 },
      ];

  const toggle = (id: CategoryId) => setExpandedCategory((prev) => (prev === id ? null : id));

  const handleAddToItinerary = (name: string) => {
    toast.success(`✨ ${name} added to your itinerary`);
  };

  return (
    <section className="px-8 lg:px-16 py-12 lg:py-16 border-b border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.2, ease }}
      >
        <p className="label-text mb-2 tracking-[0.25em]">Browse by Category</p>
        <h2 className="font-display text-3xl text-foreground leading-[1.08] mb-8">
          What's at {parkName}
        </h2>
      </motion.div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id}>
            {/* Category row */}
            <button
              onClick={() => isMK ? toggle(cat.id) : undefined}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-lg border transition-all duration-300 text-left group",
                expandedCategory === cat.id
                  ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.04)] shadow-[var(--shadow-hover)]"
                  : "border-border bg-card shadow-[var(--shadow-soft)] hover:border-[hsl(var(--gold))]/50",
                !isMK && "opacity-60 cursor-default"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-display text-lg text-foreground">{cat.label}</span>
                {isMK && (
                  <span className="text-sm text-muted-foreground font-editorial">· {cat.count}</span>
                )}
              </div>
              {isMK ? (
                <motion.div
                  animate={{ rotate: expandedCategory === cat.id ? 180 : 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors" />
                </motion.div>
              ) : (
                <span
                  className="text-xs uppercase tracking-[0.12em] text-muted-foreground px-3 py-1 rounded-lg border border-border"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Coming soon
                </span>
              )}
            </button>

            {/* Expanded items */}
            <AnimatePresence>
              {expandedCategory === cat.id && isMK && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 space-y-2">
                    {cat.id === "rides" && mkRides.map((r) => (
                      <RideCard key={r.id} item={r} onAdd={handleAddToItinerary} />
                    ))}
                    {cat.id === "dining" && mkDining.map((d) => (
                      <DiningCardCC key={d.id} item={d} onAdd={handleAddToItinerary} />
                    ))}
                    {cat.id === "shows" && mkShows.map((s) => (
                      <ShowCard key={s.id} item={s} onAdd={handleAddToItinerary} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══ RIDE CARD ═══ */
const RideCard = ({ item, onAdd }: { item: RideItem; onAdd: (name: string) => void }) => (
  <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <h4 className="font-display text-base text-foreground">{item.name}</h4>
          <CCStars score={item.ccScore} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-[0.08em] px-2 py-0.5 rounded-lg bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)] font-medium">
            {item.typeBadge}
          </span>
          {item.heightRequirement && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border">
              ↕ {item.heightRequirement}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(item.name); }}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
        style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 36 }}
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
    <div className="flex items-center gap-4 flex-wrap mb-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Avg Wait:</span>
        <span className="text-xs font-medium text-foreground">{item.avgWait} min</span>
      </div>
      {item.lightningLane && (
        <span className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--gold)/0.1)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">
          ⚡ {item.llType === "individual" ? "Individual LL" : "Multi Pass"}
        </span>
      )}
      {!item.lightningLane && (
        <span className="text-xs text-muted-foreground/60">No LL</span>
      )}
    </div>
    <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
      <p className="font-editorial text-sm text-muted-foreground italic leading-relaxed">💡 {item.tip}</p>
    </div>
  </div>
);

/* ═══ DINING CARD ═══ */
const DiningCardCC = ({ item, onAdd }: { item: DiningItem; onAdd: (name: string) => void }) => (
  <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <h4 className="font-display text-base text-foreground">{item.name}</h4>
          <CCStars score={item.ccScore} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-editorial">{item.cuisine}</span>
          <span className="text-xs font-display text-[hsl(var(--gold-dark))]">{item.priceRange}</span>
          {item.reservationsRecommended && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold-dark))] border border-[hsl(var(--gold)/0.2)]">
              📋 Reservations recommended
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(item.name); }}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
        style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 36 }}
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
    <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
      <p className="font-editorial text-sm text-muted-foreground italic leading-relaxed">💡 {item.tip}</p>
    </div>
  </div>
);

/* ═══ SHOW CARD ═══ */
const ShowCard = ({ item, onAdd }: { item: ShowItem; onAdd: (name: string) => void }) => (
  <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
          <h4 className="font-display text-base text-foreground">{item.name}</h4>
          <CCStars score={item.ccScore} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-editorial">⏱ {item.duration}</span>
          <span className="text-xs text-muted-foreground font-editorial">
            🕐 {item.showtimes.join(", ")}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(item.name); }}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
        style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: 36 }}
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
    <div className="pl-3 border-l-2 border-[hsl(var(--gold)/0.3)]">
      <p className="font-editorial text-sm text-muted-foreground italic leading-relaxed">💡 {item.tip}</p>
    </div>
  </div>
);

export default ParkCategoryBrowser;
