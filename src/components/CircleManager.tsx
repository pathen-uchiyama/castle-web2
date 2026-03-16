import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Check, Users, Eye, HardDrive, Trash2, Plus } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease },
});

interface SharedLink {
  id: string;
  recipientName: string;
  relation: string;
  tripName: string;
  createdDate: string;
  viewCount: number;
  isActive: boolean;
  storageStatus: "hot" | "warm" | "cold";
}

const mockLinks: SharedLink[] = [
  {
    id: "lnk-001",
    recipientName: "Grandma & Grandpa",
    relation: "Grandparents",
    tripName: "Spring Break 2025",
    createdDate: "Apr 3, 2025",
    viewCount: 12,
    isActive: true,
    storageStatus: "hot",
  },
  {
    id: "lnk-002",
    recipientName: "Aunt Sarah",
    relation: "Family",
    tripName: "Spring Break 2025",
    createdDate: "Apr 5, 2025",
    viewCount: 4,
    isActive: true,
    storageStatus: "hot",
  },
  {
    id: "lnk-003",
    recipientName: "The Johnsons",
    relation: "Family Friends",
    tripName: "Holiday Magic 2024",
    createdDate: "Jan 2, 2025",
    viewCount: 8,
    isActive: false,
    storageStatus: "warm",
  },
];

const storageColors: Record<string, { bg: string; text: string; label: string }> = {
  hot: { bg: "bg-[hsl(var(--coral)/0.1)]", text: "text-[hsl(var(--coral))]", label: "Hot Storage" },
  warm: { bg: "bg-[hsl(var(--sunshine)/0.1)]", text: "text-[hsl(var(--gold-dark))]", label: "Warm Storage" },
  cold: { bg: "bg-[hsl(var(--sky)/0.08)]", text: "text-[hsl(var(--sky))]", label: "Archived" },
};

const CircleManager = () => {
  const [links, setLinks] = useState(mockLinks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://castlecompanion.com/keepsake/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  return (
    <div className="space-y-8">
      {/* Header + Create button */}
      <motion.div {...fade()} className="flex items-start justify-between">
        <div>
          <p className="label-text mb-2">Keepsake Circle 👨‍👩‍👧‍👦</p>
          <p className="font-editorial text-sm text-muted-foreground max-w-md">
            Share your trip memories with family and friends via private "Guest Viewer" links. They'll see
            the highlights — you stay in control.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background text-[0.625rem] uppercase tracking-[0.12em] font-medium shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Link
        </motion.button>
      </motion.div>

      {/* Create new link form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="border border-[hsl(var(--lavender)/0.25)] bg-[hsl(var(--lavender)/0.04)] rounded-lg p-6">
              <p className="font-display text-base text-foreground mb-4">Create Guest Viewer Link</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label-text mb-1.5 block">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Grandma & Grandpa"
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--lavender))] transition-colors"
                  />
                </div>
                <div>
                  <label className="label-text mb-1.5 block">Relation</label>
                  <input
                    type="text"
                    placeholder="e.g. Grandparents"
                    className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[hsl(var(--lavender))] transition-colors"
                  />
                </div>
                <div>
                  <label className="label-text mb-1.5 block">Trip</label>
                  <select className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground focus:outline-none focus:border-[hsl(var(--lavender))] transition-colors">
                    <option>Spring Break 2025</option>
                    <option>Holiday Magic 2024</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 rounded-lg bg-foreground text-background text-[0.625rem] uppercase tracking-[0.12em] font-medium"
                >
                  Generate Link ✨
                </motion.button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 rounded-lg border border-border text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared links list */}
      <div className="space-y-3">
        {links.map((link, i) => {
          const storage = storageColors[link.storageStatus];
          return (
            <motion.div
              key={link.id}
              {...fade(0.05 + i * 0.04)}
              className={`border rounded-lg p-5 shadow-[var(--shadow-soft)] transition-all duration-500 ${
                link.isActive
                  ? "border-border bg-card hover:shadow-[var(--shadow-hover)]"
                  : "border-border/50 bg-muted/30 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[hsl(var(--lavender)/0.12)] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[hsl(var(--lavender))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display text-base text-foreground">{link.recipientName}</h4>
                      <span className="text-[0.5rem] uppercase tracking-[0.1em] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        {link.relation}
                      </span>
                    </div>
                    <p className="font-editorial text-xs text-muted-foreground mt-0.5">
                      {link.tripName} · Shared {link.createdDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* View count */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[0.5625rem] text-muted-foreground font-medium">{link.viewCount}</span>
                  </div>

                  {/* Storage status */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${storage.bg}`}>
                    <HardDrive className={`w-3 h-3 ${storage.text}`} />
                    <span className={`text-[0.5625rem] font-medium ${storage.text}`}>{storage.label}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCopyLink(link.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-[0.5625rem] uppercase tracking-[0.1em] text-foreground hover:bg-muted transition-colors"
                >
                  {copiedId === link.id ? (
                    <>
                      <Check className="w-3 h-3 text-[hsl(var(--mint))]" />
                      <span className="text-[hsl(var(--mint))]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Link
                    </>
                  )}
                </motion.button>

                <button
                  onClick={() => handleToggleActive(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[0.5625rem] uppercase tracking-[0.1em] transition-colors ${
                    link.isActive
                      ? "border-[hsl(var(--mint)/0.3)] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint)/0.05)]"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  {link.isActive ? "Active" : "Disabled"}
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-[0.5625rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors ml-auto">
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CircleManager;
