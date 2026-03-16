import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface KeepsakeNudgeProps {
  trigger: string; // e.g. "Approaching Space Mountain" or "Wait time: 65 min"
  onCapture: (type: "photo" | "audio") => void;
  onDismiss: () => void;
}

const KeepsakeNudge = ({ trigger, onCapture, onDismiss }: KeepsakeNudgeProps) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px] z-50"
        >
          <div className="rounded-lg bg-card/95 backdrop-blur-xl border border-border shadow-[0_16px_48px_-8px_hsla(270,30%,40%,0.15)] p-4 sm:p-5">
            {/* AI Assistant badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--lavender)/0.1)] border border-[hsl(var(--lavender)/0.2)]">
                <Sparkles className="w-3 h-3 text-[hsl(var(--lavender))]" />
                <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-[hsl(var(--lavender))] font-medium">
                  ✨ AI Assistant
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Context */}
            <p className="font-editorial text-sm text-foreground mb-1">
              Capture this moment? 📸
            </p>
            <p className="font-editorial text-xs text-muted-foreground mb-4 leading-relaxed">
              {trigger} — a perfect time to save a keepsake for your family.
            </p>

            {/* One-tap capture buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCapture("photo")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-foreground text-background text-[0.6875rem] uppercase tracking-[0.12em] font-medium transition-colors hover:opacity-90"
              >
                <Camera className="w-4 h-4" />
                Photo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCapture("audio")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-card text-foreground text-[0.6875rem] uppercase tracking-[0.12em] font-medium hover:bg-muted transition-colors"
              >
                <Mic className="w-4 h-4" />
                Audio Note
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeepsakeNudge;
