import { motion } from "framer-motion";

interface FloatingAnchorProps {
  waiting?: boolean;
}

const FloatingAnchor = ({ waiting = false }: FloatingAnchorProps) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 flex items-center justify-center cursor-pointer focus:outline-none group"
      aria-label="The Golden Anchor"
      whileTap={{ scale: 0.94 }}
    >
      {/* Breathing glow */}
      <span
        className="absolute inset-0 rounded-full"
        style={{ animation: "seal-breathe 3s ease-in-out infinite" }}
      />

      {/* Wax seal body */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `radial-gradient(circle at 35% 35%, hsl(42 64% 45%), hsl(42 70% 28%) 70%)`,
          boxShadow: `
            inset 0 1px 2px 0 hsla(42, 80%, 70%, 0.4),
            inset 0 -2px 4px 0 hsla(42, 70%, 20%, 0.3),
            0 2px 8px -2px hsla(42, 60%, 25%, 0.4),
            0 1px 2px 0 hsla(42, 60%, 25%, 0.2)
          `,
        }}
      >
        {/* Seal stamp texture — concentric rings */}
        <div
          className="absolute inset-[3px] rounded-full border border-dashed"
          style={{ borderColor: "hsla(42, 80%, 70%, 0.25)" }}
        />
        <div
          className="absolute inset-[7px] rounded-full border"
          style={{ borderColor: "hsla(42, 80%, 70%, 0.15)" }}
        />

        {/* Anchor icon — stamped in */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10"
          style={{
            filter: "drop-shadow(0 1px 0 hsla(42, 70%, 20%, 0.4))",
          }}
        >
          <path
            d="M12 2v20M12 8a4 4 0 1 0 0-1M5 12h14M7 20c0-4 2.5-8 5-8s5 4 5 8"
            stroke="hsla(42, 80%, 80%, 0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </motion.button>
  );
};

export default FloatingAnchor;
