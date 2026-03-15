import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface TripWizardProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Where shall we begin?",
    subtitle: "Choose a realm for your first adventure.",
    field: "destination",
  },
  {
    title: "When does the story unfold?",
    subtitle: "Select the dates that frame your journey.",
    field: "dates",
  },
  {
    title: "Who joins the expedition?",
    subtitle: "Tell us about your traveling party.",
    field: "party",
  },
  {
    title: "Any particular wishes?",
    subtitle: "Special occasions, pace preferences, or must-do experiences.",
    field: "preferences",
  },
];

const destinations = [
  { id: "wdw", label: "The Florida Realm", description: "Four parks, endless strategy." },
  { id: "dlr", label: "The California Realm", description: "Two parks, timeless charm." },
];

const TripWizard = ({ open, onClose }: TripWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("");
  const [partySize, setPartySize] = useState("");
  const [preferences, setPreferences] = useState("");

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const canProceed = () => {
    if (currentStep === 0) return !!selectedDestination;
    if (currentStep === 1) return dateRange.length > 0;
    if (currentStep === 2) return partySize.length > 0;
    return true;
  };

  const handleNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "hsl(35, 20%, 95%)" }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 hover:opacity-60 transition-opacity"
            aria-label="Close wizard"
          >
            <X size={20} className="text-foreground/50" />
          </button>

          {/* Progress indicator */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 w-8 transition-all duration-700"
                style={{
                  background: i <= currentStep
                    ? "hsl(42, 64%, 35%)"
                    : "hsl(0, 0%, 90%)",
                }}
              />
            ))}
          </div>

          <div className="w-full max-w-2xl mx-auto px-6 sm:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease }}
                className="text-center"
              >
                {/* Step label */}
                <p className="label-text mb-6 tracking-[0.3em]">
                  Step {currentStep + 1} of {steps.length}
                </p>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.08] mb-4">
                  {step.title}
                </h2>

                <div className="gold-rule mx-auto mb-4" />

                <p className="font-editorial text-sm text-muted-foreground mb-12 max-w-md mx-auto">
                  {step.subtitle}
                </p>

                {/* ─── Step Content ─── */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    {destinations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDestination(d.id)}
                        className="text-left p-6 border transition-all duration-500"
                        style={{
                          background: selectedDestination === d.id
                            ? "hsl(0, 0%, 100%)"
                            : "transparent",
                          borderColor: selectedDestination === d.id
                            ? "hsl(42, 64%, 35%)"
                            : "hsl(0, 0%, 90%)",
                          boxShadow: selectedDestination === d.id
                            ? "0 8px 32px -4px hsla(263, 24%, 40%, 0.07)"
                            : "none",
                        }}
                      >
                        <p className="font-display text-lg text-foreground mb-1">{d.label}</p>
                        <p className="font-editorial text-xs text-muted-foreground">{d.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="max-w-sm mx-auto">
                    <input
                      type="text"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      placeholder="e.g. March 20 – March 26, 2026"
                      className="w-full px-5 py-4 bg-card border border-border text-foreground font-editorial text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="max-w-sm mx-auto">
                    <input
                      type="text"
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      placeholder="e.g. 2 adults, 2 children (ages 5, 8)"
                      className="w-full px-5 py-4 bg-card border border-border text-foreground font-editorial text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="max-w-sm mx-auto">
                    <textarea
                      value={preferences}
                      onChange={(e) => setPreferences(e.target.value)}
                      placeholder="Tell us about your ideal day — pace, must-do experiences, special celebrations..."
                      rows={4}
                      className="w-full px-5 py-4 bg-card border border-border text-foreground font-editorial text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors resize-none"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between mt-14 max-w-sm mx-auto"
            >
              <button
                onClick={handleBack}
                disabled={isFirst}
                className="flex items-center gap-1.5 label-text transition-opacity duration-300 disabled:opacity-0"
              >
                <ChevronLeft size={14} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-500 disabled:opacity-30"
                style={{
                  background: canProceed() ? "hsl(263, 24%, 36%)" : "hsl(0, 0%, 90%)",
                  color: canProceed() ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 60%)",
                  boxShadow: canProceed() ? "0 4px 16px -4px hsla(263, 24%, 36%, 0.3)" : "none",
                }}
              >
                {isLast ? "Complete" : "Continue"}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TripWizard;
