import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "The Adventure", path: "/adventure" },
  { label: "Memories", path: "/memories" },
  { label: "The Circle", path: "/circle" },
  { label: "Account", path: "/account" },
];

const Navigation = () => {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 200], [0, 1]);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-12 h-16"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      {/* Backdrop that fades in on scroll */}
      <motion.div
        className="absolute inset-0 backdrop-blur-md border-b border-white/[0.06]"
        style={{
          opacity: bgOpacity,
          background: isHome
            ? "hsla(0, 0%, 5%, 0.85)"
            : "hsla(35, 20%, 95%, 0.92)",
        }}
      />

      {/* Logo / Home */}
      <Link to="/" className="relative z-10">
        <span
          className={`font-display text-lg tracking-[-0.03em] transition-colors duration-500 ${
            isHome ? "text-white/90 hover:text-white" : "text-foreground/90 hover:text-foreground"
          }`}
        >
          Castle Companion
        </span>
      </Link>

      {/* Nav links */}
      <div className="relative z-10 hidden sm:flex items-center gap-8 lg:gap-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <span
                className={`label-text transition-all duration-500 cursor-pointer ${
                  isHome
                    ? isActive
                      ? "!text-white"
                      : "!text-white/40 hover:!text-white/70"
                    : isActive
                      ? "!text-foreground"
                      : "!text-muted-foreground hover:!text-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Minimal indicator */}
      <div className="relative z-10 sm:hidden">
        <Link to="/adventure">
          <span className={`label-text ${isHome ? "!text-white/50" : "!text-muted-foreground"}`}>
            Menu
          </span>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navigation;
