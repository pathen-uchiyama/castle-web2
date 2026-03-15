import { motion } from "framer-motion";
import FloatingAnchor from "@/components/FloatingAnchor";
import castleHero from "@/assets/castle-hero.jpg";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-100px" as const },
  transition: { duration: 1.2, delay, ease },
});

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* ════════════════════════════════════════════ */}
      {/* HERO — Full-bleed cinematic, Edition style  */}
      {/* ════════════════════════════════════════════ */}
      <header className="relative h-screen flex items-end overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${castleHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="relative w-full max-w-6xl mx-auto px-8 pb-20 lg:pb-28">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="label-text !text-white/50 mb-8"
          >
            Castle Companion
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="font-display text-white text-5xl sm:text-7xl lg:text-[5.5rem] leading-[1.05] max-w-3xl"
          >
            Welcome, Patchen.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-editorial text-white/70 text-lg sm:text-xl mt-8 max-w-xl leading-relaxed"
          >
            The realm is at rest. Your next chapter awaits.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-px h-12 bg-white/20" />
          </motion.div>
        </div>
      </header>

      {/* ════════════════════════════════════════════ */}
      {/* THE ADVENTURE — Light section, single col   */}
      {/* ════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-8 py-32 lg:py-48">
        <motion.div {...fade()}>
          <p className="label-text mb-12">The Active Adventure</p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-10">
            Walt Disney World<br />
            <span className="text-muted-foreground">Spring Break 2026</span>
          </h2>
          <p className="font-editorial text-lg text-muted-foreground max-w-xl leading-relaxed">
            Four parks, six days, one family. Your strategists are at work — 
            the Lightning Lanes are yours.
          </p>
        </motion.div>

        <motion.div {...fade(0.2)} className="mt-20 flex gap-16 sm:gap-24 flex-wrap">
          {[
            { label: "Countdown", value: "6 days" },
            { label: "Party", value: "4" },
            { label: "Strategists", value: "3 active" },
          ].map((d) => (
            <div key={d.label}>
              <p className="label-text mb-3">{d.label}</p>
              <p className="font-display text-3xl sm:text-4xl text-foreground">{d.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div {...fade(0.3)} className="mt-16">
          <span className="link-editorial font-editorial text-sm text-foreground">
            View full itinerary
          </span>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* THE COMPASS — Dark cinematic section         */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-dark py-32 lg:py-48">
        <div className="max-w-3xl mx-auto px-8">
          <motion.div {...fade()}>
            <p className="label-text mb-12">Today</p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-16">
              Magic Kingdom
            </h2>
          </motion.div>

          <motion.div {...fade(0.15)} className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
            <div>
              <p className="label-text mb-4">Weather</p>
              <p className="font-editorial text-lg text-white/80">
                78°F, clear skies — a perfect park day.
              </p>
            </div>
            <div>
              <p className="label-text mb-4">Crowd Level</p>
              <p className="font-editorial text-lg text-white/80">
                Moderate
              </p>
              <p className="font-editorial text-sm text-white/40 mt-2 italic">
                Ride early, wander late.
              </p>
            </div>
            <div>
              <p className="label-text mb-4">Strategy</p>
              <p className="font-editorial text-lg text-white/80">
                Rope-drop Tron, evening at Tomorrowland.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* TIME RECOVERED — Dramatic stat               */}
      {/* ════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-8 py-32 lg:py-48">
        <motion.div {...fade()}>
          <p className="label-text mb-12">Time Recovered</p>
          <h2 className="font-display text-6xl sm:text-7xl lg:text-[6.5rem] text-foreground leading-[1]">
            4h 35m
          </h2>
          <p className="font-editorial text-lg text-muted-foreground mt-10 max-w-lg leading-relaxed">
            From automated Lightning Lane acquisitions while you slept.
          </p>
        </motion.div>

        <div className="divider my-20" />

        <motion.div {...fade(0.15)} className="space-y-10">
          {[
            { ride: "Tron Lightcycle / Run", saved: "95 minutes" },
            { ride: "Star Wars: Rise of the Resistance", saved: "82 minutes" },
            { ride: "Avatar Flight of Passage", saved: "70 minutes" },
          ].map((s) => (
            <p key={s.ride} className="font-editorial text-base sm:text-lg text-foreground leading-relaxed">
              You've reclaimed <em>{s.saved}</em> at {s.ride}.
            </p>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* THE JOURNEY — Dark, travel legs               */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-dark py-32 lg:py-48">
        <div className="max-w-3xl mx-auto px-8">
          <motion.div {...fade()}>
            <p className="label-text mb-12">The Journey</p>
          </motion.div>

          <div className="space-y-16">
            {[
              { leg: "Home → MCO", date: "March 21", time: "8:45 AM", note: "Arrive early. The adventure begins at the gate." },
              { leg: "Resort Check-in", date: "March 21", time: "3:00 PM", note: "Contemporary Resort, Garden Wing." },
              { leg: "MCO → Home", date: "March 28", time: "6:30 PM", note: "One last churro at the airport." },
            ].map((trip, i) => (
              <motion.div key={trip.leg} {...fade(i * 0.1)}>
                <p className="label-text mb-4">{trip.date} · {trip.time}</p>
                <h3 className="font-display text-2xl sm:text-3xl text-white mb-3">{trip.leg}</h3>
                <p className="font-editorial text-base text-white/50 italic">{trip.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* PREPARATIONS — Light, flowing prose           */}
      {/* ════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-8 py-32 lg:py-48">
        <motion.div {...fade()}>
          <p className="label-text mb-12">Preparations</p>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.1] mb-16">
            Nearly there.
          </h2>
        </motion.div>

        <motion.div {...fade(0.1)} className="space-y-8">
          {[
            { text: "Park reservations booked — all four parks with extended evening hours.", done: true },
            { text: "Dining confirmed — Be Our Guest, Ohana, Space 220, Sci-Fi Dine-In, Topolino's.", done: true },
            { text: "Lightning Lane strategy optimized with backup selections and rope-drop plans.", done: true },
            { text: "Packing list under review.", done: false },
            { text: "PhotoPass and MagicBand+ configurations for the entire party.", done: false },
          ].map((t) => (
            <p
              key={t.text}
              className={`font-editorial text-base sm:text-lg leading-relaxed ${
                t.done ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {t.done && <span className="text-muted-foreground mr-2">—</span>}
              {t.text}
            </p>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* WHISPERS — Insider tips                      */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-dark py-32 lg:py-48">
        <div className="max-w-3xl mx-auto px-8">
          <motion.div {...fade()}>
            <p className="label-text mb-12">Whispers</p>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-[1.1] mb-6">
              Secrets the park keeps from those who don't listen.
            </h2>
          </motion.div>

          <div className="mt-20 space-y-16">
            {[
              { tip: "The hidden Mickey in the Haunted Mansion queue — look at the wallpaper pattern near the stretching room entrance.", date: "March 14" },
              { tip: "Best fireworks spot: the rose garden by Casey's Corner. Arrive thirty minutes early with a blanket.", date: "March 12" },
              { tip: "Ask the Dole Whip stand about the secret orange swirl float. It's not on the menu.", date: "March 10" },
            ].map((note, i) => (
              <motion.div key={i} {...fade(i * 0.1)}>
                <p className="font-editorial text-base sm:text-lg text-white/75 leading-relaxed">
                  {note.tip}
                </p>
                <p className="label-text mt-4">{note.date}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* THE PARTY — Clean, minimal                   */}
      {/* ════════════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-8 py-32 lg:py-48">
        <motion.div {...fade()}>
          <p className="label-text mb-12">The Inner Circle</p>
        </motion.div>

        <div className="space-y-12">
          {[
            { name: "Patchen", role: "Trip Captain" },
            { name: "Sarah", role: "Co-planner" },
            { name: "Emma", role: "Little Explorer" },
            { name: "Jack", role: "Snack Scout" },
          ].map((member, i) => (
            <motion.div key={member.name} {...fade(i * 0.08)} className="flex items-baseline gap-6">
              <h3 className="font-display text-2xl sm:text-3xl text-foreground">{member.name}</h3>
              <p className="label-text">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* GALLERY — Full-bleed image grid               */}
      {/* ════════════════════════════════════════════ */}
      <section className="section-dark py-32 lg:py-48">
        <div className="max-w-5xl mx-auto px-8">
          <motion.div {...fade()}>
            <p className="label-text mb-12">Keepsakes</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
            {[
              { title: "Castle at Golden Hour", label: "Magic Kingdom" },
              { title: "Family on Main Street", label: "Day One" },
              { title: "Fireworks Finale", label: "Happily Ever After" },
              { title: "First Ride Together", label: "Space Mountain" },
            ].map((img, i) => (
              <motion.div
                key={img.title}
                {...fade(i * 0.1)}
                className="group cursor-pointer relative aspect-[3/4] bg-white/5 overflow-hidden"
              >
                <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div>
                    <p className="label-text !text-white/60 mb-2">{img.label}</p>
                    <p className="font-display text-lg text-white">{img.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/* COLOPHON                                      */}
      {/* ════════════════════════════════════════════ */}
      <footer className="max-w-3xl mx-auto px-8 py-20">
        <div className="divider mb-12" />
        <div className="flex items-baseline justify-between">
          <p className="font-editorial text-sm text-muted-foreground">
            Castle Companion
          </p>
          <p className="label-text">MMXXVI</p>
        </div>
      </footer>

      <FloatingAnchor />
    </div>
  );
};

export default Index;
