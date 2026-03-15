import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ─── Brand Tokens ─── */
const brand = {
  lapis: "hsl(222, 47%, 21%)",
  gold: "hsl(43, 69%, 52%)",
  goldDark: "hsl(43, 65%, 42%)",
  cream: "hsl(30, 33%, 96%)",
  slate: "hsl(222, 20%, 45%)",
  thistle: "hsl(280, 30%, 55%)",
  border: "hsl(0, 0%, 90%)",
  white: "hsl(0, 0%, 100%)",
  shadow: "0 8px 32px -4px hsla(222, 47%, 21%, 0.07)",
  font: {
    display: "'Playfair Display', Georgia, serif",
    body: "Inter, system-ui, sans-serif",
  },
} as const;

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

/* ─── Types ─── */
interface PartyMember {
  id: string;
  name: string;
  age: string;
  heightInches: string;
  relationship: string;
  magicStatuses: string[];
  firstTimer: boolean;
}

interface WizardData {
  // Page 1 — Foundation
  adventureTitle: string;
  resort: string | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  leadAdventurer: string;
  nappingStrategy: string | null;
  familyStamina: number;
  dailyAmbition: string | null;
  // Page 2 — Troupe
  partyMembers: PartyMember[];
  // Page 3 — Strategic Intent
  adventurePersona: string | null;
  ridesPref: string;
  charactersPref: string;
  showsPref: string;
  paradesPref: string;
  // Page 3 — Park Services
  needsDAS: boolean;
  willUseSingleRider: boolean;
  willPurchaseLL: boolean;
  willPurchaseILL: boolean;
  willUseChildExchange: boolean;
  // Page 4 — Foodie
  allergies: string[];
  diningStyle: string | null;
  snackHabits: string | null;
}

interface TripWizardProps {
  open: boolean;
  onClose: () => void;
}

/* ─── Step Definitions ─── */
const steps = [
  { title: "The Foundation", subtitle: "Set the stage for your adventure — destination, dates, and pace." },
  { title: "The Traveling Troupe", subtitle: "Introduce every member of your expedition." },
  { title: "Strategic Intent", subtitle: "Personalize the experience for your party." },
  { title: "The Foodie Profile", subtitle: "Dining preferences and dietary needs." },
];

const nappingOptions = [
  { id: "power-through", label: "Power Through", desc: "Optimize for continuous presence." },
  { id: "hotel-nap", label: "Hotel Nap", desc: "Block ~2.5 hrs for travel and rest mid-day." },
  { id: "quiet-corner", label: "Quiet Corner", desc: "Locate in-park decompression zones." },
];

const ambitionOptions = [
  { id: "maximum-rides", label: "Maximum Rides", desc: "Efficiency-focused. Every minute counts." },
  { id: "relaxed-vibe", label: "Relaxed Vibe", desc: "Atmosphere-focused. Soak it all in." },
];

const personaOptions = [
  { id: "completionist", label: "The Completionist", desc: "Fast-paced, every ride and show." },
  { id: "romantic-wanderer", label: "The Romantic Wanderer", desc: "Casual pacing, atmosphere and dining." },
  { id: "refined-strategist", label: "The Refined Strategist", desc: "High-value Lightning Lanes and efficiency." },
];

const prefLevels = ["Must-Do", "Like-to-Do", "Will Avoid"];

const relationshipOptions = ["Self", "Spouse", "Child", "Parent", "Friend", "Relative"];
const magicStatusOptions = ["Regular", "AP (Annual Pass)", "DVC (Disney Vacation Club)"];
const allergyOptions = ["Gluten-Free", "Dairy-Free", "Nut Allergy", "Shellfish", "Vegan", "Vegetarian", "None"];

const destinations = [
  { id: "wdw", label: "Walt Disney World", desc: "Four parks, endless strategy." },
  { id: "dlr", label: "Disneyland Resort", desc: "Two parks, timeless charm." },
];

/* ─── Reusable UI pieces ─── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: brand.font.body, fontSize: "0.6875rem", fontWeight: 400, color: brand.slate, textTransform: "uppercase", letterSpacing: "0.2em" }} className="mb-2">
    {children}
  </p>
);

const GoldRule = () => <div className="w-12 h-px mx-auto mb-4" style={{ background: brand.gold }} />;

const inputStyle: React.CSSProperties = {
  fontFamily: brand.font.body,
  fontSize: "0.875rem",
  background: brand.white,
  border: `1px solid ${brand.border}`,
  color: brand.lapis,
  width: "100%",
  padding: "0.75rem 1.25rem",
  outline: "none",
  transition: "border-color 0.3s",
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = brand.gold;
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = brand.border;
  },
};

const SelectCard = ({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc: string }) => (
  <button
    onClick={onClick}
    className="text-left p-5 transition-all duration-500 focus:outline-none focus:ring-2 w-full"
    style={{
      background: selected ? brand.white : "transparent",
      border: `1px solid ${selected ? brand.gold : brand.border}`,
      boxShadow: selected ? brand.shadow : "none",
      "--tw-ring-color": brand.thistle,
    } as React.CSSProperties}
  >
    <p style={{ fontFamily: brand.font.display, fontWeight: 500, color: brand.lapis, fontSize: "1rem", marginBottom: "0.25rem" }}>{label}</p>
    <p style={{ fontFamily: brand.font.body, color: brand.slate, fontSize: "0.75rem" }}>{desc}</p>
  </button>
);

/* ─── Main Component ─── */
const TripWizard = ({ open, onClose }: TripWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    adventureTitle: "",
    resort: null,
    startDate: undefined,
    endDate: undefined,
    leadAdventurer: "",
    nappingStrategy: null,
    familyStamina: 5,
    dailyAmbition: null,
    partyMembers: [],
    adventurePersona: null,
    ridesPref: "Must-Do",
    charactersPref: "Like-to-Do",
    showsPref: "Like-to-Do",
    paradesPref: "Will Avoid",
    needsDAS: false,
    willUseSingleRider: false,
    willPurchaseLL: false,
    willPurchaseILL: false,
    willUseChildExchange: false,
    allergies: [],
    diningStyle: null,
    snackHabits: null,
  });

  const set = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!data.resort && !!data.adventureTitle.trim() && !!data.startDate && !!data.leadAdventurer.trim();
      case 1: return data.partyMembers.length > 0 && data.partyMembers.every((m) => m.name.trim());
      case 2: return !!data.adventurePersona;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (isLast) { onClose(); return; }
    setCurrentStep((s) => s + 1);
  };
  const handleBack = () => { if (!isFirst) setCurrentStep((s) => s - 1); };

  const addMember = () => {
    set("partyMembers", [...data.partyMembers, {
      id: crypto.randomUUID(),
      name: "",
      age: "",
      heightInches: "",
      relationship: "Self",
      magicStatuses: ["Regular"],
      firstTimer: false,
    }]);
  };

  const updateMember = (id: string, field: keyof PartyMember, value: string | boolean) => {
    set("partyMembers", data.partyMembers.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMember = (id: string) => {
    set("partyMembers", data.partyMembers.filter((m) => m.id !== id));
  };

  const toggleAllergy = (a: string) => {
    if (a === "None") {
      set("allergies", data.allergies.includes("None") ? [] : ["None"]);
    } else {
      const without = data.allergies.filter((x) => x !== "None");
      set("allergies", without.includes(a) ? without.filter((x) => x !== a) : [...without, a]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: brand.cream }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 shrink-0">
            <div className="flex gap-3">
              {steps.map((_, i) => (
                <div key={i} className="h-1 w-8 transition-all duration-700" style={{ background: i <= currentStep ? brand.gold : brand.border }} />
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:opacity-60 transition-opacity focus:outline-none focus:ring-2" aria-label="Close wizard" style={{ "--tw-ring-color": brand.thistle } as React.CSSProperties}>
              <X size={20} style={{ color: brand.slate }} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto px-6 sm:px-12 py-8 sm:py-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease }}
                >
                  {/* Step header */}
                  <div className="text-center mb-10 sm:mb-14">
                    <p className="mb-6 uppercase tracking-[0.3em]" style={{ fontFamily: brand.font.body, fontSize: "0.6875rem", fontWeight: 400, color: brand.slate }}>
                      Page {currentStep + 1} of {steps.length}
                    </p>
                    <h2 className="leading-[1.08] mb-4" style={{ fontFamily: brand.font.display, fontWeight: 400, letterSpacing: "-0.02em", color: brand.lapis, fontSize: "clamp(1.875rem, 5vw, 3rem)" }}>
                      {step.title}
                    </h2>
                    <GoldRule />
                    <p className="text-sm max-w-md mx-auto" style={{ fontFamily: brand.font.body, fontWeight: 400, color: brand.slate }}>
                      {step.subtitle}
                    </p>
                  </div>

                  {/* ═══ PAGE 1: THE FOUNDATION ═══ */}
                  {currentStep === 0 && (
                    <div className="space-y-8 max-w-lg mx-auto">
                      <div>
                        <Label>Adventure Title</Label>
                        <input type="text" value={data.adventureTitle} onChange={(e) => set("adventureTitle", e.target.value)} placeholder='e.g. "The Smith Enhancement"' style={inputStyle} {...focusHandlers} maxLength={100} />
                      </div>

                      <div>
                        <Label>Resort Destination</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {destinations.map((d) => (
                            <SelectCard key={d.id} selected={data.resort === d.id} onClick={() => set("resort", d.id)} label={d.label} desc={d.desc} />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-full flex items-center gap-2 px-5 py-3 text-sm text-left transition-colors" style={{ ...inputStyle, padding: "0.75rem 1.25rem", display: "flex", cursor: "pointer" }}>
                                <CalendarIcon size={14} style={{ color: brand.slate, opacity: 0.5 }} />
                                <span style={{ color: data.startDate ? brand.lapis : `${brand.slate}80` }}>
                                  {data.startDate ? format(data.startDate, "PPP") : "Pick a date"}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="z-[200] w-auto p-0" align="start">
                              <Calendar mode="single" selected={data.startDate} onSelect={(d) => set("startDate", d)} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-full flex items-center gap-2 px-5 py-3 text-sm text-left transition-colors" style={{ ...inputStyle, padding: "0.75rem 1.25rem", display: "flex", cursor: "pointer" }}>
                                <CalendarIcon size={14} style={{ color: brand.slate, opacity: 0.5 }} />
                                <span style={{ color: data.endDate ? brand.lapis : `${brand.slate}80` }}>
                                  {data.endDate ? format(data.endDate, "PPP") : "Pick a date"}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={data.endDate} onSelect={(d) => set("endDate", d)} disabled={(d) => d < (data.startDate || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div>
                        <Label>Lead Adventurer</Label>
                        <input type="text" value={data.leadAdventurer} onChange={(e) => set("leadAdventurer", e.target.value)} placeholder="Primary organizer's name" style={inputStyle} {...focusHandlers} maxLength={80} />
                      </div>

                      <div>
                        <Label>Napping Strategy</Label>
                        <div className="space-y-2">
                          {nappingOptions.map((opt) => (
                            <SelectCard key={opt.id} selected={data.nappingStrategy === opt.id} onClick={() => set("nappingStrategy", opt.id)} label={opt.label} desc={opt.desc} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Family Stamina ({data.familyStamina}/10)</Label>
                        <p className="text-xs mb-3" style={{ fontFamily: brand.font.body, color: brand.slate }}>
                          {data.familyStamina <= 3 ? "Prioritizes land-based clusters to minimize walking." : "Standard spatial optimization enabled."}
                        </p>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={data.familyStamina}
                          onChange={(e) => set("familyStamina", Number(e.target.value))}
                          className="w-full accent-[hsl(43,69%,52%)]"
                        />
                        <div className="flex justify-between mt-1">
                          <span style={{ fontFamily: brand.font.body, fontSize: "0.6rem", color: brand.slate }}>Gentle</span>
                          <span style={{ fontFamily: brand.font.body, fontSize: "0.6rem", color: brand.slate }}>Marathon</span>
                        </div>
                      </div>

                      <div>
                        <Label>Daily Ambition</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ambitionOptions.map((opt) => (
                            <SelectCard key={opt.id} selected={data.dailyAmbition === opt.id} onClick={() => set("dailyAmbition", opt.id)} label={opt.label} desc={opt.desc} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══ PAGE 2: THE TRAVELING TROUPE ═══ */}
                  {currentStep === 1 && (
                    <div className="max-w-lg mx-auto space-y-6">
                      {data.partyMembers.map((member, idx) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease }}
                          className="p-6 relative"
                          style={{ background: brand.white, border: `1px solid ${brand.border}`, boxShadow: brand.shadow }}
                        >
                          <button
                            onClick={() => removeMember(member.id)}
                            className="absolute top-4 right-4 p-1 hover:opacity-60 transition-opacity"
                            aria-label="Remove member"
                          >
                            <Trash2 size={14} style={{ color: brand.slate }} />
                          </button>

                          <p style={{ fontFamily: brand.font.display, fontWeight: 500, color: brand.lapis, fontSize: "1rem", marginBottom: "1rem" }}>
                            Traveler {idx + 1}
                          </p>

                          <div className="space-y-4">
                            <div>
                              <Label>Full Name</Label>
                              <input type="text" value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} placeholder="Name" style={inputStyle} {...focusHandlers} maxLength={80} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Age</Label>
                                <input type="number" value={member.age} onChange={(e) => updateMember(member.id, "age", e.target.value)} placeholder="Age" style={inputStyle} {...focusHandlers} min={0} max={120} />
                              </div>
                              <div>
                                <Label>Height (inches)</Label>
                                <input type="number" value={member.heightInches} onChange={(e) => updateMember(member.id, "heightInches", e.target.value)} placeholder='e.g. 48' style={inputStyle} {...focusHandlers} min={0} max={96} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Relationship to Lead</Label>
                                <select value={member.relationship} onChange={(e) => updateMember(member.id, "relationship", e.target.value)} style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer" }} {...focusHandlers}>
                                  {relationshipOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                              </div>
                              <div>
                                <Label>Magic Status (select all that apply)</Label>
                                <div className="flex flex-wrap gap-2">
                                  {magicStatusOptions.map((s) => {
                                    const active = member.magicStatuses.includes(s);
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => {
                                          const updated = active
                                            ? member.magicStatuses.filter((ms) => ms !== s)
                                            : [...member.magicStatuses, s];
                                          set("partyMembers", data.partyMembers.map((m) => m.id === member.id ? { ...m, magicStatuses: updated.length ? updated : ["Regular"] } : m));
                                        }}
                                        className="px-3 py-1.5 text-xs transition-all duration-300"
                                        style={{
                                          fontFamily: brand.font.body,
                                          background: active ? brand.lapis : "transparent",
                                          color: active ? brand.cream : brand.slate,
                                          border: `1px solid ${active ? brand.lapis : brand.border}`,
                                        }}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() => updateMember(member.id, "firstTimer", !member.firstTimer)}
                                className="w-5 h-5 flex items-center justify-center transition-all"
                                style={{
                                  border: `1px solid ${member.firstTimer ? brand.gold : brand.border}`,
                                  background: member.firstTimer ? brand.gold : "transparent",
                                }}
                              >
                                {member.firstTimer && <span style={{ color: brand.white, fontSize: "0.7rem", lineHeight: 1 }}>✓</span>}
                              </button>
                              <span style={{ fontFamily: brand.font.body, fontSize: "0.8125rem", color: brand.slate }}>
                                First-Timer — enables Discovery Mode (slower pacing, more tips)
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        onClick={addMember}
                        className="w-full py-4 flex items-center justify-center gap-2 transition-all duration-500 hover:opacity-80"
                        style={{ border: `1px dashed ${brand.border}`, background: "transparent", fontFamily: brand.font.body, fontSize: "0.8125rem", color: brand.slate }}
                      >
                        <Plus size={14} />
                        Add a Traveler
                      </button>
                    </div>
                  )}

                  {/* ═══ PAGE 3: STRATEGIC INTENT ═══ */}
                  {currentStep === 2 && (
                    <div className="max-w-lg mx-auto space-y-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Label>Adventure Persona</Label>
                          <span className="px-2 py-0.5 text-[0.6rem] uppercase tracking-widest" style={{ fontFamily: brand.font.body, color: brand.thistle, border: `1px solid ${brand.thistle}40`, background: `${brand.thistle}10` }}>
                            KEEP?
                          </span>
                        </div>
                        <p className="text-xs mb-3" style={{ fontFamily: brand.font.body, color: brand.slate, fontStyle: "italic" }}>
                          This may overlap with Daily Ambition from Page 1. Under review.
                        </p>
                        <div className="space-y-2">
                          {personaOptions.map((p) => (
                            <SelectCard key={p.id} selected={data.adventurePersona === p.id} onClick={() => set("adventurePersona", p.id)} label={p.label} desc={p.desc} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Preference Matrix</Label>
                        <p className="text-xs mb-4" style={{ fontFamily: brand.font.body, color: brand.slate }}>
                          Rank each category for your party.
                        </p>
                        <div className="space-y-4">
                          {([
                            { key: "ridesPref" as const, label: "Rides" },
                            { key: "charactersPref" as const, label: "Characters" },
                            { key: "showsPref" as const, label: "Shows" },
                            { key: "paradesPref" as const, label: "Parades" },
                          ]).map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-4 py-3 px-4" style={{ background: brand.white, border: `1px solid ${brand.border}` }}>
                              <span style={{ fontFamily: brand.font.body, fontSize: "0.875rem", color: brand.lapis, fontWeight: 500 }}>{item.label}</span>
                              <div className="flex gap-1.5">
                                {prefLevels.map((level) => (
                                  <button
                                    key={level}
                                    onClick={() => set(item.key, level)}
                                    className="px-3 py-1.5 text-xs transition-all duration-300"
                                    style={{
                                      fontFamily: brand.font.body,
                                      background: data[item.key] === level ? brand.lapis : "transparent",
                                      color: data[item.key] === level ? brand.cream : brand.slate,
                                      border: `1px solid ${data[item.key] === level ? brand.lapis : brand.border}`,
                                    }}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Boutique Intel — Sensory Awareness</Label>
                        <p className="text-xs mb-3" style={{ fontFamily: brand.font.body, color: brand.slate }}>
                          These tags will appear during ride selection to inform your choices.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Loud", "Dark", "Strobe", "Drops"].map((tag) => (
                            <span key={tag} className="px-3 py-1.5 text-xs" style={{ fontFamily: brand.font.body, border: `1px solid ${brand.border}`, color: brand.slate, background: brand.white }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Low Intensity", "Moderate", "High Intensity"].map((tag) => (
                            <span key={tag} className="px-3 py-1.5 text-xs" style={{ fontFamily: brand.font.body, border: `1px solid ${brand.border}`, color: brand.slate, background: brand.white }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ─── Park Services & Accommodations ─── */}
                      <div>
                        <Label>Park Services & Accommodations</Label>
                        <p className="text-xs mb-4" style={{ fontFamily: brand.font.body, color: brand.slate }}>
                          Select the services your party may use. Costs noted below are <strong>not included</strong> in Castle Companion.
                        </p>
                        <div className="space-y-3">
                          {([
                            {
                              key: "needsDAS" as const,
                              label: "Disability Access Service (DAS)",
                              desc: "For guests who cannot wait in a conventional queue due to a developmental disability. DAS lets you register for a return time so you can wait somewhere comfortable. Free of charge — requires registration through Disney.",
                              cost: null,
                            },
                            {
                              key: "willUseSingleRider" as const,
                              label: "Single Rider Lines",
                              desc: "Skip the standby queue by filling empty seats on select rides. You'll ride alone (not with your group). Great way to re-ride favorites. No extra cost.",
                              cost: null,
                            },
                            {
                              key: "willPurchaseLL" as const,
                              label: "Lightning Lane Multi Pass",
                              desc: "Purchase access to shorter lines across multiple attractions. You book return windows throughout the day. Available for most rides.",
                              cost: "~$15–$35/person/day depending on date and park",
                            },
                            {
                              key: "willPurchaseILL" as const,
                              label: "Individual Lightning Lane",
                              desc: "Pay per ride for the most popular attractions (e.g., Tron, Guardians). Each ride is purchased separately with a specific return time.",
                              cost: "~$10–$25/person/ride depending on demand",
                            },
                            {
                              key: "willUseChildExchange" as const,
                              label: "Rider Switch (Child Swap)",
                              desc: "When a child is too small or a guest can't ride, one adult waits with them while the other rides. Then they swap — the second adult gets to skip the line. Free of charge.",
                              cost: null,
                            },
                          ]).map((service) => {
                            const active = data[service.key];
                            return (
                              <button
                                key={service.key}
                                onClick={() => set(service.key, !active)}
                                className="w-full text-left p-5 transition-all duration-500"
                                style={{
                                  background: active ? brand.white : "transparent",
                                  border: `1px solid ${active ? brand.gold : brand.border}`,
                                  boxShadow: active ? brand.shadow : "none",
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center transition-all"
                                    style={{
                                      border: `1px solid ${active ? brand.gold : brand.border}`,
                                      background: active ? brand.gold : "transparent",
                                    }}
                                  >
                                    {active && <span style={{ color: brand.white, fontSize: "0.7rem", lineHeight: 1 }}>✓</span>}
                                  </div>
                                  <div>
                                    <p style={{ fontFamily: brand.font.display, fontWeight: 500, color: brand.lapis, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                                      {service.label}
                                    </p>
                                    <p style={{ fontFamily: brand.font.body, color: brand.slate, fontSize: "0.75rem", lineHeight: "1.5" }}>
                                      {service.desc}
                                    </p>
                                    {service.cost && (
                                      <p className="mt-1.5 flex items-center gap-1" style={{ fontFamily: brand.font.body, fontSize: "0.6875rem", color: brand.goldDark, fontWeight: 500 }}>
                                        💰 {service.cost}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ═══ PAGE 4: THE FOODIE PROFILE ═══ */}
                  {currentStep === 3 && (
                    <div className="max-w-lg mx-auto space-y-8">
                      <div>
                        <Label>Allergies & Dietary Needs</Label>
                        <div className="flex flex-wrap gap-2">
                          {allergyOptions.map((a) => {
                            const active = data.allergies.includes(a);
                            return (
                              <button
                                key={a}
                                onClick={() => toggleAllergy(a)}
                                className="px-4 py-2 text-sm transition-all duration-300"
                                style={{
                                  fontFamily: brand.font.body,
                                  background: active ? brand.lapis : "transparent",
                                  color: active ? brand.cream : brand.slate,
                                  border: `1px solid ${active ? brand.lapis : brand.border}`,
                                }}
                              >
                                {a}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label>Dining Style</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SelectCard selected={data.diningStyle === "quick-service"} onClick={() => set("diningStyle", "quick-service")} label="Quick Service" desc="Grab-and-go. Maximize park time." />
                          <SelectCard selected={data.diningStyle === "table-service"} onClick={() => set("diningStyle", "table-service")} label="Table Service" desc="Sit-down dining. Part of the experience." />
                        </div>
                      </div>

                      <div>
                        <Label>Snack Habits</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <SelectCard selected={data.snackHabits === "high-frequency"} onClick={() => set("snackHabits", "high-frequency")} label="High Frequency" desc="Graze throughout the day." />
                          <SelectCard selected={data.snackHabits === "scheduled"} onClick={() => set("snackHabits", "scheduled")} label="Scheduled Meals" desc="Stick to defined meal times." />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer nav — fixed at bottom */}
          <div className="shrink-0 border-t px-6 sm:px-10 py-4" style={{ borderColor: brand.border, background: brand.cream }}>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={handleBack}
                disabled={isFirst}
                className="flex items-center gap-1.5 uppercase tracking-[0.2em] transition-opacity duration-300 disabled:opacity-0"
                style={{ fontFamily: brand.font.body, fontSize: "0.6875rem", color: brand.slate }}
              >
                <ChevronLeft size={14} />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-500 disabled:opacity-30 focus:outline-none focus:ring-2"
                style={{
                  fontFamily: brand.font.body,
                  background: canProceed() ? brand.lapis : brand.border,
                  color: canProceed() ? brand.cream : "hsl(0, 0%, 60%)",
                  border: canProceed() ? `1px solid ${brand.goldDark}` : "1px solid transparent",
                  boxShadow: canProceed() ? "0 4px 16px -4px hsla(222, 47%, 21%, 0.25)" : "none",
                  "--tw-ring-color": brand.thistle,
                } as React.CSSProperties}
              >
                {isLast ? "Complete Your Canvas" : "Continue"}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TripWizard;
