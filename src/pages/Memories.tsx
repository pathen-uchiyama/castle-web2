import { motion } from "framer-motion";
import castleHero from "@/assets/castle-hero.jpg";
import castleGolden from "@/assets/castle-golden.jpg";
import fireworksNight from "@/assets/fireworks-night.jpg";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import travelFlatlay from "@/assets/travel-flatlay.jpg";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 } as const,
  whileInView: { opacity: 1, scale: 1 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.6, delay, ease },
});

const Memories = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="max-w-6xl mx-auto px-8 py-24 lg:py-32">
        <motion.div {...fade()}>
          <p className="label-text mb-8 tracking-[0.3em]">Keepsakes</p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-6">
            Moments worth keeping.
          </h1>
          <p className="font-editorial text-lg text-muted-foreground max-w-lg">
            Every trip leaves behind a constellation of memories. Yours are here.
          </p>
        </motion.div>
      </section>

      {/* Gallery grid */}
      <section className="px-4 pb-24 lg:pb-32">
        <div className="grid grid-cols-6 gap-2 auto-rows-[200px] sm:auto-rows-[300px]">
          {[
            { title: "Castle at Golden Hour", label: "Magic Kingdom", src: castleGolden, span: "col-span-4 row-span-2" },
            { title: "Family on Main Street", label: "Day One", src: familyMainstreet, span: "col-span-2 row-span-1" },
            { title: "Fireworks Finale", label: "Happily Ever After", src: fireworksNight, span: "col-span-2 row-span-1" },
            { title: "Travel Essentials", label: "The Trunk", src: travelFlatlay, span: "col-span-3 row-span-1" },
            { title: "The Grand Entrance", label: "Day One", src: castleHero, span: "col-span-3 row-span-1" },
          ].map((img, i) => (
            <motion.div
              key={img.title}
              {...scaleIn(i * 0.08)}
              className={`${img.span} group cursor-pointer relative overflow-hidden`}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                <div>
                  <p className="label-text !text-white/50 mb-1">{img.label}</p>
                  <p className="font-display text-lg text-white">{img.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Whispers */}
      <section className="max-w-3xl mx-auto px-8 py-24 lg:py-32 border-t border-border">
        <motion.div {...fade()}>
          <p className="label-text mb-8 tracking-[0.25em]">Whispers</p>
          <h2 className="font-display text-3xl sm:text-4xl text-foreground leading-[1.15] mb-6">
            Secrets the park keeps.
          </h2>
        </motion.div>
        <div className="mt-14 space-y-12">
          {[
            { tip: "The hidden Mickey in the Haunted Mansion queue — look at the wallpaper near the stretching room.", date: "March 14" },
            { tip: "Best fireworks spot: the rose garden by Casey's Corner. Arrive early with a blanket.", date: "March 12" },
            { tip: "Ask for the secret orange swirl float at the Dole Whip stand. Not on the menu.", date: "March 10" },
          ].map((note, i) => (
            <motion.div key={i} {...fade(i * 0.1)} className="group cursor-pointer">
              <p className="font-editorial text-base text-foreground leading-relaxed group-hover:text-muted-foreground transition-colors duration-500">
                {note.tip}
              </p>
              <p className="label-text mt-3 opacity-50">{note.date}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-8 py-16">
        <div className="divider" />
      </footer>
    </div>
  );
};

export default Memories;
