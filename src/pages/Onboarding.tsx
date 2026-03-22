import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles, Crown, Star, Users, Baby, Plus, Minus,
  Calendar as CalendarIcon, Smartphone, ChevronRight,
  Check, ArrowLeft, PartyPopper, HelpCircle, Shield,
  UtensilsCrossed, Zap, MapPin, Eye, Heart, Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { format, eachDayOfInterval, addDays } from "date-fns";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
interface PartyData {
  adults: number;
  children: number;
  childAges: number[];
  stroller: boolean;
  ecv: boolean;
}

interface DiningPrefs {
  style: number; // 0 = Quick Service, 100 = Signature
  budget: number; // 15–75+
  allergies: string[];
}

interface TripDates {
  arrival: Date | undefined;
  departure: Date | undefined;
  parkAssignments: Record<string, string>;
}

const TOTAL_STEPS = 8;

const ALLERGY_FLAGS = ["Nuts", "Dairy", "Gluten", "Shellfish", "Vegan"];

const WDW_PARKS = [
  { id: "mk", name: "Magic Kingdom", icon: "🏰" },
  { id: "ep", name: "EPCOT", icon: "🌍" },
  { id: "hs", name: "Hollywood Studios", icon: "🎬" },
  { id: "ak", name: "Animal Kingdom", icon: "🌿" },
];
const DLR_PARKS = [
  { id: "dl", name: "Disneyland", icon: "🏰" },
  { id: "dca", name: "California Adventure", icon: "🎡" },
];
const ALL_PARKS = [...WDW_PARKS, ...DLR_PARKS];

const CROWD_LEVELS: Record<string, { level: string; color: string }> = {};
const getCrowdLevel = (date: Date) => {
  const day = date.getDay();
  if (day === 0 || day === 6) return { level: "High", color: "text-[hsl(var(--coral))]" };
  if (day === 1 || day === 4) return { level: "Low", color: "text-[hsl(var(--mint))]" };
  return { level: "Moderate", color: "text-[hsl(var(--sunshine))]" };
};

const TIERS = [
  {
    id: "explorer",
    name: "Explorer",
    price: "Free",
    icon: <MapPin className="w-6 h-6" />,
    tagline: "Get your feet wet",
    features: [
      "Park guides & tip sheets",
      "Basic crowd calendars",
      "Community access",
      "1 itinerary template",
    ],
  },
  {
    id: "pixie",
    name: "Pixie Dust",
    price: "$39",
    icon: <Sparkles className="w-6 h-6" />,
    tagline: "Most popular",
    popular: true,
    features: [
      "Everything in Explorer",
      "Full Dream Planner wizard",
      "Dining recommendations",
      "Lightning Lane strategy",
      "Real-time SMS alerts",
      "Party optimization",
    ],
  },
  {
    id: "glass",
    name: "Glass Slipper",
    price: "$149",
    icon: <Crown className="w-6 h-6" />,
    tagline: "The royal treatment",
    features: [
      "Everything in Pixie Dust",
      "Dedicated concierge line",
      "MDE friend connection",
      "Reservation monitoring",
      "Day-of park adjustments",
      "Priority support",
      "Keepsake trip journal",
    ],
  },
];

/* ─── Progress Bar ─── */
const ProgressBar = ({ step }: { step: number }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--warm))]/95 backdrop-blur-sm border-b border-[hsl(var(--gold)/.15)]">
    <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
      <span className="label-text text-[hsl(var(--gold-dark))] whitespace-nowrap">
        Step {step} of {TOTAL_STEPS}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--gold)/.12)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold-light)))" }}
          initial={{ width: 0 }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  </div>
);

/* ─── Step Wrapper ─── */
const StepShell = ({
  children,
  onBack,
  showBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
  showBack: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="min-h-screen bg-[hsl(var(--warm))] pt-16 pb-12 px-4 flex flex-col items-center"
  >
    <div className="w-full max-w-2xl">
      {showBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors mb-6 label-text"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}
      {children}
    </div>
  </motion.div>
);

/* ─── Counter Component ─── */
const Counter = ({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = 12,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gold)/.08)] flex items-center justify-center text-[hsl(var(--gold-dark))]">
        {icon}
      </div>
      <span className="font-display text-lg text-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-[hsl(var(--gold)/.08)] disabled:opacity-30 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-display-bold text-xl w-8 text-center text-foreground">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-[hsl(var(--gold)/.08)] disabled:opacity-30 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* ─── Main Onboarding Component ─── */
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [party, setParty] = useState<PartyData>({
    adults: 2,
    children: 0,
    childAges: [],
    stroller: false,
    ecv: false,
  });
  const [dining, setDining] = useState<DiningPrefs>({
    style: 50,
    budget: 35,
    allergies: [],
  });
  const [tripDates, setTripDates] = useState<TripDates>({
    arrival: undefined,
    departure: undefined,
    parkAssignments: {},
  });
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [smsConsent, setSmsConsent] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const tripDays =
    tripDates.arrival && tripDates.departure
      ? eachDayOfInterval({ start: tripDates.arrival, end: tripDates.departure })
      : [];

  const advance = useCallback(
    (rewardMsg?: string) => {
      if (rewardMsg) {
        toast.success(rewardMsg, {
          icon: <Check className="w-4 h-4 text-[hsl(var(--mint))]" />,
          className: "font-editorial",
        });
      }
      if (step < TOTAL_STEPS) {
        setStep((s) => s + 1);
      } else {
        setShowCelebration(true);
      }
    },
    [step],
  );

  const back = () => setStep((s) => Math.max(1, s - 1));

  const updateChildAges = (count: number) => {
    setParty((p) => ({
      ...p,
      children: count,
      childAges: count > p.childAges.length
        ? [...p.childAges, ...Array(count - p.childAges.length).fill(5)]
        : p.childAges.slice(0, count),
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setDining((d) => ({
      ...d,
      allergies: d.allergies.includes(allergy)
        ? d.allergies.filter((a) => a !== allergy)
        : [...d.allergies, allergy],
    }));
  };

  const partySize = party.adults + party.children;

  /* ─── Celebration Screen ─── */
  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[hsl(var(--ink))] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      >
        {/* Confetti particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: [
                "hsl(var(--gold))",
                "hsl(var(--coral))",
                "hsl(var(--sky))",
                "hsl(var(--mint))",
                "hsl(var(--lavender))",
                "hsl(var(--sunshine))",
              ][i % 6],
              left: `${Math.random() * 100}%`,
              top: `-5%`,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, Math.random() * 720],
              opacity: [1, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              delay: Math.random() * 1.5,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--gold-light))] flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display-bold text-3xl md:text-4xl text-white mb-3"
        >
          Welcome to Castle Companion
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="font-editorial text-white/60 text-lg mb-10 max-w-md"
        >
          Your first adventure awaits. We've tailored everything to your party — let the magic begin.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold))] text-white font-display px-8 py-6 text-base rounded-xl hover:opacity-90 transition-opacity"
          >
            Enter Your Dashboard <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  /* ─── Steps ─── */
  return (
    <>
      <ProgressBar step={step} />
      <AnimatePresence mode="wait">
        {/* ─── Step 1: Welcome ─── */}
        {step === 1 && (
          <StepShell key="s1" showBack={false}>
            <div className="text-center pt-16 md:pt-24">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold-light))] flex items-center justify-center mx-auto mb-8"
              >
                <Gem className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="font-display-bold text-3xl md:text-4xl text-foreground mb-3">
                Your concierge is ready.
              </h1>
              <p className="font-editorial text-muted-foreground text-lg mb-10 max-w-md mx-auto">
                In the next few minutes, we'll learn about your party, your style, and your dreams — so every recommendation feels made just for you.
              </p>
              <Button
                onClick={() => advance()}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl hover:bg-[hsl(var(--ink))]/90 transition-opacity"
              >
                Let's get started <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 2: Tier Selection ─── */}
        {step === 2 && (
          <StepShell key="s2" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Choose your experience
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              Every tier unlocks more of the magic.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-5 text-left transition-all duration-300 bg-card shadow-[var(--shadow-soft)]",
                    selectedTier === tier.id
                      ? "border-[hsl(var(--gold))] shadow-[0_0_0_1px_hsl(var(--gold)/.3)]"
                      : "border-border hover:border-[hsl(var(--gold)/.3)]",
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-[hsl(var(--gold-dark))] to-[hsl(var(--gold))] text-white border-0 text-[10px] uppercase tracking-widest px-3">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-[hsl(var(--gold-dark))]">{tier.icon}</div>
                    <span className="font-display-bold text-lg text-foreground">{tier.name}</span>
                  </div>
                  <p className="font-display-bold text-2xl text-foreground mb-1">{tier.price}</p>
                  <p className="font-editorial text-xs text-muted-foreground mb-4">{tier.tagline}</p>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-editorial text-foreground/80">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-[hsl(var(--mint))] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedTier === tier.id && (
                    <motion.div
                      layoutId="tier-check"
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <Collapsible open={showCompare} onOpenChange={setShowCompare} className="mt-6">
              <CollapsibleTrigger className="flex items-center gap-1.5 mx-auto label-text text-[hsl(var(--gold-dark))] hover:opacity-70 transition-opacity">
                <Eye className="w-3.5 h-3.5" />
                {showCompare ? "Hide" : "Compare all features"}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <p className="font-editorial text-sm text-muted-foreground text-center">
                    Full feature comparison table coming soon. Each tier builds on the last — Explorer gets you started, Pixie Dust unlocks the planner, and Glass Slipper adds dedicated concierge support.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => advance("Tier selected — great choice.")}
                disabled={!selectedTier}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 3: Payment ─── */}
        {step === 3 && (
          <StepShell key="s3" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Secure checkout
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              Your information is protected with bank-level encryption.
            </p>

            <div className="rounded-xl border-2 border-dashed border-[hsl(var(--gold)/.25)] bg-card p-10 text-center shadow-[var(--shadow-soft)]">
              <Shield className="w-12 h-12 text-[hsl(var(--gold))] mx-auto mb-4 opacity-40" />
              <p className="font-display text-lg text-foreground mb-2">Secure payment processing</p>
              <p className="font-editorial text-sm text-muted-foreground mb-6">
                Stripe Checkout will appear here
              </p>
              <Button disabled className="bg-[hsl(var(--ink))] text-white font-display px-8 py-5 rounded-xl opacity-40">
                Complete Payment
              </Button>
              <p className="mt-3 text-xs text-muted-foreground/50 text-center leading-relaxed">
                This is a license to access digital content, not a permanent purchase.{" "}
                <a href="/terms#section-5-3" className="underline hover:text-muted-foreground transition-colors">Terms §5.3</a>
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => advance("Your concierge is online.")}
                variant="ghost"
                className="font-editorial text-[hsl(var(--gold-dark))] hover:text-[hsl(var(--gold))]"
              >
                Skip for now (using Explorer tier) <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 4: Party Setup ─── */}
        {step === 4 && (
          <StepShell key="s4" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Who's coming along?
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              This helps us optimize walking routes, ride suggestions, and dining.
            </p>

            <div className="space-y-4">
              <Counter
                label="Adults"
                icon={<Users className="w-5 h-5" />}
                value={party.adults}
                onChange={(v) => setParty((p) => ({ ...p, adults: v }))}
                min={1}
                max={12}
              />
              <Counter
                label="Children"
                icon={<Baby className="w-5 h-5" />}
                value={party.children}
                onChange={updateChildAges}
                min={0}
                max={10}
              />

              {party.children > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <p className="label-text text-[hsl(var(--gold-dark))] mb-3">Child ages</p>
                  <div className="flex flex-wrap gap-2">
                    {party.childAges.map((age, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="font-editorial text-sm text-muted-foreground">Child {i + 1}:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((a) => (
                            <button
                              key={a}
                              onClick={() => {
                                const next = [...party.childAges];
                                next[i] = a;
                                setParty((p) => ({ ...p, childAges: next }));
                              }}
                              className={cn(
                                "w-7 h-7 rounded-md text-xs font-medium transition-colors",
                                age === a
                                  ? "bg-[hsl(var(--gold))] text-white"
                                  : "bg-secondary text-foreground hover:bg-[hsl(var(--gold)/.15)]",
                              )}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚼</span>
                    <span className="font-display text-base text-foreground">Stroller</span>
                  </div>
                  <Switch
                    checked={party.stroller}
                    onCheckedChange={(v) => setParty((p) => ({ ...p, stroller: v }))}
                  />
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">♿</span>
                    <span className="font-display text-base text-foreground">ECV</span>
                  </div>
                  <Switch
                    checked={party.ecv}
                    onCheckedChange={(v) => setParty((p) => ({ ...p, ecv: v }))}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => advance(`Party saved. Walking times adjusted for your party of ${partySize}.`)}
                disabled={party.adults < 1}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 5: MDE Handshake ─── */}
        {step === 5 && (
          <StepShell key="s5" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Connect My Disney Experience
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              This lets us see your reservations and help in real time.
            </p>

            <div className="space-y-4">
              {[
                { n: 1, title: "Open My Disney Experience", desc: "Launch the app or visit disneyworld.disney.go.com" },
                { n: 2, title: 'Search for "Castle Companion"', desc: "Go to Friends & Family → Add a Guest" },
                { n: 3, title: "Send Friend Request", desc: "Look for our verified concierge profile" },
                { n: 4, title: "We'll accept on our end", desc: "Usually within 15 minutes during business hours" },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] flex gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold-dark))] to-[hsl(var(--gold))] flex items-center justify-center shrink-0">
                    <span className="text-white font-display-bold text-sm">{s.n}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-base text-foreground mb-0.5">{s.title}</p>
                    <p className="font-editorial text-sm text-muted-foreground">{s.desc}</p>
                    <div className="mt-3 rounded-lg bg-secondary h-20 flex items-center justify-center">
                      <span className="label-text">Screenshot placeholder</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <a href="tel:+1-800-555-0199" className="font-editorial text-sm text-[hsl(var(--gold-dark))] hover:underline inline-flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Need help? Call us
              </a>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                onClick={() => advance("Connection established.")}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl"
              >
                I've sent the request <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <button
                onClick={() => advance()}
                className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 6: Dining Preferences ─── */}
        {step === 6 && (
          <StepShell key="s6" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Your dining style
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              From counter service to candlelit prix fixe — we'll match your palate.
            </p>

            <div className="space-y-6">
              {/* Dining style slider */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="flex justify-between mb-4">
                  <span className="label-text text-[hsl(var(--gold-dark))]">Dining style</span>
                </div>
                <Slider
                  value={[dining.style]}
                  onValueChange={([v]) => setDining((d) => ({ ...d, style: v }))}
                  min={0}
                  max={100}
                  step={1}
                  className="mb-3"
                />
                <div className="flex justify-between font-editorial text-xs text-muted-foreground">
                  <span>Quick Service</span>
                  <span>Table Service</span>
                  <span>Signature</span>
                </div>
              </div>

              {/* Budget slider */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="flex justify-between mb-4">
                  <span className="label-text text-[hsl(var(--gold-dark))]">Budget per person</span>
                  <span className="font-display-bold text-foreground">
                    ${dining.budget}{dining.budget >= 75 ? "+" : ""}
                  </span>
                </div>
                <Slider
                  value={[dining.budget]}
                  onValueChange={([v]) => setDining((d) => ({ ...d, budget: v }))}
                  min={15}
                  max={75}
                  step={5}
                />
                <div className="flex justify-between font-editorial text-xs text-muted-foreground mt-3">
                  <span>$15</span>
                  <span>$75+</span>
                </div>
              </div>

              {/* Allergy flags */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <span className="label-text text-[hsl(var(--gold-dark))] block mb-4">
                  Dietary needs
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_FLAGS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAllergy(a)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-editorial text-sm transition-colors border",
                        dining.allergies.includes(a)
                          ? "bg-[hsl(var(--gold))] text-white border-[hsl(var(--gold))]"
                          : "bg-card text-foreground border-border hover:border-[hsl(var(--gold)/.4)]",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                onClick={() => advance("3 restaurants flagged as perfect matches.")}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <button
                onClick={() => advance()}
                className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 7: Trip Dates ─── */}
        {step === 7 && (
          <StepShell key="s7" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              When are you going?
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              Pick your dates and assign parks to each day.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Arrival */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <span className="label-text text-[hsl(var(--gold-dark))] block mb-3">Arrival</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-editorial">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {tripDates.arrival ? format(tripDates.arrival, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tripDates.arrival}
                      onSelect={(d) => setTripDates((t) => ({ ...t, arrival: d }))}
                      disabled={(d) => d < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Departure */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <span className="label-text text-[hsl(var(--gold-dark))] block mb-3">Departure</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-editorial">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {tripDates.departure ? format(tripDates.departure, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tripDates.departure}
                      onSelect={(d) => setTripDates((t) => ({ ...t, departure: d }))}
                      disabled={(d) => d < (tripDates.arrival || new Date())}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Park assignment grid */}
            {tripDays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <span className="label-text text-[hsl(var(--gold-dark))] block mb-4">
                  Assign parks to days
                </span>
                <div className="space-y-3">
                  {tripDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const crowd = getCrowdLevel(day);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-20 shrink-0">
                          <p className="font-display text-sm text-foreground">{format(day, "EEE")}</p>
                          <p className="font-editorial text-xs text-muted-foreground">{format(day, "MMM d")}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", crowd.color)}>
                          {crowd.level}
                        </Badge>
                        <div className="flex-1 flex flex-wrap gap-1.5">
                          {ALL_PARKS.map((park) => (
                            <button
                              key={park.id}
                              onClick={() =>
                                setTripDates((t) => ({
                                  ...t,
                                  parkAssignments: { ...t.parkAssignments, [key]: park.id },
                                }))
                              }
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-editorial transition-colors border",
                                tripDates.parkAssignments[key] === park.id
                                  ? "bg-[hsl(var(--gold))] text-white border-[hsl(var(--gold))]"
                                  : "bg-secondary text-foreground border-transparent hover:border-[hsl(var(--gold)/.3)]",
                              )}
                            >
                              {park.icon} {park.name.split(" ")[0]}
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              setTripDates((t) => ({
                                ...t,
                                parkAssignments: { ...t.parkAssignments, [key]: "rest" },
                              }))
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-editorial transition-colors border",
                              tripDates.parkAssignments[key] === "rest"
                                ? "bg-[hsl(var(--lavender))] text-white border-[hsl(var(--lavender))]"
                                : "bg-secondary text-foreground border-transparent hover:border-[hsl(var(--lavender)/.3)]",
                            )}
                          >
                            😴 Rest
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => {
                  const assignedPark = Object.values(tripDates.parkAssignments).find(
                    (v) => v && v !== "rest",
                  );
                  const parkName =
                    ALL_PARKS.find((p) => p.id === assignedPark)?.name || "your park day";
                  advance(
                    tripDays.length > 0
                      ? `${parkName} locked in — crowd levels look great.`
                      : "Dates saved.",
                  );
                }}
                disabled={!tripDates.arrival || !tripDates.departure}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl disabled:opacity-40"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </StepShell>
        )}

        {/* ─── Step 8: SMS Opt-In ─── */}
        {step === 8 && (
          <StepShell key="s8" onBack={back} showBack>
            <h2 className="font-display-bold text-2xl text-foreground mb-2 text-center">
              Real-time park alerts
            </h2>
            <p className="font-editorial text-muted-foreground text-center mb-8">
              Get notified about wait times, reservation openings, and weather — right to your phone.
            </p>

            <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] space-y-5">
              <div>
                <span className="label-text text-[hsl(var(--gold-dark))] block mb-3">Phone number</span>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-20 rounded-lg border border-input bg-background px-2 py-2 font-editorial text-sm"
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                  </select>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 font-editorial"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Checkbox
                  id="sms-consent"
                  checked={smsConsent}
                  onCheckedChange={(v) => setSmsConsent(v === true)}
                  className="mt-0.5 h-5 w-5 rounded border-2 border-foreground/30 data-[state=checked]:bg-[hsl(var(--ink))] data-[state=checked]:text-background data-[state=checked]:border-[hsl(var(--ink))]"
                />
                <label htmlFor="sms-consent" className="cursor-pointer">
                  <p className="font-editorial text-sm text-foreground leading-relaxed">
                    I agree to receive real-time park alerts via SMS from Castle Companion, LLC at the number provided.{" "}
                    <Link to="/terms#sms" className="text-[hsl(var(--lavender))] hover:underline font-medium">
                      Terms &amp; SMS Policy
                    </Link>
                  </p>
                  <p className="font-editorial text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Msg &amp; data rates may apply. Reply STOP to unsubscribe. Consent is not a condition of purchase.
                  </p>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                onClick={() => advance("You'll receive real-time alerts during your trip.")}
                disabled={!phone || !smsConsent}
                className="bg-[hsl(var(--ink))] text-white font-display px-8 py-6 text-base rounded-xl disabled:opacity-40"
              >
                Finish setup <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <button
                onClick={() => advance()}
                className="font-editorial text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </>
  );
};

export default Onboarding;
