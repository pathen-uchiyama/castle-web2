import { cn } from "@/lib/utils";

/**
 * Shimmer animation base — a warm-toned, editorial loading effect.
 * All skeleton variants compose this base shimmer style.
 */
const shimmerClass =
  "animate-shimmer rounded-lg bg-[length:200%_100%]";

const shimmerStyle = {
  backgroundImage:
    "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.4) 50%, hsl(var(--muted)) 75%)",
};

/* ── SkeletonText ─────────────────────────────────────────────────
   Line-height shimmer blocks of varying widths.
   Pass `lines` for multi-line paragraphs.                        */

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Preset widths per line — cycles if fewer than `lines` */
  widths?: string[];
}

export const SkeletonText = ({
  lines = 3,
  className,
  widths = ["100%", "85%", "60%"],
}: SkeletonTextProps) => (
  <div className={cn("space-y-2.5", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(shimmerClass, "h-3")}
        style={{ ...shimmerStyle, width: widths[i % widths.length] }}
      />
    ))}
  </div>
);

/* ── SkeletonCard ─────────────────────────────────────────────────
   Card-shaped shimmer for trip / park / memory cards.             */

interface SkeletonCardProps {
  className?: string;
  /** Show a header image area */
  withImage?: boolean;
}

export const SkeletonCard = ({ className, withImage = true }: SkeletonCardProps) => (
  <div
    className={cn(
      "rounded-lg border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]",
      className,
    )}
  >
    {withImage && (
      <div
        className={cn(shimmerClass, "h-48 rounded-none")}
        style={shimmerStyle}
      />
    )}
    <div className="p-6 space-y-4">
      <div className={cn(shimmerClass, "h-4 w-2/3")} style={shimmerStyle} />
      <SkeletonText lines={2} widths={["90%", "55%"]} />
      <div className="flex gap-2 pt-1">
        <div className={cn(shimmerClass, "h-6 w-16")} style={shimmerStyle} />
        <div className={cn(shimmerClass, "h-6 w-20")} style={shimmerStyle} />
      </div>
    </div>
  </div>
);

/* ── SkeletonTimeline ─────────────────────────────────────────────
   Vertical timeline spine with shimmer blocks (Designer).         */

interface SkeletonTimelineProps {
  items?: number;
  className?: string;
}

export const SkeletonTimeline = ({ items = 6, className }: SkeletonTimelineProps) => (
  <div className={cn("relative pl-8", className)}>
    {/* Spine */}
    <div
      className="absolute left-3 top-0 bottom-0 w-[2px]"
      style={{ backgroundColor: "hsl(var(--border))" }}
    />

    <div className="space-y-5">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="relative">
          {/* Spine dot */}
          <div
            className={cn(shimmerClass, "absolute -left-5 top-4 w-3 h-3 rounded-full")}
            style={shimmerStyle}
          />

          {/* Card */}
          <div className="border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(shimmerClass, "h-5 w-16")} style={shimmerStyle} />
              <div className={cn(shimmerClass, "h-4 w-12")} style={shimmerStyle} />
              <div className={cn(shimmerClass, "h-3 w-24 ml-auto")} style={shimmerStyle} />
            </div>
            <div className={cn(shimmerClass, "h-5 w-3/5 mb-2")} style={shimmerStyle} />
            <div className="flex gap-2">
              <div className={cn(shimmerClass, "h-5 w-14")} style={shimmerStyle} />
              <div className={cn(shimmerClass, "h-5 w-20")} style={shimmerStyle} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── SkeletonGrid ─────────────────────────────────────────────────
   Masonry-like grid of shimmer rectangles (Memories).             */

interface SkeletonGridProps {
  className?: string;
}

export const SkeletonGrid = ({ className }: SkeletonGridProps) => {
  const cells = [
    "col-span-1 sm:col-span-4 sm:row-span-2",
    "col-span-1 sm:col-span-2 sm:row-span-1",
    "col-span-1 sm:col-span-2 sm:row-span-1",
    "col-span-1 sm:col-span-3 sm:row-span-1",
    "col-span-1 sm:col-span-3 sm:row-span-1",
    "col-span-1 sm:col-span-6 sm:row-span-1",
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-6 gap-3 auto-rows-[180px] sm:auto-rows-[220px]",
        className,
      )}
    >
      {cells.map((span, i) => (
        <div
          key={i}
          className={cn(shimmerClass, span, "rounded-lg")}
          style={shimmerStyle}
        />
      ))}
    </div>
  );
};

/* ── SkeletonHero ─────────────────────────────────────────────────
   Full-width hero image placeholder.                               */

export const SkeletonHero = ({ className }: { className?: string }) => (
  <div className={cn("relative h-[25vh] min-h-[160px] overflow-hidden", className)}>
    <div
      className={cn(shimmerClass, "absolute inset-0 rounded-none")}
      style={shimmerStyle}
    />
    <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-8 space-y-3">
      <div className={cn(shimmerClass, "h-3 w-32")} style={shimmerStyle} />
      <div className={cn(shimmerClass, "h-8 w-64")} style={shimmerStyle} />
    </div>
  </div>
);

/* ── SkeletonMetric ───────────────────────────────────────────────
   Single metric card placeholder.                                  */

export const SkeletonMetric = ({ className }: { className?: string }) => (
  <div className={cn("border border-border bg-card rounded-lg p-5 shadow-[var(--shadow-soft)]", className)}>
    <div className={cn(shimmerClass, "h-3 w-20 mb-3")} style={shimmerStyle} />
    <div className={cn(shimmerClass, "h-8 w-16")} style={shimmerStyle} />
  </div>
);
