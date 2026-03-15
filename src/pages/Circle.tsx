import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import familyMainstreet from "@/assets/family-mainstreet.jpg";
import type { PartyMember } from "@/data/types";

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

interface CircleProps {
  partyMembers: PartyMember[];
}

const Circle = ({ partyMembers }: CircleProps) => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        <div className="px-8 lg:px-16 py-24 lg:py-32 flex flex-col justify-center">
          <motion.div {...fade()}>
            <p className="label-text mb-8 tracking-[0.3em]">The Inner Circle</p>
            <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.02] mb-8">
              Your party.
            </h1>
            <p className="font-editorial text-lg text-muted-foreground max-w-md leading-relaxed">
              The people who make the magic real. Manage your frequent travelers, assign roles, and keep everyone in sync.
            </p>
          </motion.div>
          <motion.div {...fade(0.2)} className="mt-12">
            <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
              Add a new member
            </span>
          </motion.div>
        </div>

        <div className="relative min-h-[50vh] lg:min-h-0">
          <img src={familyMainstreet} alt="Family on Main Street" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-16">
          {partyMembers.map((member, i) => (
            <motion.div
              key={member.name}
              {...slideRight(i * 0.1)}
              className="group cursor-pointer"
            >
              <div className="flex items-center gap-6 mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 bg-foreground flex items-center justify-center shrink-0"
                >
                  <span className="font-display text-2xl text-background">{member.initial}</span>
                </motion.div>
                <div>
                  <p className="font-display text-2xl text-foreground">{member.name}</p>
                  <p className="label-text mt-1">{member.role}</p>
                </div>
              </div>
              <div className="pl-[88px]">
                <p className="font-editorial text-sm text-muted-foreground">
                  {member.adventureCount} adventures together
                </p>
                <span className="link-editorial font-editorial text-xs text-foreground mt-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  View profile
                </span>
              </div>
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

export default Circle;
