import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import SparkleField from "@/components/SparkleField";
import headerCircle from "@/assets/header-circle.jpg";
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

const thrillLabels: Record<string, string> = {
  low: "Gentle — prefers calm experiences",
  moderate: "Balanced — some thrills are fine",
  high: "Fearless — bring on the drops",
};

const accessibilityOptions = [
  { id: "das", label: "DAS (Disability Access Service)", category: "Accommodation" },
  { id: "wheelchair", label: "Wheelchair / ECV needed", category: "Accommodation" },
  { id: "avoid-strobes", label: "Avoid strobe lights / flashing", category: "Sensory" },
  { id: "avoid-loud", label: "Avoid prolonged loud environments", category: "Sensory" },
  { id: "avoid-dark", label: "Avoid dark enclosed spaces", category: "Sensory" },
  { id: "avoid-drops", label: "Avoid sudden drops", category: "Physical" },
  { id: "avoid-spinning", label: "Avoid spinning rides", category: "Physical" },
  { id: "avoid-motion-sim", label: "Avoid motion simulators", category: "Physical" },
  { id: "avoid-heights", label: "Avoid extreme heights", category: "Physical" },
  { id: "avoid-water", label: "Avoid water rides (getting wet)", category: "Physical" },
  { id: "seizure-risk", label: "Seizure precautions", category: "Medical" },
  { id: "heat-sensitive", label: "Heat sensitivity — needs frequent breaks", category: "Medical" },
  { id: "mobility-limited", label: "Limited mobility / stamina", category: "Medical" },
  { id: "anxiety-crowds", label: "Anxiety in large crowds", category: "Medical" },
  { id: "service-animal", label: "Traveling with service animal", category: "Accommodation" },
];

const formatHeight = (inches: number) => {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
};

const ProfileField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div>
      <p className="label-text mb-1">{label}</p>
      <p className="font-editorial text-sm text-foreground">{value}</p>
    </div>
  );
};

const Circle = ({ partyMembers }: CircleProps) => {
  const [activeTab, setActiveTab] = useState("registry");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyMember[]>(partyMembers);

  const handleFieldChange = (memberId: string, field: keyof PartyMember, value: unknown) => {
    setMembers((prev) =>
      prev.map((m) => (m.memberId === memberId ? { ...m, [field]: value } : m))
    );
  };

  const handleAccessibilityChange = (memberId: string, needId: string, checked: boolean) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.memberId !== memberId) return m;
        const current = m.accessibilityNeeds || [];
        return {
          ...m,
          accessibilityNeeds: checked
            ? [...current, needId]
            : current.filter((n) => n !== needId),
        };
      })
    );
  };

  const handleDietaryChange = (memberId: string, restriction: string, checked: boolean) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.memberId !== memberId) return m;
        const current = m.dietaryRestrictions || [];
        return {
          ...m,
          dietaryRestrictions: checked
            ? [...current, restriction]
            : current.filter((r) => r !== restriction),
        };
      })
    );
  };

  const handleMarkRefreshed = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.memberId === memberId ? { ...m, lastUpdated: new Date().toISOString().split("T")[0] } : m))
    );
    toast.success("Profile marked as up to date.");
  };

  const getFreshness = (lastUpdated?: string) => {
    if (!lastUpdated) return { label: "Never updated", color: "hsl(var(--destructive))", stale: true, days: Infinity };
    const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86400000);
    if (days <= 30) return { label: `Updated ${days}d ago`, color: "hsl(var(--gold))", stale: false, days };
    if (days <= 90) return { label: `Updated ${days}d ago`, color: "hsl(var(--muted-foreground))", stale: false, days };
    return { label: `${days}d since update`, color: "hsl(var(--destructive))", stale: true, days };
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative h-[25vh] min-h-[160px] overflow-hidden">
        <img src={headerCircle} alt="The Inner Circle" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <SparkleField count={6} />
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8">
          <motion.p {...fade()} className="label-text !text-white/60 mb-2 tracking-[0.3em]">The Inner Circle</motion.p>
          <motion.h1 {...fade(0.2)} className="font-display text-white text-3xl sm:text-5xl leading-[1.02]">Your party.</motion.h1>
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
              { label: "Party Members", value: String(members.length) },
              { label: "Total Adventures", value: String(members.reduce((s, m) => s + m.adventureCount, 0)) },
              { label: "Active Trips", value: "1" },
              { label: "Pending Surveys", value: "2" },
            ].map((stat) => (
              <div key={stat.label} className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
                <p className="label-text mb-2">{stat.label}</p>
                <p className="font-display text-3xl text-foreground">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Member cards */}
          <div className="space-y-6">
            {members.map((member, i) => {
              const isExpanded = expandedMember === member.memberId;
              const isEditing = editingMember === member.memberId;
              const freshness = getFreshness(member.lastUpdated);

              return (
                <motion.div
                  key={member.memberId}
                  {...slideRight(i * 0.1)}
                  className={`border bg-card rounded-lg shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-500 overflow-hidden ${
                    freshness.stale ? "border-destructive/30" : "border-border"
                  }`}
                >
                  {/* Header row */}
                  <div className="w-full p-6 flex items-center justify-between text-left">
                    <button
                      onClick={() => {
                        setExpandedMember(isExpanded ? null : member.memberId);
                        if (isExpanded) setEditingMember(null);
                      }}
                      className="flex items-center gap-5 flex-1 min-w-0"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-14 h-14 rounded-lg bg-foreground flex items-center justify-center shrink-0"
                      >
                        <span className="font-display text-xl text-background">{member.initial}</span>
                      </motion.div>
                      <div className="min-w-0">
                        <p className="font-display text-xl text-foreground">{member.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="label-text">{member.role}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <span
                            className="text-[0.5625rem] uppercase tracking-[0.1em] font-medium flex items-center gap-1"
                            style={{ color: freshness.color }}
                          >
                            {freshness.stale && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: freshness.color }} />
                            )}
                            {freshness.label}
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="hidden sm:flex gap-6">
                        {member.age && (
                          <div className="text-right">
                            <p className="label-text">Age</p>
                            <p className="font-display text-sm text-foreground">{member.age}</p>
                          </div>
                        )}
                        {member.heightInches && (
                          <div className="text-right">
                            <p className="label-text">Height</p>
                            <p className="font-display text-sm text-foreground">{formatHeight(member.heightInches)}</p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="label-text">Adventures</p>
                          <p className="font-display text-sm text-foreground">{member.adventureCount}</p>
                        </div>
                      </div>
                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMember(member.memberId);
                            setEditingMember(member.memberId);
                          }}
                          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold))] transition-all duration-300"
                          title="Edit profile"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </motion.button>
                        {freshness.stale && (
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRefreshed(member.memberId);
                            }}
                            className="w-8 h-8 rounded-lg border border-destructive/30 flex items-center justify-center text-destructive/70 hover:text-destructive hover:border-destructive transition-all duration-300"
                            title="Mark as refreshed"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setExpandedMember(isExpanded ? null : member.memberId);
                          if (isExpanded) setEditingMember(null);
                        }}
                      >
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-muted-foreground text-sm"
                        >
                          ▾
                        </motion.span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Profile */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-6 py-8">
                          {/* Actions bar */}
                          <div className="flex items-center gap-4 mb-8">
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  handleMarkRefreshed(member.memberId);
                                  setEditingMember(null);
                                } else {
                                  setEditingMember(member.memberId);
                                }
                              }}
                              style={{
                                background: isEditing ? "hsl(var(--foreground))" : "transparent",
                                color: isEditing ? "hsl(var(--background))" : "hsl(var(--foreground))",
                                border: `1px solid ${isEditing ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
                              }}
                            >
                              {isEditing ? "Done Editing" : "Edit Profile"}
                            </button>
                            {!isEditing && freshness.stale && (
                              <button
                                onClick={() => handleMarkRefreshed(member.memberId)}
                                className="px-5 py-2 text-xs tracking-[0.15em] uppercase font-medium rounded-lg border border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive transition-all duration-300 flex items-center gap-2"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Confirm Up to Date
                              </button>
                            )}
                            {!isEditing && !freshness.stale && (
                              <span className="label-text !text-[hsl(var(--gold))] flex items-center gap-1.5">
                                ✓ Profile is current
                              </span>
                            )}
                          </div>

                          {isEditing ? (
                            /* ─── EDIT MODE ─── */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                              <div>
                                <label className="label-text mb-2 block">Name</label>
                                <input
                                  value={member.name}
                                  onChange={(e) => handleFieldChange(member.memberId, "name", e.target.value)}
                                   className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Role</label>
                                <select
                                  value={member.role}
                                  onChange={(e) => handleFieldChange(member.memberId, "role", e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors appearance-none cursor-pointer"
                                >
                                  {["Lead Adventurer", "Co-Adventurer", "Young Explorer", "Tiny Traveler", "Grandparent", "Family Friend", "Guardian", "Guest"].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Age</label>
                                <input
                                  type="number"
                                  value={member.age ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "age", e.target.value ? Number(e.target.value) : undefined)}
                                   className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Birthday</label>
                                <input
                                  value={member.birthday ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "birthday", e.target.value)}
                                  placeholder="e.g. June 15"
                                  className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Height (inches)</label>
                                <input
                                  type="number"
                                  value={member.heightInches ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "heightInches", e.target.value ? Number(e.target.value) : undefined)}
                                   className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Thrill Tolerance</label>
                                <div className="flex gap-2">
                                  {(["low", "moderate", "high"] as const).map((level) => (
                                    <button
                                      key={level}
                                      onClick={() => handleFieldChange(member.memberId, "thrillTolerance", level)}
                                      className="px-4 py-2 rounded-md text-xs uppercase tracking-[0.1em] transition-all duration-300"
                                      style={{
                                        background: member.thrillTolerance === level ? "hsl(var(--foreground))" : "transparent",
                                        color: member.thrillTolerance === level ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                                        border: `1px solid ${member.thrillTolerance === level ? "hsl(var(--foreground))" : "hsl(var(--border))"}`,
                                      }}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Favorite Character</label>
                                <input
                                  value={member.favoriteCharacter ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "favoriteCharacter", e.target.value)}
                                   className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div>
                                <label className="label-text mb-2 block">Favorite Ride</label>
                                <input
                                  value={member.favoriteRide ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "favoriteRide", e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-md text-sm bg-background border border-border text-foreground focus:outline-none focus:border-[hsl(var(--gold))] transition-colors"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="label-text mb-2 block">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-3">
                                  {["Gluten-free", "Nut allergy", "Dairy-free", "Vegetarian", "Vegan", "Shellfish allergy"].map((item) => {
                                    const checked = member.dietaryRestrictions?.includes(item) ?? false;
                                    return (
                                      <button
                                        key={item}
                                        onClick={() => handleDietaryChange(member.memberId, item, !checked)}
                                        className="px-4 py-2 text-xs tracking-[0.1em] transition-all duration-300"
                                        style={{
                                          background: checked ? "hsl(var(--gold) / 0.15)" : "transparent",
                                          color: checked ? "hsl(var(--gold-dark))" : "hsl(var(--muted-foreground))",
                                          border: `1px solid ${checked ? "hsl(var(--gold) / 0.4)" : "hsl(var(--border))"}`,
                                        }}
                                      >
                                        {item}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              {/* ── Accessibility & Safety Needs ── */}
                              <div className="sm:col-span-2">
                                <label className="label-text mb-3 block tracking-[0.2em]">Accessibility & Safety Needs</label>
                                <p className="font-editorial text-xs text-muted-foreground mb-4 leading-relaxed">
                                  Select anything that applies so we can flag rides and experiences accordingly.
                                </p>
                                {["Accommodation", "Sensory", "Physical", "Medical"].map((category) => (
                                  <div key={category} className="mb-4">
                                    <p className="text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground mb-2 font-medium">{category}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {accessibilityOptions
                                        .filter((opt) => opt.category === category)
                                        .map((opt) => {
                                          const checked = member.accessibilityNeeds?.includes(opt.id) ?? false;
                                          return (
                                            <button
                                              key={opt.id}
                                              onClick={() => handleAccessibilityChange(member.memberId, opt.id, !checked)}
                                              className="px-4 py-2 text-xs tracking-[0.05em] rounded-md transition-all duration-300"
                                              style={{
                                                background: checked ? "hsl(var(--destructive) / 0.1)" : "transparent",
                                                color: checked ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
                                                border: `1px solid ${checked ? "hsl(var(--destructive) / 0.35)" : "hsl(var(--border))"}`,
                                              }}
                                            >
                                              {checked ? "✓ " : ""}{opt.label}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="sm:col-span-2">
                                <label className="label-text mb-2 block">Sensory Notes</label>
                                <textarea
                                  value={member.sensoryNotes ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "sensoryNotes", e.target.value)}
                                  placeholder="Any additional sensory details for planning..."
                                  rows={2}
                                  className="w-full px-4 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors resize-none"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="label-text mb-2 block">Notes</label>
                                <textarea
                                  value={member.notes ?? ""}
                                  onChange={(e) => handleFieldChange(member.memberId, "notes", e.target.value)}
                                  placeholder="Planning notes for this member..."
                                  rows={2}
                                  className="w-full px-4 py-2.5 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors resize-none"
                                />
                              </div>
                            </div>
                          ) : (
                            /* ─── VIEW MODE ─── */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                              {/* Column 1: Vitals */}
                              <div className="space-y-5">
                                <p className="label-text mb-4 tracking-[0.2em]">Vitals</p>
                                <ProfileField label="Age" value={member.age ? `${member.age} years old` : undefined} />
                                <ProfileField label="Birthday" value={member.birthday} />
                                <ProfileField label="Height" value={member.heightInches ? formatHeight(member.heightInches) : undefined} />
                                <ProfileField label="Thrill Tolerance" value={member.thrillTolerance ? thrillLabels[member.thrillTolerance] : undefined} />
                                {member.magicStatus && member.magicStatus.length > 0 && (
                                  <div>
                                    <p className="label-text mb-2">Magic Status</p>
                                    <div className="flex flex-wrap gap-2">
                                      {member.magicStatus.map((s) => (
                                        <span
                                          key={s}
                                          className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.1em]"
                                          style={{
                                            background: "hsl(var(--gold) / 0.12)",
                                            color: "hsl(var(--gold-dark))",
                                            border: "1px solid hsl(var(--gold) / 0.25)",
                                          }}
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Column 2: Preferences */}
                              <div className="space-y-5">
                                <p className="label-text mb-4 tracking-[0.2em]">Preferences</p>
                                <ProfileField label="Favorite Character" value={member.favoriteCharacter} />
                                <ProfileField label="Favorite Ride" value={member.favoriteRide} />
                                {member.dietaryRestrictions && member.dietaryRestrictions.length > 0 && (
                                  <div>
                                    <p className="label-text mb-2">Dietary Restrictions</p>
                                    <div className="flex flex-wrap gap-2">
                                      {member.dietaryRestrictions.map((r) => (
                                        <span key={r} className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.1em] bg-secondary text-muted-foreground border border-border">
                                          {r}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Full-width: Accessibility Needs */}
                              {member.accessibilityNeeds && member.accessibilityNeeds.length > 0 && (
                                <div className="sm:col-span-2 border-t border-border pt-5">
                                  <p className="label-text mb-3 tracking-[0.2em]">Accessibility & Safety Needs</p>
                                  <div className="flex flex-wrap gap-2">
                                    {member.accessibilityNeeds.map((needId) => {
                                      const opt = accessibilityOptions.find((o) => o.id === needId);
                                      return (
                                        <span
                                          key={needId}
                                          className="px-3 py-1 text-[0.625rem] uppercase tracking-[0.1em] rounded-md"
                                          style={{
                                            background: "hsl(var(--destructive) / 0.08)",
                                            color: "hsl(var(--destructive))",
                                            border: "1px solid hsl(var(--destructive) / 0.2)",
                                          }}
                                        >
                                          {opt?.label ?? needId}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Full-width: Sensory & Notes */}
                              {member.sensoryNotes && (
                                <div className="sm:col-span-2 border-t border-border pt-5">
                                  <p className="label-text mb-2">Sensory Notes</p>
                                  <p className="font-editorial text-sm text-muted-foreground italic leading-relaxed">{member.sensoryNotes}</p>
                                </div>
                              )}
                              {member.notes && (
                                <div className="sm:col-span-2 border-t border-border pt-5">
                                  <p className="label-text mb-2">Planning Notes</p>
                                  <p className="font-editorial text-sm text-muted-foreground leading-relaxed">{member.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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
            {members.map((member, i) => {
              const isComplete = i < 2;
              return (
                <div key={member.memberId} className="flex items-center justify-between border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
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
