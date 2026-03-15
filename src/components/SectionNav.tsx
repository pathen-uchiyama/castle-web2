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
    <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-5 py-3 shrink-0 transition-all duration-500 focus:outline-none group"
          >
            <span
              className="uppercase tracking-[0.2em] transition-colors duration-500"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "0.6875rem",
                fontWeight: 400,
                color: isActive
                  ? isLight ? "hsl(var(--foreground))" : "hsl(0, 0%, 100%)"
                  : isLight ? "hsl(var(--muted-foreground))" : "hsla(0, 0%, 100%, 0.4)",
              }}
            >
              {tab.label}
            </span>
            {tab.badge && (
              <span
                className="ml-2 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.1em]"
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  background: "hsl(var(--gold) / 0.15)",
                  color: "hsl(var(--gold-dark))",
                  border: "1px solid hsl(var(--gold) / 0.3)",
                }}
              >
                {tab.badge}
              </span>
            )}
            {/* Active underline */}
            <motion.div
              className="absolute bottom-0 left-5 right-5 h-px"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scaleX: isActive ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
              style={{
                background: isLight ? "hsl(var(--gold))" : "hsl(var(--gold-light))",
                transformOrigin: "left",
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default SectionNav;
