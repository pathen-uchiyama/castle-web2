import { motion } from "framer-motion";
import ExperienceCard from "@/components/ExperienceCard";
import CollectionHeader from "@/components/CollectionHeader";
import AnimatedCard from "@/components/AnimatedCard";
import SparkleField from "@/components/SparkleField";
import {
  GoldenAnchor, Compass, Book, Blueprint,
  Window, Carriage, Trunk, People, Gallery, Flame
} from "@/components/Icons";
import castleHero from "@/assets/castle-hero.jpg";
import FloatingAnchor from "@/components/FloatingAnchor";

const StatusDot = ({ active = false }: { active?: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${active ? "bg-gold sparkle" : "bg-border"}`} />
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero / The Hearth */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${castleHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center 70%",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <SparkleField count={30} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-16">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2.5">
              <div className="text-gold">
                <GoldenAnchor className="w-6 h-6" />
              </div>
              <span className="font-display text-lg text-foreground">
                Castle <span className="text-gold-dark">Companion</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="label-text hidden sm:inline">Dashboard</span>
              <span className="label-text hidden sm:inline text-muted">Trips</span>
              <span className="label-text hidden sm:inline text-muted">Settings</span>
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                <span className="text-xs font-semibold text-gold-dark">P</span>
              </div>
            </div>
          </motion.nav>

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
          >
            <p className="label-text text-gold-dark mb-3">✨ Be there for the magic</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-4">
              Welcome back, <span className="italic text-gold-dark">Patchen</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg">
              Your next adventure is taking shape. Let's handle the logistics so you can focus on making memories.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16 -mt-2">

        {/* Collection I: The Daily Pulse */}
        <CollectionHeader title="The Daily Pulse" subtitle="What's happening right now." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnimatedCard delay={0.1} className="md:col-span-2">
            <ExperienceCard title="The Active Adventure" icon={<Flame />}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <span className="text-xl">🏰</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Walt Disney World — Spring Break 2026</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">Magic Kingdom · EPCOT · Hollywood Studios · Animal Kingdom</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="label-text mb-0.5">Countdown</p>
                    <p className="text-lg font-display text-gold-dark">6 days</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="label-text mb-0.5">Party Size</p>
                    <p className="text-sm text-foreground">4 guests</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <p className="label-text mb-0.5">Snipers Active</p>
                    <div className="flex items-center gap-1.5">
                      <StatusDot active />
                      <p className="text-sm text-gold-dark font-medium">3 running</p>
                    </div>
                  </div>
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <ExperienceCard title="The Compass" icon={<Compass />}>
              <div className="space-y-3">
                <div>
                  <p className="label-text mb-0.5">Park Today</p>
                  <p className="text-sm text-foreground">Magic Kingdom</p>
                </div>
                <div>
                  <p className="label-text mb-0.5">Weather</p>
                  <p className="text-sm text-foreground">☀️ 78°F — Perfect park day</p>
                </div>
                <div>
                  <p className="label-text mb-0.5">Crowd Level</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-3 w-5 rounded-sm ${i <= 3 ? "bg-gold" : "bg-border"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Moderate — ride in the morning</p>
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>
        </div>

        {/* Collection II: The Grand Plan */}
        <CollectionHeader title="The Grand Plan" subtitle="Your trip, architected." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnimatedCard delay={0.1}>
            <ExperienceCard title="The Intelligent Blueprint" icon={<Blueprint />}>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="label-text">Trip Planning</span>
                    <span className="text-gold-dark font-semibold">72%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full progress-shimmer" style={{ width: "72%" }} />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {[
                    { task: "Park reservations booked for all four parks including Magic Kingdom, EPCOT, Hollywood Studios, and Animal Kingdom with extended evening hours", done: true },
                    { task: "Dining reservations confirmed — Be Our Guest, Ohana Breakfast, Space 220, Sci-Fi Dine-In Theater, Topolino's Terrace Character Breakfast with additional backup options", done: true },
                    { task: "Lightning Lane Multi Pass strategy optimized for every single day of the trip with backup ride selections and alternative rope-drop plans", done: true },
                    { task: "Packing list", done: false },
                    { task: "PhotoPass and Memory Maker setup with all MagicBand+ configurations and linked accounts for the entire party", done: false },
                  ].map((t) => (
                    <div key={t.task} className="flex items-center gap-2.5 text-sm overflow-hidden">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0 ${t.done ? "bg-gold/15 border-gold text-gold-dark" : "border-border"}`}>
                        {t.done && "✓"}
                      </span>
                      <span className={`truncate ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <ExperienceCard title="The Magic Window" icon={<Window />}>
              <div className="space-y-3">
                <p className="label-text">Time Saved So Far</p>
                <p className="text-3xl font-display text-gold-dark">4h 35m</p>
                <p className="text-xs text-muted-foreground">From automated Lightning Lane snipes</p>

                <div className="mt-3 p-3 bg-secondary/60 rounded-lg border border-border">
                  <p className="label-text mb-2">Recent Snipes</p>
                  <div className="space-y-2">
                    {[
                      { ride: "Tron Lightcycle", saved: "95 min" },
                      { ride: "Rise of the Resistance", saved: "82 min" },
                      { ride: "Flight of Passage", saved: "70 min" },
                    ].map((s) => (
                      <div key={s.ride} className="flex justify-between text-xs">
                        <span className="text-foreground truncate mr-2">{s.ride}</span>
                        <span className="text-gold-dark font-medium shrink-0">−{s.saved}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <ExperienceCard title="The Royal Carriage" icon={<Carriage />}>
              <div className="space-y-3">
                <p className="label-text">Travel Itinerary</p>
                {[
                  { leg: "Home → MCO", date: "Mar 21", time: "8:45 AM", status: "Confirmed" },
                  { leg: "Resort check-in", date: "Mar 21", time: "3:00 PM", status: "Confirmed" },
                  { leg: "MCO → Home", date: "Mar 28", time: "6:30 PM", status: "Confirmed" },
                ].map((trip) => (
                  <div key={trip.leg} className="p-3 bg-secondary/40 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-foreground truncate mr-2">{trip.leg}</p>
                      <span className="text-xs text-gold-dark font-medium shrink-0">{trip.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{trip.date} · {trip.time}</p>
                  </div>
                ))}
              </div>
            </ExperienceCard>
          </AnimatedCard>
        </div>

        {/* Collection III: The Field Kit */}
        <CollectionHeader title="The Field Kit" subtitle="Notes, packing, and your crew." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnimatedCard delay={0.1}>
            <ExperienceCard title="The Library of Whispers" icon={<Book />}>
              <div className="space-y-3">
                <p className="label-text">Park Secrets & Tips</p>
                {[
                  { tip: "The hidden Mickey in the Haunted Mansion queue — look at the wallpaper near the stretching room", date: "Added Mar 12" },
                  { tip: "Best spot for fireworks: the garden by Casey's Corner. Arrive 30 min early.", date: "Added Mar 10" },
                  { tip: "Ask the Dole Whip stand about the secret orange swirl float ✨", date: "Added Mar 8" },
                ].map((note, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-border cursor-pointer transition-all hover:border-gold/40 hover:bg-gold/5 group"
                  >
                    <p className="text-sm text-foreground line-clamp-2 group-hover:text-gold-dark transition-colors">{note.tip}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
                  </div>
                ))}
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <ExperienceCard title="The Traveler's Trunk" icon={<Trunk />}>
              <div className="space-y-3">
                <p className="label-text">Packing Progress</p>
                <div className="space-y-2">
                  {[
                    { item: "Autograph books & pens", packed: true },
                    { item: "Matching family t-shirts", packed: true },
                    { item: "Portable charger & cables", packed: true },
                    { item: "Sunscreen & ponchos", packed: false },
                    { item: "Glow sticks for parades", packed: false },
                    { item: "Comfortable walking shoes", packed: true },
                  ].map((p) => (
                    <div key={p.item} className="flex items-center gap-2.5 text-sm">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0 ${p.packed ? "bg-gold/15 border-gold text-gold-dark" : "border-border"}`}>
                        {p.packed && "✓"}
                      </span>
                      <span className={`truncate ${p.packed ? "text-muted-foreground" : "text-foreground"}`}>{p.item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">4 of 6 items packed</p>
              </div>
            </ExperienceCard>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <ExperienceCard title="The Inner Circle" icon={<People />}>
              <div className="space-y-3">
                <p className="label-text">Your Party</p>
                {[
                  { name: "Patchen", role: "Trip Captain", emoji: "👑" },
                  { name: "Sarah", role: "Co-planner", emoji: "🗺️" },
                  { name: "Emma", role: "Little Explorer", emoji: "🧚" },
                  { name: "Jack", role: "Snack Scout", emoji: "🍦" },
                ].map((member) => (
                  <div key={member.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <span className="text-sm">{member.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ExperienceCard>
          </AnimatedCard>
        </div>

        {/* Collection IV: The Keepsake */}
        <CollectionHeader title="The Keepsake" subtitle="Moments you'll never forget." />
        <AnimatedCard delay={0.1}>
          <ExperienceCard title="The Digital Gallery" icon={<Gallery />}>
            <div className="space-y-3">
              <p className="label-text">Memory Highlights</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Castle at Golden Hour", emoji: "🏰", color: "from-amber-100 to-orange-100" },
                  { title: "Family on Main Street", emoji: "👨‍👩‍👧‍👦", color: "from-rose-100 to-pink-100" },
                  { title: "Fireworks Finale", emoji: "🎆", color: "from-indigo-100 to-purple-100" },
                  { title: "First Ride Together", emoji: "🎢", color: "from-emerald-100 to-teal-100" },
                ].map((img) => (
                  <div key={img.title} className="group cursor-pointer">
                    <div className={`w-full aspect-square bg-gradient-to-br ${img.color} rounded-lg border border-border flex items-center justify-center transition-transform group-hover:scale-[1.03] group-hover:shadow-md`}>
                      <span className="text-4xl">{img.emoji}</span>
                    </div>
                    <p className="text-sm text-foreground mt-2 truncate">{img.title}</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>
          </ExperienceCard>
        </AnimatedCard>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <GoldenAnchor className="w-4 h-4 text-gold" />
              <span className="text-xs text-muted-foreground">Castle Companion — Be there for the magic</span>
            </div>
            <span className="text-xs text-muted-foreground">Made with ✨ for families who love adventure</span>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
