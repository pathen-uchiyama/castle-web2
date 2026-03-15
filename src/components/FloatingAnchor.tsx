import { motion } from "framer-motion";
import { GoldenAnchor } from "@/components/Icons";

const FloatingAnchor = () => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg cursor-pointer border-2 border-gold-light/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
      aria-label="Open Castle Companion menu"
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.08 }}
    >
      {/* Haptic pulse rings */}
      <span className="absolute inset-0 rounded-full animate-[fab-pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-gold/30" />
      <span className="absolute inset-0 rounded-full animate-[fab-pulse_2.5s_cubic-bezier(0.4,0,0.6,1)_0.8s_infinite] bg-gold/20" />
      <GoldenAnchor className="w-6 h-6 text-white relative z-10" />
    </motion.button>
  );
};

export default FloatingAnchor;
