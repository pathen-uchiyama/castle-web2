import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
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

const tabs = [
  { id: "registry", label: "Master Registry" },
  { id: "surveys", label: "Survey Status" },
];

const Circle = ({ partyMembers }: CircleProps) => {
  const [activeTab, setActiveTab] = useState("registry");

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-28 flex flex-col justify-center">
          <motion.div {...fade()}>
            <p className="label-text mb-6 tracking-[0.3em]">The Inner Circle</p>
            <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.02] mb-6">
              Your party.
            </h1>
            <p className="font-editorial text-lg text-muted-foreground max-w-md leading-relaxed">
              The people who make the magic real. Manage your persistent traveler registry — profiles, preferences, and trip history in one place.
            </p>
          </motion.div>
        </div>
        <div className="relative min-h-[40vh] lg:min-h-0">
          <img src={familyMainstreet} alt="Family on Main Street" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-background px-4 sm:px-8 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto">
          <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ═══ MASTER REGISTRY TAB ═══ */}
      {activeTab === "registry" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          {/* Stats */}
          <motion.div {...fade()} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Party Members", value: String(partyMembers.length) },
              { label: "Total Adventures", value: String(partyMembers.reduce((s, m) => s + m.adventureCount, 0)) },
              { label: "Active Trips", value: "1" },
              { label: "Pending Surveys", value: "2" },
            ].map((stat) => (
              <div key={stat.label} className="border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">{stat.label}</p>
                <p className="font-display text-3xl text-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Member cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
            {partyMembers.map((member, i) => (
              <motion.div
                key={member.name}
                {...slideRight(i * 0.1)}
                className="group cursor-pointer border border-border bg-card p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500"
              >
                <div className="flex items-center gap-5 mb-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-14 h-14 bg-foreground flex items-center justify-center shrink-0"
                  >
                    <span className="font-display text-xl text-background">{member.initial}</span>
                  </motion.div>
                  <div>
                    <p className="font-display text-xl text-foreground group-hover:text-[hsl(var(--gold-dark))] transition-colors duration-500">{member.name}</p>
                    <p className="label-text mt-1">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-3 pl-[74px]">
                  <div className="flex justify-between items-baseline">
                    <p className="label-text">Adventures</p>
                    <p className="font-editorial text-sm text-foreground">{member.adventureCount}</p>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="label-text">Status</p>
                    <p className="font-editorial text-sm text-[hsl(var(--gold))]">Active</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border pl-[74px] flex gap-6">
                  <span className="link-editorial font-editorial text-xs text-foreground">Edit profile</span>
                  <span className="link-editorial font-editorial text-xs text-muted-foreground">View history</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add member CTA */}
          <motion.div {...fade(0.3)} className="mt-12">
            <button className="w-full py-5 border border-dashed border-border text-muted-foreground hover:border-[hsl(var(--gold))] hover:text-foreground transition-all duration-500 flex items-center justify-center gap-2">
              <span className="text-lg">+</span>
              <span className="label-text !text-current">Add a new member to the registry</span>
            </button>
          </motion.div>
        </section>
      )}

      {/* ═══ SURVEY STATUS TAB ═══ */}
      {activeTab === "surveys" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <motion.div {...fade()}>
            <p className="label-text mb-6">Survey Tracking</p>
            <h2 className="font-display text-3xl text-foreground leading-[1.1] mb-4">Preference Surveys</h2>
            <p className="font-editorial text-muted-foreground max-w-lg mb-12">
              Track which party members have completed their preference surveys for upcoming trips.
            </p>
          </motion.div>

          <motion.div {...fade(0.1)} className="space-y-4">
            {partyMembers.map((member, i) => {
              const isComplete = i < 2; // Mock: first 2 are completed
              return (
                <div key={member.name} className="flex items-center justify-between border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-foreground flex items-center justify-center shrink-0">
                      <span className="font-display text-sm text-background">{member.initial}</span>
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground">{member.name}</p>
                      <p className="label-text">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <span className="label-text !text-[hsl(var(--gold))]">✓ Complete</span>
                    ) : (
                      <>
                        <span className="label-text !text-muted-foreground">Pending</span>
                        <button className="px-4 py-2 text-xs tracking-[0.1em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-opacity hover:opacity-90">
                          Send Link
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Circle;
