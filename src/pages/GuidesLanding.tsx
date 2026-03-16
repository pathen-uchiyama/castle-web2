import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, TreePine, Utensils, BedDouble } from "lucide-react";
import Footer from "@/components/Footer";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

const resorts = [
  {
    id: "wdw",
    name: "Walt Disney World",
    location: "Orlando, Florida",
    tagline: "Where Dreams Come True",
    icon: "🏰",
    stats: ["4 Theme Parks", "2 Water Parks", "25+ Hotels", "100+ Restaurants"],
    description: "The most magical place on Earth — 25,000 acres of theme parks, resorts, and world-class dining in Central Florida.",
  },
  {
    id: "dlr",
    name: "Disneyland Resort",
    location: "Anaheim, California",
    tagline: "The Happiest Place on Earth",
    icon: "🏰",
    stats: ["2 Theme Parks", "3 Hotels", "Downtown Disney", "Walkable Resort"],
    description: "Walt's original park — intimate, charming, and completely walkable. Where the Disney story began in 1955.",
  },
];

const GuidesLanding = () => (
  <main className="min-h-screen bg-background">
    {/* Hero */}
    <section className="relative bg-foreground text-background px-8 lg:px-16 pt-32 pb-20">
      <motion.div {...fade()}>
        <p className="text-[0.625rem] uppercase tracking-[0.3em] text-background/50 mb-4">Resort Encyclopedia 🗺️</p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-4">Park Guides</h1>
        <p className="font-editorial text-lg text-background/60 max-w-2xl">
          Everything your family needs — parks, hotels, dining, and insider tips for the most magical vacation ever.
        </p>
      </motion.div>
    </section>

    {/* Resort Selection */}
    <section className="px-8 lg:px-16 py-16 lg:py-24">
      <motion.div {...fade()}>
        <p className="label-text mb-8">Choose Your Destination</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {resorts.map((resort, i) => (
          <motion.div key={resort.id} {...fade(0.05 + i * 0.08)}>
            <Link
              to={`/resort/${resort.id}`}
              className="block rounded-lg border border-border bg-card p-8 lg:p-10 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 group hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.span
                  className="text-4xl"
                  whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
                  transition={{ duration: 0.5 }}
                >
                  {resort.icon}
                </motion.span>
                <div>
                  <h2 className="font-display text-3xl text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">
                    {resort.name}
                  </h2>
                  <p className="font-editorial text-sm text-muted-foreground">{resort.tagline} · {resort.location}</p>
                </div>
              </div>

              <p className="font-editorial text-sm text-foreground/80 leading-relaxed mb-6">{resort.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {resort.stats.map((stat, si) => {
                  const colors = [
                    "bg-[hsl(var(--coral)/0.1)] text-[hsl(var(--coral))] border-[hsl(var(--coral)/0.25)]",
                    "bg-[hsl(var(--sky)/0.1)] text-[hsl(var(--sky))] border-[hsl(var(--sky)/0.25)]",
                    "bg-[hsl(var(--mint)/0.1)] text-[hsl(var(--mint))] border-[hsl(var(--mint)/0.25)]",
                    "bg-[hsl(var(--lavender)/0.1)] text-[hsl(var(--lavender))] border-[hsl(var(--lavender)/0.25)]",
                  ];
                  return (
                    <span key={stat} className={`px-3 py-1.5 rounded-md text-[0.5625rem] uppercase tracking-[0.1em] border ${colors[si % colors.length]}`}>
                      {stat}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-6 text-muted-foreground">
                <span className="flex items-center gap-1.5 text-[0.625rem]"><TreePine className="w-3 h-3" /> Parks</span>
                <span className="flex items-center gap-1.5 text-[0.625rem]"><BedDouble className="w-3 h-3" /> Hotels</span>
                <span className="flex items-center gap-1.5 text-[0.625rem]"><Utensils className="w-3 h-3" /> Dining</span>
                <span className="flex items-center gap-1.5 text-[0.625rem]"><MapPin className="w-3 h-3" /> Transport</span>
                <span className="ml-auto font-display text-xs text-[hsl(var(--gold-dark))] group-hover:translate-x-1 transition-transform duration-300">
                  Explore →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    <Footer />
  </main>
);

export default GuidesLanding;
