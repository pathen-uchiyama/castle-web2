import { motion } from "framer-motion";

interface SectionTab {
  id: string;
  label: string;
  badge?: string;
}

interface SectionNavProps {
  tabs: SectionTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /** Use light text for dark backgrounds */
  variant?: "light" | "dark";
}

const SectionNav = ({ tabs, activeTab, onTabChange, variant = "light" }: SectionNavProps) => {
  const isLight = variant === "light";

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto px-1 py-1"
      style={{
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        background: isLight ? "hsl(var(--muted) / 0.5)" : "hsla(0, 0%, 100%, 0.06)",
        borderRadius: "0.75rem",
        border: isLight ? "1px solid hsl(var(--border) / 0.6)" : "1px solid hsla(0, 0%, 100%, 0.08)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-3 sm:px-5 py-2.5 shrink-0 whitespace-nowrap transition-all duration-300 focus:outline-none group"
            style={{ borderRadius: "0.5rem" }}
          >
            {/* Active background pill */}
            {isActive && (
              <motion.div
                layoutId="section-nav-active"
                className="absolute inset-0"
                style={{
                  borderRadius: "0.5rem",
                  background: isLight ? "hsl(0, 0%, 100%)" : "hsla(0, 0%, 100%, 0.12)",
                  boxShadow: isLight
                    ? "0 1px 3px hsl(var(--ink) / 0.06), 0 4px 12px hsl(var(--ink) / 0.04)"
                    : "0 1px 3px hsla(0, 0%, 0%, 0.2)",
                }}
                transition={{ type: "spring", damping: 30, stiffness: 350 }}
              />
            )}
            <span
              className="relative z-10 uppercase tracking-[0.18em] transition-colors duration-300 flex items-center gap-2"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "0.6875rem",
                fontWeight: isActive ? 500 : 400,
                color: isActive
                  ? isLight ? "hsl(var(--foreground))" : "hsl(0, 0%, 100%)"
                  : isLight ? "hsl(var(--muted-foreground))" : "hsla(0, 0%, 100%, 0.45)",
              }}
            >
              {tab.label}
              {tab.badge && (
                <span
                  className="px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    background: "hsl(var(--gold) / 0.15)",
                    color: "hsl(var(--gold-dark))",
                    border: "1px solid hsl(var(--gold) / 0.3)",
                    borderRadius: "0.375rem",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SectionNav;
