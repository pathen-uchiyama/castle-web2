import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ParkGuide } from "@/data/types";

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

const ParkGuidePage = ({ parkGuides }: ParkGuidePageProps) => {
  // For now show first park or a placeholder — future: route param selects park
  const park = parkGuides[0];
  if (!park) return null;

  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="relative h-[50vh] overflow-hidden">
        <img src={park.heroImage} alt={park.parkName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-12">
          <motion.div {...fade()}>
            <p className="label-text !text-white/40 mb-4 tracking-[0.3em]">{park.resortName}</p>
            <h1 className="font-display text-white text-5xl sm:text-6xl leading-[1.02]">{park.parkName}</h1>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div {...fade()}>
            <p className="label-text mb-6">Typical Weather</p>
            <p className="font-editorial text-lg text-foreground mb-12">{park.typicalWeather}</p>
            <p className="label-text mb-6">Crowd Calendar</p>
            <p className="font-editorial text-base text-muted-foreground leading-relaxed">{park.crowdCalendarSummary}</p>
          </motion.div>

          <motion.div {...slideRight()} className="space-y-10">
            {park.categories.map((cat, i) => (
              <motion.div key={cat.label} {...slideRight(i * 0.1)} className="group cursor-pointer">
                <div className="flex justify-between items-baseline mb-2">
                  <p className="font-display text-xl text-foreground group-hover:text-gold-dark transition-colors duration-500">{cat.label}</p>
                  <span className="label-text">{cat.itemCount}</span>
                </div>
                <p className="font-editorial text-sm text-muted-foreground">{cat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Other parks in same resort */}
      <section className="border-t border-border py-16">
        <div className="max-w-4xl mx-auto px-8">
          <p className="label-text mb-10">Other Parks at {park.resortName}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {parkGuides.filter((p) => p.resort === park.resort && p.parkId !== park.parkId).map((other) => (
              <Link key={other.parkId} to={`/parks/${other.parkId}`} className="group flex items-center gap-5">
                <div className="w-16 h-16 shrink-0 overflow-hidden">
                  <img src={other.heroImage} alt={other.parkName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div>
                  <p className="font-display text-lg text-foreground group-hover:text-gold-dark transition-colors duration-500">{other.parkName}</p>
                  <p className="label-text mt-1">{other.categories.length} guides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-8 py-16"><div className="divider" /></footer>
    </div>
  );
};

export default ParkGuidePage;
