import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import SparkleField from "@/components/SparkleField";
import headerAccount from "@/assets/header-account.jpg";
import type { AccountProfile, RideSensitivity, GuestHealthProfile, RidePreferences, PaymentMethod } from "@/data/types";
import { CreditCard, Plus, Trash2, Shield, AlertTriangle } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 1.2, delay, ease },
});

interface AccountProps {
  account: AccountProfile;
}

const tabs = [
  { id: "profile", label: "Guest Registry" },
  { id: "preferences", label: "Preference Matrix" },
  { id: "subscription", label: "Subscription" },
];

const plans = [
  { name: "Explorer", description: "Free tier — basic trip planning and party management.", price: "Free" },
  { name: "Adventurer", description: "Priority access to Lightning Lane insights, dining alerts, and crowd predictions.", price: "$9.99/mo" },
  { name: "Sovereign", description: "Full suite — AI itinerary engine, unlimited memories, concierge-level support.", price: "$19.99/mo" },
];

const mockBillingHistory = [
  { date: "Mar 1, 2026", description: "Adventurer Plan — Monthly", amount: "$9.99", status: "Paid" },
  { date: "Feb 1, 2026", description: "Adventurer Plan — Monthly", amount: "$9.99", status: "Paid" },
  { date: "Jan 1, 2026", description: "Adventurer Plan — Monthly", amount: "$9.99", status: "Paid" },
  { date: "Dec 1, 2025", description: "Adventurer Plan — Monthly", amount: "$9.99", status: "Paid" },
  { date: "Nov 15, 2025", description: "Upgrade to Adventurer Plan", amount: "$9.99", status: "Paid" },
  { date: "Aug 1, 2025", description: "Explorer Plan — Free", amount: "$0.00", status: "—" },
];

const ALL_SENSITIVITIES: { id: RideSensitivity; label: string; icon: string }[] = [
  { id: "thrill-rides", label: "Thrill Rides", icon: "🎢" },
  { id: "spinning", label: "Spinning", icon: "🌀" },
  { id: "dark-rides", label: "Dark Rides", icon: "🌑" },
  { id: "drops", label: "Drops", icon: "⬇️" },
  { id: "loud-noises", label: "Loud Noises", icon: "🔊" },
  { id: "quick-starts", label: "Quick Starts", icon: "⚡" },
  { id: "heights", label: "Heights", icon: "🏔️" },
  { id: "motion-simulation", label: "Motion Simulation", icon: "🎬" },
];

const DIETARY_OPTIONS = ["Gluten-free", "Dairy-free", "Vegan", "Vegetarian", "Halal", "Kosher", "Low-sodium", "Nut-free", "Shellfish-free", "Soy-free"];
const ALLERGY_OPTIONS = ["Tree nuts", "Peanuts", "Shellfish", "Dairy", "Eggs", "Wheat", "Soy", "Fish", "Sesame"];

const cardBrandIcon = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa": return "💳";
    case "amex": return "💠";
    case "mastercard": return "🔶";
    default: return "💳";
  }
};

const Account = ({ account }: AccountProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    guestName: account.guestName,
    email: account.email,
  });

  // Health profile
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthData, setHealthData] = useState<GuestHealthProfile>({ ...account.healthProfile });

  // Ride preferences
  const [editingRides, setEditingRides] = useState(false);
  const [rideData, setRideData] = useState<RidePreferences>({ ...account.ridePreferences });

  // General preferences
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefsData, setPrefsData] = useState([...account.preferences]);

  // Notification toggles
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "Lightning Lane Alerts": true,
    "Dining Reminders": true,
    "Weather Updates": true,
    "Crowd Alerts": true,
  });

  // Subscription
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(account.subscription.planName);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([...account.paymentMethods]);

  const { subscription } = account;

  const profileFields = [
    { label: "Name", key: "guestName" as const, value: profileData.guestName, editable: true },
    { label: "Email", key: "email" as const, value: profileData.email, editable: true },
    { label: "Member since", key: null, value: account.memberSince, editable: false },
    { label: "Adventures completed", key: null, value: String(account.adventuresCompleted), editable: false },
  ];

  const handleProfileSave = () => {
    setEditingProfile(false);
    toast.success("Profile updated successfully.");
  };

  const handleHealthSave = () => {
    setEditingHealth(false);
    toast.success("Health profile updated.");
  };

  const handleRidesSave = () => {
    setEditingRides(false);
    toast.success("Ride preferences saved.");
  };

  const handlePrefsSave = () => {
    setEditingPrefs(false);
    toast.success("Preferences updated successfully.");
  };

  const handlePlanSelect = (planName: string) => {
    setCurrentPlan(planName);
    setShowPlanManager(false);
    toast.success(`Switched to ${planName} plan.`);
  };

  const toggleSensitivity = (id: RideSensitivity) => {
    setRideData((prev) => ({
      ...prev,
      sensitivities: prev.sensitivities.includes(id)
        ? prev.sensitivities.filter((s) => s !== id)
        : [...prev.sensitivities, id],
    }));
  };

  const toggleListItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const setDefaultCard = (cardId: string) => {
    setPaymentMethods((prev) => prev.map((c) => ({ ...c, isDefault: c.cardId === cardId })));
    toast.success("Default payment method updated.");
  };

  const removeCard = (cardId: string) => {
    setPaymentMethods((prev) => prev.filter((c) => c.cardId !== cardId));
    toast.success("Payment method removed.");
  };

  const addMockCard = () => {
    const newCard: PaymentMethod = {
      cardId: `card-${Date.now()}`,
      brand: "Mastercard",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expMonth: 6,
      expYear: 2028,
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods((prev) => [...prev, newCard]);
    toast.success("Payment method added. (In production, this would go through Stripe.)");
  };

  // ═══ Toggle button helper ═══
  const ToggleBtn = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300 ${
        on ? "bg-[hsl(var(--gold))]" : "bg-muted"
      }`}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-background shadow"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  // ═══ Chip selector helper ═══
  const ChipSelector = ({
    options,
    selected,
    onToggle,
    disabled,
  }: {
    options: { id: string; label: string; icon?: string }[];
    selected: string[];
    onToggle: (id: string) => void;
    disabled?: boolean;
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            disabled={disabled}
            onClick={() => onToggle(opt.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border ${
              isActive
                ? "bg-[hsl(var(--gold))]/15 border-[hsl(var(--gold))] text-foreground"
                : "bg-card border-border text-muted-foreground hover:border-[hsl(var(--gold))]/40"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[25vh] min-h-[160px] overflow-hidden">
        <img src={headerAccount} alt="Account" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={6} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
          <motion.p {...fade()} className="label-text !text-white/60 mb-2 tracking-[0.3em]">Your Account</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-3xl sm:text-5xl leading-[1.02]">The details.</motion.h1>
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="border-b border-border bg-background px-4 sm:px-8 sticky top-16 z-30">
        <div className="max-w-3xl mx-auto">
          <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* ═══ GUEST REGISTRY TAB ═══ */}
      {activeTab === "profile" && (
        <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
          {/* Basic info */}
          <motion.div {...fade()}>
            <p className="label-text mb-8 tracking-[0.25em]">Profile</p>
            <div className="space-y-6">
              {profileFields.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <p className="label-text">{item.label}</p>
                  {editingProfile && item.editable && item.key ? (
                    <input
                      type={item.key === "email" ? "email" : "text"}
                      value={profileData[item.key]}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, [item.key!]: e.target.value }))}
                      className="font-editorial text-base text-foreground bg-transparent border-b border-[hsl(var(--gold))] outline-none text-right w-48 focus:border-[hsl(var(--gold-dark))] transition-colors"
                    />
                  ) : (
                    <p className="font-editorial text-base text-foreground">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-8">
              {editingProfile ? (
                <>
                  <button onClick={handleProfileSave} className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors">Save changes</button>
                  <button onClick={() => { setEditingProfile(false); setProfileData({ guestName: account.guestName, email: account.email }); }} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditingProfile(true)} className="link-editorial font-editorial text-sm text-foreground cursor-pointer">Edit profile</button>
              )}
            </div>
          </motion.div>

          {/* ═══ HEALTH & VITALS ═══ */}
          <motion.div {...fade(0.1)} className="mt-16">
            <p className="label-text mb-8 tracking-[0.25em]">Health & Vitals</p>
            <p className="font-editorial text-sm text-muted-foreground mb-8">
              This information helps us flag ride restrictions, dining accommodations, and accessibility needs for your party.
            </p>

            <div className="space-y-6">
              {/* Age */}
              <div className="flex items-baseline justify-between border-b border-border pb-4">
                <p className="label-text">Age</p>
                {editingHealth ? (
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={healthData.age || ""}
                    onChange={(e) => setHealthData((prev) => ({ ...prev, age: Number(e.target.value) || undefined }))}
                    className="font-editorial text-base text-foreground bg-transparent border-b border-[hsl(var(--gold))] outline-none text-right w-20 focus:border-[hsl(var(--gold-dark))] transition-colors"
                  />
                ) : (
                  <p className="font-editorial text-base text-foreground">{healthData.age ? `${healthData.age} years` : "—"}</p>
                )}
              </div>

              {/* Height */}
              <div className="flex items-baseline justify-between border-b border-border pb-4">
                <p className="label-text">Height</p>
                {editingHealth ? (
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      min={24}
                      max={96}
                      value={healthData.heightInches || ""}
                      onChange={(e) => setHealthData((prev) => ({ ...prev, heightInches: Number(e.target.value) || undefined }))}
                      className="font-editorial text-base text-foreground bg-transparent border-b border-[hsl(var(--gold))] outline-none text-right w-16 focus:border-[hsl(var(--gold-dark))] transition-colors"
                    />
                    <span className="font-editorial text-sm text-muted-foreground">inches</span>
                  </div>
                ) : (
                  <p className="font-editorial text-base text-foreground">
                    {healthData.heightInches
                      ? `${Math.floor(healthData.heightInches / 12)}'${healthData.heightInches % 12}" (${healthData.heightInches}")`
                      : "—"}
                  </p>
                )}
              </div>

              {/* DAS */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="label-text">DAS (Disability Access Service)</p>
                  <p className="font-editorial text-xs text-muted-foreground mt-1">Enables virtual queue access for qualifying conditions.</p>
                </div>
                {editingHealth ? (
                  <ToggleBtn on={healthData.dasHolder} onToggle={() => setHealthData((prev) => ({ ...prev, dasHolder: !prev.dasHolder }))} />
                ) : (
                  <span className={`label-text ${healthData.dasHolder ? "!text-[hsl(var(--gold))]" : "!text-muted-foreground"}`}>
                    {healthData.dasHolder ? "Active" : "Not enrolled"}
                  </span>
                )}
              </div>

              {/* Allergies */}
              <div className="border-b border-border pb-6">
                <p className="label-text mb-3">Allergies</p>
                <ChipSelector
                  options={ALLERGY_OPTIONS.map((a) => ({ id: a, label: a }))}
                  selected={healthData.allergies}
                  onToggle={(id) => toggleListItem(healthData.allergies, id, (val) => setHealthData((prev) => ({ ...prev, allergies: val })))}
                  disabled={!editingHealth}
                />
              </div>

              {/* Dietary */}
              <div className="border-b border-border pb-6">
                <p className="label-text mb-3">Dietary Restrictions</p>
                <ChipSelector
                  options={DIETARY_OPTIONS.map((d) => ({ id: d, label: d }))}
                  selected={healthData.dietaryRestrictions}
                  onToggle={(id) => toggleListItem(healthData.dietaryRestrictions, id, (val) => setHealthData((prev) => ({ ...prev, dietaryRestrictions: val })))}
                  disabled={!editingHealth}
                />
              </div>

              {/* Medical Notes */}
              <div className="border-b border-border pb-4">
                <p className="label-text mb-2">Medical Notes</p>
                {editingHealth ? (
                  <textarea
                    value={healthData.medicalNotes || ""}
                    onChange={(e) => setHealthData((prev) => ({ ...prev, medicalNotes: e.target.value }))}
                    placeholder="Any conditions the planning engine should know about (e.g., heat sensitivity, seizure precautions)…"
                    className="font-editorial text-sm text-foreground bg-transparent border border-border rounded-lg outline-none w-full p-3 min-h-[80px] focus:border-[hsl(var(--gold))] transition-colors resize-none"
                  />
                ) : (
                  <p className="font-editorial text-sm text-muted-foreground">{healthData.medicalNotes || "None"}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-8">
              {editingHealth ? (
                <>
                  <button onClick={handleHealthSave} className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors">Save health profile</button>
                  <button onClick={() => { setEditingHealth(false); setHealthData({ ...account.healthProfile }); }} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditingHealth(true)} className="link-editorial font-editorial text-sm text-foreground cursor-pointer">Edit health profile</button>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══ PREFERENCE MATRIX TAB ═══ */}
      {activeTab === "preferences" && (
        <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
          {/* ═══ RIDE & ATTRACTION PREFERENCES ═══ */}
          <motion.div {...fade()}>
            <p className="label-text mb-4 tracking-[0.25em]">Ride & Attraction Preferences</p>
            <p className="font-editorial text-sm text-muted-foreground mb-8">
              Flag sensitivities and we'll steer your itinerary away from rides that don't match your comfort level.
            </p>

            {/* Thrill Tolerance */}
            <div className="mb-8">
              <p className="label-text mb-4">Thrill Tolerance</p>
              <div className="flex gap-3">
                {(["low", "moderate", "high"] as const).map((level) => {
                  const labels = { low: "🐢 Low — Gentle rides only", moderate: "⚖️ Moderate — Some thrills OK", high: "🚀 High — Bring it on" };
                  const isActive = rideData.thrillTolerance === level;
                  return (
                    <button
                      key={level}
                      disabled={!editingRides}
                      onClick={() => setRideData((prev) => ({ ...prev, thrillTolerance: level }))}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                        isActive
                          ? "bg-[hsl(var(--gold))]/15 border-[hsl(var(--gold))] text-foreground shadow-sm"
                          : "bg-card border-border text-muted-foreground hover:border-[hsl(var(--gold))]/40"
                      } ${!editingRides ? "opacity-70 cursor-default" : ""}`}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensitivities */}
            <div className="mb-8">
              <p className="label-text mb-4">Sensitivities & Avoidances</p>
              <p className="font-editorial text-xs text-muted-foreground mb-4">Select anything that makes you uncomfortable — the planner will factor these in.</p>
              <ChipSelector
                options={ALL_SENSITIVITIES}
                selected={rideData.sensitivities}
                onToggle={(id) => toggleSensitivity(id as RideSensitivity)}
                disabled={!editingRides}
              />
            </div>

            {/* Active warnings */}
            {rideData.sensitivities.length > 0 && (
              <div className="border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5 rounded-lg p-4 mb-8 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--gold))] shrink-0 mt-0.5" />
                <div>
                  <p className="font-display text-sm text-foreground mb-1">Active Filters</p>
                  <p className="font-editorial text-xs text-muted-foreground">
                    The planner will flag or de-prioritize attractions tagged with: {rideData.sensitivities.map((s) => ALL_SENSITIVITIES.find((a) => a.id === s)?.label).join(", ")}.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-8">
              {editingRides ? (
                <>
                  <button onClick={handleRidesSave} className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors">Save ride preferences</button>
                  <button onClick={() => { setEditingRides(false); setRideData({ ...account.ridePreferences }); }} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditingRides(true)} className="link-editorial font-editorial text-sm text-foreground cursor-pointer">Edit ride preferences</button>
              )}
            </div>
          </motion.div>

          {/* ═══ GENERAL PREFERENCES ═══ */}
          <motion.div {...fade(0.1)} className="mt-16">
            <p className="label-text mb-8 tracking-[0.25em]">General Preferences</p>
            <div className="space-y-6">
              {prefsData.map((item, idx) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <p className="label-text">{item.label}</p>
                  {editingPrefs ? (
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...prefsData];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setPrefsData(updated);
                      }}
                      className="font-editorial text-sm text-foreground bg-transparent border-b border-[hsl(var(--gold))] outline-none text-right w-48 focus:border-[hsl(var(--gold-dark))] transition-colors"
                    />
                  ) : (
                    <p className="font-editorial text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8">
              {editingPrefs ? (
                <div className="flex gap-8">
                  <button onClick={handlePrefsSave} className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors">Save preferences</button>
                  <button onClick={() => { setEditingPrefs(false); setPrefsData([...account.preferences]); }} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditingPrefs(true)} className="link-editorial font-editorial text-sm text-foreground cursor-pointer">Update preferences</button>
              )}
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div {...fade(0.15)} className="mt-16">
            <p className="label-text mb-8 tracking-[0.25em]">Display Settings</p>
            <div className="space-y-5">
              {(() => {
                const use24h = localStorage.getItem("pref-use24h") === "true";
                return (
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-display text-base text-foreground">24-Hour Time</p>
                      <p className="font-editorial text-xs text-muted-foreground mt-1">Display times in 24-hour format (e.g. 21:00) instead of 12-hour (e.g. 9:00 PM).</p>
                    </div>
                    <ToggleBtn
                      on={use24h}
                      onToggle={() => {
                        const next = !use24h;
                        localStorage.setItem("pref-use24h", String(next));
                        toast.success(`Switched to ${next ? "24-hour" : "12-hour"} time format.`);
                        setNotifications((prev) => ({ ...prev }));
                      }}
                    />
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Notification settings */}
          <motion.div {...fade(0.2)} className="mt-16">
            <p className="label-text mb-8 tracking-[0.25em]">Notification Settings</p>
            <div className="space-y-5">
              {[
                { label: "Lightning Lane Alerts", desc: "Get notified when Lightning Lane windows open for your target rides." },
                { label: "Dining Reminders", desc: "Reservation confirmations and day-of reminders." },
                { label: "Weather Updates", desc: "Forecast changes that might affect your packing or plans." },
                { label: "Crowd Alerts", desc: "Real-time crowd level changes for your scheduled parks." },
              ].map((item) => {
                const isOn = notifications[item.label];
                return (
                  <div key={item.label} className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-display text-base text-foreground">{item.label}</p>
                      <p className="font-editorial text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                    <ToggleBtn
                      on={isOn}
                      onToggle={() => {
                        setNotifications((prev) => ({ ...prev, [item.label]: !prev[item.label] }));
                        toast.success(`${item.label} ${isOn ? "disabled" : "enabled"}.`);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══ SUBSCRIPTION TAB ═══ */}
      {activeTab === "subscription" && (
        <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
          <motion.div {...fade()}>
            <p className="label-text mb-8 tracking-[0.25em]">Subscription</p>
            <div className="border border-border bg-card rounded-lg p-8 shadow-[var(--shadow-soft)] mb-8">
              <div className="flex items-baseline justify-between mb-4">
                <p className="font-display text-2xl text-foreground">{currentPlan}</p>
                <span className="label-text !text-[hsl(var(--gold))] capitalize">{subscription.status}</span>
              </div>
              <p className="font-editorial text-sm text-muted-foreground mb-6">
                {plans.find((p) => p.name === currentPlan)?.description || subscription.planDescription}
              </p>
              <div className="flex gap-8 flex-wrap">
                <button onClick={() => setShowPlanManager(!showPlanManager)} className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                  {showPlanManager ? "Close" : "Manage plan"}
                </button>
                <button onClick={() => setShowPayment(!showPayment)} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {showPayment ? "Hide payment" : "Payment methods"}
                </button>
                <button onClick={() => setShowBilling(!showBilling)} className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  {showBilling ? "Hide billing" : "Billing history"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Plan Manager */}
          <AnimatePresence>
            {showPlanManager && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                  {plans.map((plan) => {
                    const isCurrent = plan.name === currentPlan;
                    return (
                      <motion.div
                        key={plan.name}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-500 ${
                          isCurrent ? "border-[hsl(var(--gold))] bg-card shadow-[var(--shadow-hover)]" : "border-border bg-card shadow-[var(--shadow-soft)] hover:border-[hsl(var(--gold))]/50"
                        }`}
                        onClick={() => !isCurrent && handlePlanSelect(plan.name)}
                      >
                        <p className="font-display text-lg text-foreground mb-1">{plan.name}</p>
                        <p className="font-display text-2xl text-[hsl(var(--gold-dark))] mb-3">{plan.price}</p>
                        <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-4">{plan.description}</p>
                        {isCurrent ? (
                          <span className="label-text !text-[hsl(var(--gold))]">Current Plan</span>
                        ) : (
                          <span className="label-text text-foreground hover:text-[hsl(var(--gold-dark))] transition-colors">Switch →</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ PAYMENT METHODS ═══ */}
          <AnimatePresence>
            {showPayment && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] mb-12 overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[hsl(var(--gold))]" />
                      <p className="label-text tracking-[0.25em]">Payment Methods</p>
                    </div>
                    <button
                      onClick={addMockCard}
                      className="flex items-center gap-1.5 text-sm font-editorial text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add card
                    </button>
                  </div>

                  {paymentMethods.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="font-editorial text-sm text-muted-foreground">No payment methods on file.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {paymentMethods.map((card) => (
                        <motion.div
                          key={card.cardId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="px-6 py-5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{cardBrandIcon(card.brand)}</span>
                            <div>
                              <p className="font-display text-base text-foreground">
                                {card.brand} •••• {card.last4}
                                {card.isDefault && (
                                  <span className="ml-2 text-xs font-medium text-[hsl(var(--gold))] border border-[hsl(var(--gold))]/30 rounded-full px-2 py-0.5">
                                    Default
                                  </span>
                                )}
                              </p>
                              <p className="font-editorial text-xs text-muted-foreground mt-0.5">
                                Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!card.isDefault && (
                              <button
                                onClick={() => setDefaultCard(card.cardId)}
                                className="font-editorial text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                              >
                                Set default
                              </button>
                            )}
                            <button
                              onClick={() => removeCard(card.cardId)}
                              className="text-muted-foreground cursor-pointer hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="px-6 py-3 bg-muted/30 border-t border-border">
                    <p className="font-editorial text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Payment information is securely managed via Stripe. Card details never touch our servers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Billing History */}
          <AnimatePresence>
            {showBilling && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden">
                <div className="border border-border bg-card rounded-lg shadow-[var(--shadow-soft)] mb-12 overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <p className="label-text tracking-[0.25em]">Billing History</p>
                  </div>
                  <div className="divide-y divide-border">
                    {mockBillingHistory.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="px-6 py-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-editorial text-sm text-foreground">{entry.description}</p>
                          <p className="font-editorial text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-sm text-foreground">{entry.amount}</p>
                          <p className="label-text !text-xs !text-muted-foreground">{entry.status}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close the Gates */}
          <motion.div {...fade(0.2)} className="mt-20 pt-16 border-t border-border">
            <p className="label-text mb-6 tracking-[0.25em]">Close the Gates</p>
            <p className="font-editorial text-sm text-muted-foreground mb-8 max-w-md">
              Sign out of your Castle Companion account. Your plans, memories, and party data will be here when you return.
            </p>
            <button
              onClick={() => toast.success("Signed out successfully. See you real soon!")}
              className="px-8 py-3 rounded-lg text-sm tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-destructive hover:text-destructive transition-all duration-500"
            >
              Sign Out
            </button>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Account;
