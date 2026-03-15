import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import type { TripMemory } from "@/data/types";

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

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const Memories = ({ tripMemories }: MemoriesProps) => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="max-w-6xl mx-auto px-8 py-24 lg:py-32">
        <motion.div {...fade()}>
          <p className="label-text mb-8 tracking-[0.3em]">Memories</p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-6">
            Moments worth keeping.
          </h1>
          <p className="font-editorial text-lg text-muted-foreground max-w-lg">
            Every trip leaves behind a constellation of memories. Yours are here.
          </p>
        </motion.div>
      </section>

      <section className="px-4 pb-24 lg:pb-32">
        <div className="grid grid-cols-6 gap-2 auto-rows-[200px] sm:auto-rows-[300px]">
          {tripMemories.map((memory, i) => (
            <Link
              key={memory.tripId}
              to={`/memories/${memory.tripId}`}
              className={`${memory.gridSpan} group cursor-pointer relative overflow-hidden block`}
            >
              <motion.div {...scaleIn(i * 0.08)} className="w-full h-full">
                <img
                  src={memory.coverImage}
                  alt={memory.tripName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                  <div>
                    <p className="label-text !text-white/50 mb-1">{memory.date}</p>
                    <p className="font-display text-lg text-white">{memory.tripName}</p>
                    <p className="font-editorial text-xs text-white/40 mt-1">
                      {memory.photoCount} photos · {memory.destination}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Memories;
