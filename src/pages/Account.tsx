import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import SparkleField from "@/components/SparkleField";
import headerAccount from "@/assets/header-account.jpg";
import type { AccountProfile, Preference } from "@/data/types";

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

const Account = ({ account }: AccountProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    guestName: account.guestName,
    email: account.email,
  });

  // Preferences editing
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [prefsData, setPrefsData] = useState<Preference[]>([...account.preferences]);

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
  const [currentPlan, setCurrentPlan] = useState(account.subscription.planName);

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

  const handlePrefsSave = () => {
    setEditingPrefs(false);
    toast.success("Preferences updated successfully.");
  };

  const handlePlanSelect = (planName: string) => {
    setCurrentPlan(planName);
    setShowPlanManager(false);
    toast.success(`Switched to ${planName} plan.`);
  };

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
                  <button
                    onClick={handleProfileSave}
                    className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors"
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileData({ guestName: account.guestName, email: account.email });
                    }}
                    className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="link-editorial font-editorial text-sm text-foreground cursor-pointer"
                >
                  Edit profile
                </button>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══ PREFERENCE MATRIX TAB ═══ */}
      {activeTab === "preferences" && (
        <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
          <motion.div {...fade()}>
            <p className="label-text mb-8 tracking-[0.25em]">Preferences</p>
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
                  <button
                    onClick={handlePrefsSave}
                    className="link-editorial font-editorial text-sm text-[hsl(var(--gold-dark))] cursor-pointer hover:text-foreground transition-colors"
                  >
                    Save preferences
                  </button>
                  <button
                    onClick={() => {
                      setEditingPrefs(false);
                      setPrefsData([...account.preferences]);
                    }}
                    className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPrefs(true)}
                  className="link-editorial font-editorial text-sm text-foreground cursor-pointer"
                >
                  Update preferences
                </button>
              )}
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div {...fade(0.1)} className="mt-16">
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
                    <button
                      onClick={() => {
                        const next = !use24h;
                        localStorage.setItem("pref-use24h", String(next));
                        toast.success(`Switched to ${next ? "24-hour" : "12-hour"} time format.`);
                        // Force re-render
                        setNotifications(prev => ({ ...prev }));
                      }}
                      className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300 ${
                        use24h ? "bg-[hsl(var(--gold))]" : "bg-muted"
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full bg-background shadow"
                        animate={{ x: use24h ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Notification settings */}
          <motion.div {...fade(0.15)} className="mt-16">
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
                    <button
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, [item.label]: !prev[item.label] }));
                        toast.success(`${item.label} ${isOn ? "disabled" : "enabled"}.`);
                      }}
                      className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-300 ${
                        isOn ? "bg-[hsl(var(--gold))]" : "bg-muted"
                      }`}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full bg-background shadow"
                        animate={{ x: isOn ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
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
              <div className="flex gap-8">
                <button
                  onClick={() => setShowPlanManager(!showPlanManager)}
                  className="link-editorial font-editorial text-sm text-foreground cursor-pointer"
                >
                  {showPlanManager ? "Close" : "Manage plan"}
                </button>
                <button
                  onClick={() => setShowBilling(!showBilling)}
                  className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {showBilling ? "Hide billing" : "Billing history"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Plan Manager */}
          <AnimatePresence>
            {showPlanManager && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                  {plans.map((plan) => {
                    const isCurrent = plan.name === currentPlan;
                    return (
                      <motion.div
                        key={plan.name}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.3 }}
                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-500 ${
                          isCurrent
                            ? "border-[hsl(var(--gold))] bg-card shadow-[var(--shadow-hover)]"
                            : "border-border bg-card shadow-[var(--shadow-soft)] hover:border-[hsl(var(--gold))]/50"
                        }`}
                        onClick={() => !isCurrent && handlePlanSelect(plan.name)}
                      >
                        <p className="font-display text-lg text-foreground mb-1">{plan.name}</p>
                        <p className="font-display text-2xl text-[hsl(var(--gold-dark))] mb-3">{plan.price}</p>
                        <p className="font-editorial text-xs text-muted-foreground leading-relaxed mb-4">{plan.description}</p>
                        {isCurrent ? (
                          <span className="label-text !text-[hsl(var(--gold))]">Current Plan</span>
                        ) : (
                          <span className="label-text text-foreground hover:text-[hsl(var(--gold-dark))] transition-colors">
                            Switch →
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Billing History */}
          <AnimatePresence>
            {showBilling && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease }}
                className="overflow-hidden"
              >
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
