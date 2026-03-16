import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { mockData } from "@/data/mockData";
import type { SurveyRanking, SurveyAttraction } from "@/data/types";
import Footer from "@/components/Footer";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease },
});

const categoryIcons: Record<string, string> = {
  ride: "🎢",
  show: "🎭",
  character: "✨",
  dining: "🍽️",
};

const rankingConfig: { value: SurveyRanking; label: string; color: string; activeColor: string }[] = [
  { value: "must-do", label: "Must-Do", color: "border-border text-muted-foreground", activeColor: "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.12)] text-foreground" },
  { value: "like-to-do", label: "Like to Do", color: "border-border text-muted-foreground", activeColor: "border-foreground/20 bg-secondary text-foreground" },
  { value: "will-avoid", label: "Will Avoid", color: "border-border text-muted-foreground", activeColor: "border-destructive/30 bg-destructive/5 text-foreground" },
];

const Survey = () => {
  const { memberId } = useParams();
  const { partySurvey } = mockData;
  const attractions = partySurvey.attractions;
  const member = mockData.partyMembers.find((m) => m.initial.toLowerCase() === memberId?.toLowerCase());

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rankings, setRankings] = useState<Record<string, SurveyRanking>>({});
  const [openToAnything, setOpenToAnything] = useState(false);
  const [topFive, setTopFive] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const mustDos = useMemo(
    () => attractions.filter((a) => rankings[a.attractionId] === "must-do"),
    [rankings, attractions]
  );

  const rankedCount = Object.keys(rankings).length;
  const progress = step === 1 ? (rankedCount / attractions.length) * 100 : step === 2 ? 100 : 100;

  const parkGroups = useMemo(() => {
    const groups: Record<string, SurveyAttraction[]> = {};
    for (const a of attractions) {
      const park = mockData.parkGuides.find((p) => p.parkId === a.parkId)?.parkName ?? a.parkId;
      if (!groups[park]) groups[park] = [];
      groups[park].push(a);
    }
    return groups;
  }, [attractions]);

  const handleRank = (attractionId: string, ranking: SurveyRanking) => {
    setRankings((prev) => {
      if (prev[attractionId] === ranking) {
        const next = { ...prev };
        delete next[attractionId];
        return next;
      }
      return { ...prev, [attractionId]: ranking };
    });
  };

  const toggleTopFive = (attractionId: string) => {
    setTopFive((prev) => {
      if (prev.includes(attractionId)) return prev.filter((id) => id !== attractionId);
      if (prev.length >= 5) return prev;
      return [...prev, attractionId];
    });
  };

  const moveTopFive = (index: number, direction: -1 | 1) => {
    setTopFive((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <motion.div {...fade()} className="text-center max-w-md px-8">
          <span className="text-4xl mb-6 block">✨</span>
          <h1 className="font-display text-4xl text-foreground mb-4">Survey Complete</h1>
          <p className="font-editorial text-muted-foreground">
            Thank you, {member?.name ?? "traveler"}. Your preferences have been recorded.
            The Trip Captain will see your choices in the Consensus summary.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="px-8 lg:px-16 pt-16 pb-8">
        <motion.div {...fade()}>
          <p className="label-text mb-4">The Consensus</p>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-3">
            {member?.name ?? "Guest"}'s Preferences
          </h1>
          <p className="font-editorial text-muted-foreground text-lg max-w-xl">
            Rank the experiences below so your party's plan reflects everyone's wishes.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div {...fade(0.1)} className="mt-8 flex items-center gap-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
               <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-500 ${
                 step === s ? "bg-foreground text-background" : step > s ? "bg-[hsl(var(--gold))] text-background" : "bg-secondary text-muted-foreground"
               }`}>
                {step > s ? "✓" : s}
              </div>
              <span className="label-text hidden sm:inline">
                {s === 1 ? "Rank" : s === 2 ? "Flexibility" : "Top 5"}
              </span>
            </div>
          ))}
          <div className="flex-1 h-px bg-border ml-2" />
          <span className="label-text">{step === 1 ? `${rankedCount}/${attractions.length}` : step === 2 ? "Almost there" : `${topFive.length}/5`}</span>
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {/* ═══ Step 1: Rank Attractions ═══ */}
        {step === 1 && (
          <motion.section
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease }}
            className="px-8 lg:px-16 pb-16"
          >
            {Object.entries(parkGroups).map(([parkName, parkAttractions]) => (
              <div key={parkName} className="mb-16">
                <h2 className="font-display text-2xl text-foreground mb-8">{parkName}</h2>
                <div className="space-y-4">
                  {parkAttractions.map((attraction, i) => {
                    const currentRank = rankings[attraction.attractionId];
                    return (
                      <motion.div
                        key={attraction.attractionId}
                        {...fade(i * 0.03)}
                        className="border border-border rounded-lg p-6 bg-card hover:shadow-[var(--shadow-soft)] transition-shadow duration-500"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base">{categoryIcons[attraction.category]}</span>
                              <span className="label-text">{attraction.category}</span>
                              {attraction.heightRequirement && (
                                <span className="label-text !text-[hsl(var(--gold))]">↕ {attraction.heightRequirement}</span>
                              )}
                            </div>
                            <h3 className="font-display text-xl text-foreground mb-1">{attraction.name}</h3>
                            <p className="font-editorial text-sm text-muted-foreground">{attraction.description}</p>
                            {attraction.sensoryTags && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {attraction.sensoryTags.map((tag) => (
                                  <span key={tag} className="text-[0.625rem] uppercase tracking-[0.15em] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {rankingConfig.map((r) => (
                              <button
                                key={r.value}
                                onClick={() => handleRank(attraction.attractionId, r.value)}
                                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase font-medium border transition-all duration-300 ${
                                  currentRank === r.value ? r.activeColor : r.color
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-8">
              <button
                onClick={() => setStep(2)}
                className="px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-opacity duration-500 hover:opacity-90"
              >
                Continue
              </button>
            </div>
          </motion.section>
        )}

        {/* ═══ Step 2: Flexibility ═══ */}
        {step === 2 && (
          <motion.section
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease }}
            className="px-8 lg:px-16 pb-16"
          >
            <div className="max-w-lg mx-auto py-12">
              <motion.div {...fade()} className="border border-border p-10 bg-card text-center">
                <span className="text-5xl mb-6 block">🌊</span>
                <h2 className="font-display text-3xl text-foreground mb-4">Go With the Flow?</h2>
                <p className="font-editorial text-muted-foreground mb-8 leading-relaxed">
                  "I'm open to whatever everyone else wants." Your rankings still matter — but when
                  conflicts arise, we'll know you're flexible.
                </p>
                <button
                  onClick={() => setOpenToAnything(!openToAnything)}
                  className={`px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium border transition-all duration-500 ${
                    openToAnything
                      ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.12)] text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {openToAnything ? "✓ I'm Flexible" : "I'm Open to Anything"}
                </button>
              </motion.div>

              <div className="flex justify-between pt-10">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border transition-opacity duration-500 hover:opacity-70"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-opacity duration-500 hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ Step 3: Top 5 Must-Dos ═══ */}
        {step === 3 && (
          <motion.section
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5, ease }}
            className="px-8 lg:px-16 pb-16"
          >
            <div className="max-w-2xl mx-auto py-8">
              <motion.div {...fade()}>
                <h2 className="font-display text-3xl text-foreground mb-3">Your Top 5 Priorities</h2>
                <p className="font-editorial text-muted-foreground mb-10">
                  {mustDos.length === 0
                    ? "You haven't ranked any Must-Dos yet. Go back and rank some attractions."
                    : mustDos.length <= 5
                    ? `You have ${mustDos.length} Must-Do${mustDos.length === 1 ? "" : "s"}. Select and order them below.`
                    : `Pick your top 5 from your ${mustDos.length} Must-Dos and order them by priority.`}
                </p>
              </motion.div>

              {/* Selected Top 5 */}
              {topFive.length > 0 && (
                <div className="mb-10">
                  <p className="label-text mb-4">Your Priority Order</p>
                  <div className="space-y-3">
                    {topFive.map((id, idx) => {
                      const a = attractions.find((at) => at.attractionId === id)!;
                      return (
                        <motion.div
                          key={id}
                          layout
                          className="flex items-center gap-4 border border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.06)] p-4"
                        >
                          <span className="font-display text-2xl text-[hsl(var(--gold-dark))] w-8 text-center">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-display text-lg text-foreground">{a.name}</span>
                            <span className="label-text ml-3">{categoryIcons[a.category]}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveTopFive(idx, -1)}
                              disabled={idx === 0}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveTopFive(idx, 1)}
                              disabled={idx === topFive.length - 1}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => toggleTopFive(id)}
                              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Must-Dos */}
              <div className="space-y-3">
                <p className="label-text mb-4">{topFive.length > 0 ? "Add More" : "Select Your Priorities"}</p>
                {mustDos
                  .filter((a) => !topFive.includes(a.attractionId))
                  .map((a, i) => (
                    <motion.button
                      key={a.attractionId}
                      {...fade(i * 0.03)}
                      onClick={() => toggleTopFive(a.attractionId)}
                      disabled={topFive.length >= 5}
                      className="w-full text-left flex items-center gap-4 border border-border p-4 hover:border-[hsl(var(--gold)/0.5)] disabled:opacity-40 transition-all duration-300"
                    >
                      <span className="text-base">{categoryIcons[a.category]}</span>
                      <span className="font-display text-lg text-foreground">{a.name}</span>
                      <span className="ml-auto label-text">+ Add</span>
                    </motion.button>
                  ))}
              </div>

              <div className="flex justify-between pt-12">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border transition-opacity duration-500 hover:opacity-70"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium bg-foreground text-background border border-[hsl(var(--gold-dark))] transition-opacity duration-500 hover:opacity-90"
                >
                  Submit Preferences
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Survey;
