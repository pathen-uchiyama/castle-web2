import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SparkleField from "./SparkleField";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface EmptyStateProps {
  emoji?: string;
  headline: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
  ctaTo?: string;
  /** Show subtle sparkle animation */
  sparkle?: boolean;
}

const EmptyState = ({
  emoji = "✨",
  headline,
  description,
  ctaLabel,
  ctaAction,
  ctaTo,
  sparkle = false,
}: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2, ease }}
    className="flex flex-col items-center justify-center text-center max-w-[400px] mx-auto py-20 px-6"
  >
    {/* Illustration area */}
    <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "hsl(var(--gold) / 0.08)",
          border: "1px solid hsl(var(--gold) / 0.15)",
        }}
      />
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease }}
        className="relative text-4xl"
      >
        {emoji}
      </motion.span>
      {sparkle && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <SparkleField count={4} />
        </div>
      )}
    </div>

    {/* Headline */}
    <h3 className="font-display text-xl text-foreground leading-tight mb-3">
      {headline}
    </h3>

    {/* Description */}
    <p className="font-editorial text-sm text-muted-foreground leading-relaxed mb-8">
      {description}
    </p>

    {/* CTA */}
    {ctaLabel && ctaTo && (
      <Link
        to={ctaTo}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm font-medium text-background transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
          boxShadow: "0 4px 16px hsl(var(--gold) / 0.2)",
        }}
      >
        <span>✨</span>
        {ctaLabel}
      </Link>
    )}
    {ctaLabel && ctaAction && !ctaTo && (
      <button
        onClick={ctaAction}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm font-medium text-background transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
          boxShadow: "0 4px 16px hsl(var(--gold) / 0.2)",
        }}
      >
        <span>✨</span>
        {ctaLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;
