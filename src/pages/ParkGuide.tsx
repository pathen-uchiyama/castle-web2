import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import type { ParkGuide } from "@/data/types";
import { mockData } from "@/data/mockData";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});
const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 } as const,
  whileInView: { opacity: 1, x: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.4, delay, ease },
});

interface ParkGuidePageProps {
  parkGuides: ParkGuide[];
}

const tabs = [
  { id: "intel", label: "Park Intel" },
  { id: "pulse", label: "The Pulse" },
];

const ParkGuidePage = ({ parkGuides }: ParkGuidePageProps) => {
  const { parkId } = useParams();
  const [activeTab, setActiveTab] = useState("intel");
  const [searchQuery, setSearchQuery] = useState("");

  const park = parkGuides.find((p) => p.parkId === parkId) || parkGuides[0];

  const sameParkGuides = parkGuides.filter((p) => p?.resort === park?.resort);
  const attractions = mockData.partySurvey.attractions.filter((a) => a.parkId === park?.parkId);

  const filteredAttractions = useMemo(() => {
    if (!searchQuery.trim()) return attractions;
    const q = searchQuery.toLowerCase();
    return attractions.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }, [attractions, searchQuery]);

  const categoryIcons: Record<string, string> = { ride: "🎢", show: "🎭", character: "✨", dining: "🍽️" };

  if (!park) return null;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[45vh] overflow-hidden">
        <img src={park.heroImage} alt={park.parkName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-10">
          <motion.div {...fade()}>
            <p className="label-text !text-white/40 mb-3 tracking-[0.3em]">{park.resortName}</p>
            <h1 className="font-display text-white text-4xl sm:text-6xl leading-[1.02]">{park.parkName}</h1>
          </motion.div>
        </div>
      </section>

      {/* Park Selector pills */}
      <div className="bg-[hsl(var(--warm))] px-8 lg:px-16 py-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {sameParkGuides.map((p) => (
            <Link
              key={p.parkId}
              to={`/parks/${p.parkId}`}
              className="shrink-0 px-5 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
                background: p.parkId === park.parkId ? "hsl(var(--foreground))" : "transparent",
                color: p.parkId === park.parkId ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                border: `1px solid ${p.parkId === park.parkId ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
              }}
            >
              {p.parkName}
            </Link>
          ))}
          {/* Switch resort */}
          {parkGuides.filter((p) => p.resort !== park.resort).length > 0 && (
            <>
              <div className="w-px bg-border mx-2 shrink-0" />
              {parkGuides.filter((p) => p.resort !== park.resort).slice(0, 1).map((other) => (
                <Link
                  key={other.parkId}
                  to={`/parks/${other.parkId}`}
                  className="shrink-0 px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  → {other.resortName}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-background px-8 lg:px-16 sticky top-16 z-30">
        <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ═══ PARK INTEL TAB ═══ */}
      {activeTab === "intel" && (
        <>
          {/* Quick Stats */}
          <section className="px-8 lg:px-16 py-12 bg-[hsl(var(--warm))]">
            <motion.div {...fade()} className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "Today's Weather", value: park.todayWeather },
                { label: "Crowd Level", value: park.todayCrowdLevel },
                { label: "Operating Hours", value: park.operatingHours },
                { label: "Total Experiences", value: String(park.categories.reduce((sum, c) => sum + c.itemCount, 0)) },
              ].map((stat) => (
                <div key={stat.label} className="border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <p className="label-text mb-2">{stat.label}</p>
                  <p className="font-display text-lg text-foreground">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </section>

          {/* Categories + Weather/Crowd detail */}
          <section className="max-w-5xl mx-auto px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div {...fade()}>
                <p className="label-text mb-6">Typical Weather</p>
                <p className="font-editorial text-lg text-foreground mb-10">{park.typicalWeather}</p>
                <p className="label-text mb-6">Crowd Calendar</p>
                <p className="font-editorial text-base text-muted-foreground leading-relaxed">{park.crowdCalendarSummary}</p>
              </motion.div>
              <motion.div {...slideRight()} className="space-y-8">
                {park.categories.map((cat, i) => (
                  <motion.div key={cat.label} {...slideRight(i * 0.08)} className="group cursor-pointer">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="font-display text-xl text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{cat.label}</p>
                      <span className="label-text">{cat.itemCount}</span>
                    </div>
                    <p className="font-editorial text-sm text-muted-foreground">{cat.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Searchable Attractions (Park Wonders) */}
          <section className="px-8 lg:px-16 py-16 lg:py-24 bg-[hsl(var(--warm))]">
            <motion.div {...fade()}>
              <p className="label-text mb-6">Park Wonders</p>
              <h2 className="font-display text-3xl text-foreground leading-[1.1] mb-4">Boutique Intel</h2>
              <p className="font-editorial text-muted-foreground mb-8 max-w-lg">
                Searchable tips, secrets, and strategies for every experience at {park.parkName}.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div {...fade(0.1)} className="mb-8 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attractions, shows, dining..."
                className="w-full px-5 py-3 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              />
            </motion.div>

            {/* Results */}
            <div className="space-y-3">
              {filteredAttractions.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-editorial text-muted-foreground">No attractions found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredAttractions.map((a, i) => (
                  <motion.div
                    key={a.attractionId}
                    {...fade(i * 0.03)}
                    className="border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-lg mt-0.5">{categoryIcons[a.category]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{a.name}</h3>
                          {a.heightRequirement && (
                            <span className="label-text !text-[hsl(var(--gold))]">↕ {a.heightRequirement}</span>
                          )}
                        </div>
                        <p className="font-editorial text-sm text-muted-foreground">{a.description}</p>
                        {a.sensoryTags && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {a.sensoryTags.map((tag) => (
                              <span key={tag} className="text-[0.625rem] uppercase tracking-[0.15em] px-2 py-0.5 bg-secondary text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {attractions.length === 0 && (
              <div className="border border-dashed border-border py-16 text-center">
                <p className="font-display text-xl text-muted-foreground/40 mb-2">Attraction database expanding</p>
                <p className="font-editorial text-sm text-muted-foreground/30">
                  Full attraction details for {park.parkName} will be populated as the database grows.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* ═══ THE PULSE TAB ═══ */}
      {activeTab === "pulse" && (
        <section className="px-8 lg:px-16 py-16 lg:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">The Crowd Compass</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">The Pulse</h2>
            <p className="font-editorial text-muted-foreground text-lg max-w-2xl mb-16">
              Live wait times and crowd-flow tracking for {park.parkName}. Know where the crowds are — and where they aren't.
            </p>
          </motion.div>

          {/* Current conditions */}
          <motion.div {...fade(0.1)} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <p className="label-text mb-3">Current Crowd Level</p>
              <p className="font-display text-4xl text-foreground mb-2">{park.todayCrowdLevel}</p>
              <p className="font-editorial text-xs text-muted-foreground">Based on real-time wait data</p>
            </div>
            <div className="border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <p className="label-text mb-3">Weather Now</p>
              <p className="font-display text-2xl text-foreground mb-2">{park.todayWeather}</p>
              <p className="font-editorial text-xs text-muted-foreground">Updated every 30 minutes</p>
            </div>
            <div className="border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <p className="label-text mb-3">Park Hours</p>
              <p className="font-display text-2xl text-foreground mb-2">{park.operatingHours}</p>
              <p className="font-editorial text-xs text-muted-foreground">Including extended hours</p>
            </div>
          </motion.div>

          {/* Wait times placeholder */}
          <motion.div {...fade(0.2)} className="border border-dashed border-border py-20 text-center mb-16">
            <p className="font-display text-2xl text-muted-foreground/40 mb-3">Live Wait Times</p>
            <p className="font-editorial text-sm text-muted-foreground/30 max-w-md mx-auto">
              Real-time attraction wait times with historical trending, crowd predictions, and optimal ride sequencing will appear here.
            </p>
          </motion.div>

          {/* Crowd flow placeholder */}
          <motion.div {...fade(0.3)}>
            <p className="label-text mb-6">Crowd Flow Map</p>
            <div className="border border-dashed border-border py-16 text-center">
              <p className="font-display text-xl text-muted-foreground/40 mb-2">Heat Map Coming Soon</p>
              <p className="font-editorial text-sm text-muted-foreground/30">
                Visual crowd density by park area with movement predictions.
              </p>
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ParkGuidePage;
