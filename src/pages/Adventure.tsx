import { motion } from "framer-motion";
import fireworksNight from "@/assets/fireworks-night.jpg";
import SparkleField from "@/components/SparkleField";
import type { ActiveItinerary } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

interface AdventureProps {
  activeItinerary: ActiveItinerary;
}

const Adventure = ({ activeItinerary }: AdventureProps) => {
  const { destination, tripName, countdownDays, todaysPark, timeReclaimed, ridesSaved, travelLegs, preparations } = activeItinerary;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero banner */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={activeItinerary.heroImage} alt={destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={10} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-16">
          <motion.p {...fade()} className="label-text !text-white/40 mb-6 tracking-[0.3em]">
            The Active Adventure
          </motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-5xl sm:text-7xl leading-[1.02]">
            {destination}
          </motion.h1>
          <motion.p {...fade(0.4)} className="font-editorial text-white/60 text-lg mt-6">
            {tripName} · {countdownDays} days away
          </motion.p>
        </div>
      </section>

      {/* Daily schedule + stats */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="px-8 lg:px-16 py-20 lg:py-28">
          <motion.div {...fade()}>
            <p className="label-text mb-8">Today's Park</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-10">
              {todaysPark.parkName}
            </h2>
          </motion.div>
          <motion.div {...fade(0.15)} className="space-y-8">
            {[
              { label: "Weather", text: todaysPark.weather },
              { label: "Crowd Level", text: todaysPark.crowdLevel },
              { label: "Strategy", text: todaysPark.strategy },
            ].map((item) => (
              <div key={item.label}>
                <p className="label-text mb-2">{item.label}</p>
                <p className="font-editorial text-lg text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="px-8 lg:px-16 py-20 lg:py-28 bg-[hsl(var(--warm))]">
          <motion.div {...fade()}>
            <p className="label-text mb-8">Time Recovered</p>
            <h2 className="font-display text-6xl sm:text-7xl text-foreground leading-[0.9] mb-8">
              {timeReclaimed}
            </h2>
            <p className="font-editorial text-sm text-muted-foreground italic mb-12">
              From automated Lightning Lane acquisitions while you slept.
            </p>
          </motion.div>
          <motion.div {...fade(0.2)} className="space-y-8">
            {ridesSaved.map((s) => (
              <div key={s.rideName} className="flex items-start gap-4 group cursor-pointer">
                <span className="text-lg mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">{s.emoji}</span>
                <div>
                  <p className="font-display text-lg text-foreground group-hover:text-gold-dark transition-colors duration-500">{s.minutesSaved} saved</p>
                  <p className="font-editorial text-sm text-muted-foreground mt-1">{s.rideName}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Journey */}
      <section className="section-dark">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[70vh]">
          <div className="lg:col-span-3 relative min-h-[40vh] lg:min-h-0">
            <img src={fireworksNight} alt="Fireworks" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[hsl(var(--ink))]/40 hidden lg:block" />
          </div>
          <div className="lg:col-span-2 px-8 lg:px-14 py-20 lg:py-28 flex flex-col justify-center">
            <motion.div {...fade()}>
              <p className="label-text mb-8">The Journey</p>
            </motion.div>
            <div className="space-y-12">
              {travelLegs.map((trip, i) => (
                <motion.div key={trip.legName} {...fade(i * 0.1)}>
                  <p className="label-text mb-2">{trip.date} · {trip.time}</p>
                  <h3 className="font-display text-2xl text-white mb-1">{trip.legName}</h3>
                  <p className="font-editorial text-sm text-white/50 italic">{trip.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preparations */}
      <section className="max-w-3xl mx-auto px-8 py-24 lg:py-32">
        <motion.div {...fade()}>
          <p className="label-text mb-8">Preparations</p>
          <h2 className="font-display text-4xl text-foreground leading-[1.1] mb-12">Nearly there.</h2>
        </motion.div>
        <motion.div {...fade(0.15)} className="space-y-6">
          {preparations.map((t) => (
            <p key={t.description} className={`font-editorial text-base leading-relaxed ${t.isComplete ? "text-muted-foreground/40 line-through decoration-muted-foreground/20" : "text-foreground"}`}>
              {t.description}
            </p>
          ))}
        </motion.div>
      </section>

      <footer className="max-w-5xl mx-auto px-8 py-16">
        <div className="divider" />
      </footer>
    </div>
  );
};

export default Adventure;
