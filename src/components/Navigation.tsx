import { useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import ccLogo from "@/assets/cc-logo-light.png";

const navItems = [
  { label: "Plan Your Trip", path: "/adventure" },
  { label: "Park Guides", path: "/guides" },
  { label: "Memories", path: "/memories" },
  { label: "The Circle", path: "/circle" },
  { label: "Account", path: "/account" },
];

const Navigation = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 200], [0, 1]);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Match /guides, /resort/*, and /parks/* for Park Guides active state
  const isGuideActive = (path: string) => {
    if (path === "/guides") {
      return location.pathname.startsWith("/guides") || location.pathname.startsWith("/resort") || location.pathname.startsWith("/parks");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 h-16"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 backdrop-blur-md border-b border-white/[0.06]"
          style={{
            opacity: bgOpacity,
            background: isHome ? "hsla(0, 0%, 5%, 0.85)" : "hsla(35, 20%, 95%, 0.92)",
          }}
        />
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <img src={ccLogo} alt="Castle Companion" className={`h-9 w-auto transition-all duration-500 ${isHome ? "brightness-0 invert opacity-90 hover:opacity-100" : "opacity-90 hover:opacity-100"}`} />
          <span className={`font-display text-lg tracking-[-0.03em] transition-colors duration-500 hidden sm:inline ${isHome ? "text-white/90 hover:text-white" : "text-foreground/90 hover:text-foreground"}`}>
            Castle Companion
          </span>
        </Link>
        <div className="relative z-10 hidden md:flex items-center gap-7 lg:gap-9">
          {navItems.map((item) => {
            const isActive = isGuideActive(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <span className={`label-text transition-all duration-500 cursor-pointer ${isHome ? (isActive ? "!text-white" : "!text-white/55 hover:!text-white/80") : (isActive ? "!text-foreground" : "!text-muted-foreground hover:!text-foreground")}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <button
          className="relative z-10 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`label-text ${isHome ? "!text-white/60" : "!text-muted-foreground"}`}>
            {mobileOpen ? "Close" : "Menu"}
          </span>
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-lg pt-20 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-6">
              {navItems.map((item, i) => {
                const isActive = isGuideActive(item.path);
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className={`font-display text-2xl ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
