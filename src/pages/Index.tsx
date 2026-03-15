import { motion } from "framer-motion";
import ExperienceCard from "@/components/ExperienceCard";
import CollectionHeader from "@/components/CollectionHeader";
import AnimatedCard from "@/components/AnimatedCard";
import SparkleField from "@/components/SparkleField";
import FloatingAnchor from "@/components/FloatingAnchor";
import {
  Compass, Book, Blueprint,
  Window, Carriage, Trunk, People, Gallery, Flame
} from "@/components/Icons";
import castleHero from "@/assets/castle-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════ */}
      {/* THE HEARTH — Editorial Masthead                */}
      {/* ═══════════════════════════════════════════════ */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url(${castleHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center 65%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
        <SparkleField count={10} />

        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-36">
          {/* Quiet mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex items-center gap-3 mb-24"
          >
            <span className="gold-leaf" />
            <div className="h-px w-6 bg-gold/25" />
            <span className="label-text tracking-[0.25em] text-gold">Castle Companion</span>
          </motion.div>

          {/* The editorial masthead */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            <h1 className="font-display text-6xl sm:text-7xl lg:text-[6.5rem] text-foreground leading-[0.95] mb-8">
              Welcome,<br />
              <em className="text-gold-dark" style={{ fontStyle: "italic" }}>Patchen</em>
            </h1>
            <p className="font-editorial text-xl sm:text-2xl text-muted-foreground max-w-lg leading-relaxed">
              The realm is at rest. Your next chapter awaits — let us handle the pages you'd rather not turn.
            </p>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-14 gold-rule w-12 origin-left"
          />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════ */}
      {/* EDITORIAL CONTENT                              */}
      {/* ═══════════════════════════════════════════════ */}
      <main className="max-w-4xl mx-auto px-6 pb-32">

        {/* ─── The Daily Pulse ─── */}
        <CollectionHeader
          title="The Daily Pulse"
          subtitle="Status, direction, and the day's horizon."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <AnimatedCard delay={0.1}>
            <ExperienceCard title="The Active Adventure" icon={<Flame />}>
              <div className="space-y-6">
                <p className="font-editorial text-foreground leading-relaxed">
                  Walt Disney World — Spring Break 2026. Four parks, six days, one family. Your strategists are at work; the Lightning Lanes are yours.
                </p>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="label-text mb-1">Countdown</p>
                    <p className="font-display text-2xl text-gold-dark">6 days</p>
                  </div>
                  <div>
                    <p className="label-text mb-1">Party size</p>
                    <p className="font-display text-2xl text-foreground">4</p>
                  </div>
                  <div>
                    <p className="label-text mb-1">Strategists</p>
                    <p className="font-display text-2xl text-thistle">3 active</p>
                  </div>
                </div>
                <p>
                  <span className="link-editorial text-sm">View full itinerary →</span>
                </p>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <ExperienceCard title="The Compass" icon={<Compass />}>
              <div className="space-y-6">
                <div>
                  <p className="label-text mb-1">Today's park</p>
                  <p className="font-editorial text-foreground">Magic Kingdom</p>
                </div>
                <div>
                  <p className="label-text mb-1">Weather</p>
                  <p className="font-editorial text-foreground">78°F, clear skies — a perfect park day.</p>
                </div>
                <div>
                  <p className="label-text mb-1">Crowd level</p>
                  <div className="flex gap-1.5 mt-2 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 w-6 ${i <= 3 ? "bg-gold/60" : "bg-muted/30"}`} />
                    ))}
                  </div>
                  <p className="font-editorial text-sm text-muted-foreground italic">
                    Moderate — ride early, wander late.
                  </p>
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>
        </div>

        {/* ─── The Grand Plan ─── */}
        <CollectionHeader
          title="The Grand Plan"
          subtitle="Architecture of ambition, projected and measured."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <AnimatedCard delay={0.1}>
            <ExperienceCard title="The Intelligent Blueprint" icon={<Blueprint />}>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="label-text">Trip planning</span>
                    <span className="font-display text-sm text-gold-dark">72%</span>
                  </div>
                  <div className="w-full h-1 bg-muted/20 overflow-hidden">
                    <div className="h-full progress-shimmer" style={{ width: "72%" }} />
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  {[
                    { task: "Park reservations booked for all four parks including Magic Kingdom, EPCOT, Hollywood Studios, and Animal Kingdom with extended evening hours", done: true },
                    { task: "Dining reservations confirmed — Be Our Guest, Ohana Breakfast, Space 220, Sci-Fi Dine-In Theater, and Topolino's Terrace", done: true },
                    { task: "Lightning Lane Multi Pass strategy optimized for every day of the trip with backup selections and rope-drop plans", done: true },
                    { task: "Packing list review", done: false },
                    { task: "PhotoPass and Memory Maker setup with MagicBand+ configurations for the entire party", done: false },
                  ].map((t) => (
                    <div key={t.task} className="flex items-start gap-3 overflow-hidden">
                      <span className={`mt-0.5 w-4 h-4 border flex items-center justify-center text-xs shrink-0 ${t.done ? "bg-gold/10 border-gold/40 text-gold-dark" : "border-muted/30"}`}>
                        {t.done && "✓"}
                      </span>
                      <span className={`text-sm leading-relaxed ${t.done ? "text-muted-foreground line-through" : "font-editorial text-foreground"}`}>
                        {t.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <ExperienceCard title="The Magic Window" icon={<Window />}>
              <div className="space-y-6">
                <div>
                  <p className="label-text mb-2">Time recovered</p>
                  <p className="font-display text-4xl text-gold-dark leading-none">4h 35m</p>
                  <p className="font-editorial text-sm text-muted-foreground mt-3 italic">
                    From automated Lightning Lane acquisitions while you slept.
                  </p>
                </div>

                <div className="border-t border-slate-plaid/10 pt-6">
                  <p className="label-text mb-5">Recent acquisitions</p>
                  <div className="space-y-5">
                    {[
                      { ride: "Tron Lightcycle / Run", saved: "95" },
                      { ride: "Star Wars: Rise of the Resistance", saved: "82" },
                      { ride: "Avatar Flight of Passage", saved: "70" },
                    ].map((s) => (
                      <p key={s.ride} className="font-editorial text-sm text-foreground leading-relaxed">
                        You've reclaimed <span className="font-display text-gold-dark">{s.saved} minutes</span> at{" "}
                        <em>{s.ride}</em>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>
        </div>

        {/* The Royal Carriage — full width */}
        <AnimatedCard delay={0.3} className="mt-20">
          <ExperienceCard title="The Royal Carriage" icon={<Carriage />}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { leg: "Home → MCO", date: "March 21", time: "8:45 AM", note: "Arrive early. The adventure begins at the gate." },
                { leg: "Resort Check-in", date: "March 21", time: "3:00 PM", note: "Contemporary Resort, Garden Wing." },
                { leg: "MCO → Home", date: "March 28", time: "6:30 PM", note: "One last churro at the airport." },
              ].map((trip) => (
                <div key={trip.leg} className="border-t border-slate-plaid/10 pt-5">
                  <p className="label-text mb-1">{trip.date} · {trip.time}</p>
                  <p className="font-display text-base text-foreground mb-2">{trip.leg}</p>
                  <p className="font-editorial text-sm text-muted-foreground italic">{trip.note}</p>
                </div>
              ))}
            </div>
          </ExperienceCard>
        </AnimatedCard>

        {/* ─── The Field Kit ─── */}
        <CollectionHeader
          title="The Field Kit"
          subtitle="Notes, provisions, and trusted allies."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <AnimatedCard delay={0.1}>
            <ExperienceCard title="The Library of Whispers" icon={<Book />}>
              <div className="space-y-5">
                <p className="font-editorial text-sm text-muted-foreground italic mb-3">
                  Secrets the park keeps from those who don't listen.
                </p>
                {[
                  { tip: "The hidden Mickey in the Haunted Mansion queue — look at the wallpaper pattern near the stretching room entrance.", date: "March 14" },
                  { tip: "Best fireworks spot: the rose garden by Casey's Corner. Arrive thirty minutes early with a blanket.", date: "March 12" },
                  { tip: "Ask the Dole Whip stand about the secret orange swirl float. It's not on the menu.", date: "March 10" },
                ].map((note, i) => (
                  <div
                    key={i}
                    className="border-t border-slate-plaid/10 pt-5 cursor-pointer group"
                  >
                    <p className="font-editorial text-sm text-foreground leading-relaxed group-hover:text-thistle transition-colors duration-300">
                      {note.tip}
                    </p>
                    <p className="label-text mt-2">{note.date}</p>
                  </div>
                ))}
                <p className="font-editorial text-xs text-muted-foreground italic mt-5">
                  Waiting for the ink to dry…
                </p>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <div className="space-y-20">
            <AnimatedCard delay={0.2}>
              <ExperienceCard title="The Traveler's Trunk" icon={<Trunk />}>
                <div className="space-y-4">
                  {[
                    { item: "Autograph books & pens", packed: true },
                    { item: "Matching family t-shirts", packed: true },
                    { item: "Portable charger & cables", packed: true },
                    { item: "Sunscreen & rain ponchos", packed: false },
                    { item: "Glow sticks for the parade", packed: false },
                  ].map((p) => (
                    <div key={p.item} className="flex items-center gap-3">
                      <span className={`w-4 h-4 border flex items-center justify-center text-xs shrink-0 ${p.packed ? "bg-gold/10 border-gold/40 text-gold-dark" : "border-muted/30"}`}>
                        {p.packed && "✓"}
                      </span>
                      <span className={`text-sm ${p.packed ? "text-muted-foreground" : "font-editorial text-foreground"}`}>
                        {p.item}
                      </span>
                    </div>
                  ))}
                  <p className="label-text mt-4">3 of 5 packed</p>
                </div>
              </ExperienceCard>
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <ExperienceCard title="The Inner Circle" icon={<People />}>
                <div className="space-y-5">
                  {[
                    { name: "Patchen", role: "Trip Captain", initial: "P" },
                    { name: "Sarah", role: "Co-planner", initial: "S" },
                    { name: "Emma", role: "Little Explorer", initial: "E" },
                    { name: "Jack", role: "Snack Scout", initial: "J" },
                  ].map((member) => (
                    <div key={member.name} className="flex items-center gap-4">
                      <div className="w-9 h-9 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="font-display text-sm text-gold-dark">{member.initial}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-sm text-foreground">{member.name}</p>
                        <p className="label-text">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ExperienceCard>
            </AnimatedCard>
          </div>
        </div>

        {/* ─── The Keepsake ─── */}
        <CollectionHeader
          title="The Keepsake"
          subtitle="Moments preserved in perpetuity."
        />

        <AnimatedCard delay={0.1}>
          <ExperienceCard title="The Digital Gallery" icon={<Gallery />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {[
                { title: "Castle at Golden Hour", label: "Magic Kingdom" },
                { title: "Family on Main Street", label: "Day One" },
                { title: "Fireworks Finale", label: "Happily Ever After" },
                { title: "First Ride Together", label: "Space Mountain" },
              ].map((img) => (
                <div key={img.title} className="group cursor-pointer">
                  <div className="w-full aspect-[3/4] border border-slate-plaid/10 bg-secondary/30 flex items-end p-4 transition-all duration-500 group-hover:border-gold/30">
                    <div>
                      <p className="label-text text-gold mb-1">{img.label}</p>
                      <p className="font-display text-sm text-foreground">{img.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ExperienceCard>
        </AnimatedCard>

        {/* ─── Colophon ─── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-40 pt-8 border-t border-slate-plaid/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="gold-leaf" />
            <div className="h-px w-8 bg-gold/20" />
          </div>
          <p className="font-editorial text-sm text-muted-foreground italic">
            Castle Companion — Be there for the magic.
          </p>
          <p className="label-text mt-3 text-muted/60">MMXXVI</p>
        </motion.footer>
      </main>

      <FloatingAnchor />
    </div>
  );
};

export default Index;
