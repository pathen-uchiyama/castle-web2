import { motion } from "framer-motion";

/**
 * Decorative pennant flags that wave gently in a breeze.
 * Positioned at castle-appropriate spots in the hero.
 */
const flags = [
  { x: "18%", y: "22%", rotate: -8, delay: 0, color: "hsl(var(--gold))" },
  { x: "24%", y: "18%", rotate: 5, delay: 0.4, color: "hsl(42 60% 55%)" },
  { x: "72%", y: "20%", rotate: -6, delay: 0.8, color: "hsl(var(--gold))" },
  { x: "78%", y: "24%", rotate: 10, delay: 1.2, color: "hsl(42 50% 50%)" },
  { x: "50%", y: "15%", rotate: -4, delay: 0.2, color: "hsl(42 65% 60%)" },
];

const HeroFlags = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    {flags.map((f, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ left: f.x, top: f.y }}
        animate={{
          rotate: [f.rotate, f.rotate + 6, f.rotate - 4, f.rotate + 3, f.rotate],
          scaleX: [1, 1.05, 0.97, 1.03, 1],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: f.delay,
        }}
      >
        {/* Flag pennant shape via SVG */}
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none" style={{ opacity: 0.35 }}>
          <path
            d="M2 0 L2 32 M2 2 Q10 6 18 3 Q12 10 2 14"
            stroke={f.color}
            strokeWidth="1"
            fill={f.color}
            fillOpacity="0.5"
          />
        </svg>
      </motion.div>
    ))}
  </div>
);

export default HeroFlags;
