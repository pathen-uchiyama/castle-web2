import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import SparkleField from "@/components/SparkleField";
import headerAccount from "@/assets/header-account.jpg";
import type { AccountProfile } from "@/data/types";

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

const Account = ({ account }: AccountProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const { subscription, preferences } = account;

  const profileFields = [
    { label: "Name", value: account.guestName },
    { label: "Email", value: account.email },
    { label: "Member since", value: account.memberSince },
    { label: "Adventures completed", value: String(account.adventuresCompleted) },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <motion.div {...fade()}>
          <p className="label-text mb-6 tracking-[0.3em]">Your Account</p>
          <h1 className="font-display text-5xl sm:text-6xl text-foreground leading-[1.02] mb-4">
            The details.
          </h1>
          <p className="font-editorial text-muted-foreground max-w-md">
            Your guest profile, preferences, and subscription — all in one place.
          </p>
        </motion.div>
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
                  <p className="font-editorial text-base text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-8">
              <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                Edit profile
              </span>
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
              {preferences.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <p className="label-text">{item.label}</p>
                  <p className="font-editorial text-sm text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                Update preferences
              </span>
            </div>
          </motion.div>

          {/* Notification settings */}
          <motion.div {...fade(0.1)} className="mt-16">
            <p className="label-text mb-8 tracking-[0.25em]">Notification Settings</p>
            <div className="space-y-5">
              {[
                { label: "Lightning Lane Alerts", desc: "Get notified when Lightning Lane windows open for your target rides." },
                { label: "Dining Reminders", desc: "Reservation confirmations and day-of reminders." },
                { label: "Weather Updates", desc: "Forecast changes that might affect your packing or plans." },
                { label: "Crowd Alerts", desc: "Real-time crowd level changes for your scheduled parks." },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-display text-base text-foreground">{item.label}</p>
                    <p className="font-editorial text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                   <div className="w-10 h-5 rounded-full bg-[hsl(var(--gold))] flex items-center px-0.5 cursor-pointer">
                     <div className="w-4 h-4 rounded-full bg-background shadow translate-x-5 transition-transform" />
                   </div>
                </div>
              ))}
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
                <p className="font-display text-2xl text-foreground">{subscription.planName}</p>
                <span className="label-text !text-[hsl(var(--gold))] capitalize">{subscription.status}</span>
              </div>
              <p className="font-editorial text-sm text-muted-foreground mb-6">
                {subscription.planDescription}
              </p>
              <div className="flex gap-8">
                <span className="link-editorial font-editorial text-sm text-foreground cursor-pointer">
                  Manage plan
                </span>
                <span className="link-editorial font-editorial text-sm text-muted-foreground cursor-pointer">
                  Billing history
                </span>
              </div>
            </div>
          </motion.div>

          {/* Close the Gates */}
          <motion.div {...fade(0.2)} className="mt-20 pt-16 border-t border-border">
            <p className="label-text mb-6 tracking-[0.25em]">Close the Gates</p>
            <p className="font-editorial text-sm text-muted-foreground mb-8 max-w-md">
              Sign out of your Castle Companion account. Your plans, memories, and party data will be here when you return.
            </p>
            <button className="px-8 py-3 rounded-lg text-sm tracking-[0.15em] uppercase font-medium text-muted-foreground border border-border hover:border-destructive hover:text-destructive transition-all duration-500">
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
