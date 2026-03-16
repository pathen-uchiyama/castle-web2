import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Camera, Mic, Check } from "lucide-react";

interface CaptureConsentToggleProps {
  onConsent: (agreed: boolean) => void;
  isAgreed?: boolean;
}

const CaptureConsentToggle = ({ onConsent, isAgreed = false }: CaptureConsentToggleProps) => {
  const [agreed, setAgreed] = useState(isAgreed);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = () => {
    const next = !agreed;
    setAgreed(next);
    onConsent(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)]"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--lavender)/0.12)] flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-[hsl(var(--lavender))]" />
        </div>
        <div>
          <h3 className="font-display text-xl text-foreground mb-1">Digital Plaid Capture</h3>
          <p className="font-editorial text-sm text-muted-foreground">
            Your memories deserve to be kept — safely and privately. 🔒
          </p>
        </div>
      </div>

      {/* Capture types */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--sky)/0.08)] border border-[hsl(var(--sky)/0.2)]">
          <Camera className="w-3.5 h-3.5 text-[hsl(var(--sky))]" />
          <span className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--sky))]">Photos</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[hsl(var(--coral)/0.08)] border border-[hsl(var(--coral)/0.2)]">
          <Mic className="w-3.5 h-3.5 text-[hsl(var(--coral))]" />
          <span className="text-[0.625rem] uppercase tracking-[0.12em] text-[hsl(var(--coral))]">Audio Notes</span>
        </div>
      </div>

      {/* Consent toggle */}
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          className={`relative w-12 h-7 rounded-full shrink-0 transition-colors duration-300 mt-0.5 ${
            agreed
              ? "bg-[hsl(var(--mint))]"
              : "bg-muted border border-border"
          }`}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
            animate={{ left: agreed ? 24 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
          <AnimatePresence>
            {agreed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 left-[26px] w-4 h-4 flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-[hsl(var(--mint))]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <div>
          <p className="font-editorial text-sm text-foreground leading-relaxed">
            I agree to the <button onClick={() => setShowDetails(!showDetails)} className="link-editorial text-[hsl(var(--lavender))]">Digital Plaid Capture Consent</button> policy.
            I understand recordings are for private use and I will respect park etiquette.
          </p>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              {[
                { icon: "📱", text: "Captures are stored privately on your device and in your encrypted Castle Companion vault." },
                { icon: "🎭", text: "Audio recordings are for personal memory journals only — never for commercial use." },
                { icon: "🤝", text: "Always be discrete and respectful of other guests when capturing moments." },
                { icon: "🗑️", text: "You can delete any capture at any time from your Keepsake vault." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <p className="font-editorial text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status badge */}
      <AnimatePresence>
        {agreed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-md bg-[hsl(var(--mint)/0.08)] border border-[hsl(var(--mint)/0.2)]"
          >
            <Check className="w-4 h-4 text-[hsl(var(--mint))]" />
            <span className="font-editorial text-sm text-[hsl(var(--mint))]">
              Capture enabled — your memories are ready to be collected ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CaptureConsentToggle;
