import { useEffect, useRef } from "react";

/**
 * Canvas-based particle system:
 * 1) Ambient embers — randomly placed, twinkling across the scene
 * 2) Trail embers — following an invisible fairy path
 */
const EmberTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Ambient embers (random scattered sparkles) ──
    interface AmbientEmber {
      x: number; y: number; size: number;
      phase: number; speed: number; hue: number; maxAlpha: number;
    }
    const ambientCount = 25;
    const ambients: AmbientEmber[] = Array.from({ length: ambientCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      hue: 32 + Math.random() * 18,
      maxAlpha: 0.3 + Math.random() * 0.5,
    }));

    // ── Trail embers (two fairy paths playing together) ──
    const fairy1X = (t: number, w: number) =>
      w * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.3)) * (0.5 + 0.5 * Math.cos(t * 0.17)));
    const fairy1Y = (t: number, h: number) =>
      h * (0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.23 + 1.2)) * (0.5 + 0.5 * Math.cos(t * 0.31 + 0.8)));

    const fairy2X = (t: number, w: number) =>
      w * (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.35 + 2.0)) * (0.5 + 0.5 * Math.cos(t * 0.22 + 1.5)));
    const fairy2Y = (t: number, h: number) =>
      h * (0.15 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.28 + 0.5)) * (0.5 + 0.5 * Math.cos(t * 0.19 + 2.2)));

    interface TrailEmber {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number; hue: number;
    }
    const trailEmbers: TrailEmber[] = [];
    const maxTrail = 50;

    const spawnAt = (fx: number, fy: number, hueBase: number) => {
      trailEmbers.push({
        x: fx + (Math.random() - 0.5) * 120,
        y: fy + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.15,
        life: 0,
        maxLife: 70 + Math.random() * 70,
        size: Math.random() * 2.2 + 0.8,
        hue: hueBase + Math.random() * 15,
      });
    };

    const drawEmber = (x: number, y: number, size: number, hue: number, alpha: number) => {
      // Outer glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
      grad.addColorStop(0, `hsla(${hue}, 80%, 60%, ${alpha * 0.35})`);
      grad.addColorStop(1, `hsla(${hue}, 80%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `hsla(${hue}, 90%, 72%, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // Ambient embers
      for (const a of ambients) {
        const alpha = a.maxAlpha * (0.5 + 0.5 * Math.sin(time * a.speed + a.phase));
        if (alpha > 0.05) {
          drawEmber(a.x * w, a.y * h, a.size, a.hue, alpha);
        }
      }

      // Trail embers — two pixies playing
      if (trailEmbers.length < maxTrail) {
        spawnAt(fairy1X(time, w), fairy1Y(time, h), 35);
        if (Math.random() > 0.5) spawnAt(fairy2X(time, w), fairy2Y(time, h), 28);
      }

      for (let i = trailEmbers.length - 1; i >= 0; i--) {
        const e = trailEmbers[i];
        e.life++;
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= 0.002;

        const p = e.life / e.maxLife;
        const alpha = p < 0.15 ? p / 0.15 : p < 0.5 ? 1 : 1 - (p - 0.5) / 0.5;

        if (e.life >= e.maxLife) {
          trailEmbers.splice(i, 1);
          continue;
        }

        drawEmber(e.x, e.y, e.size * (1 - p * 0.3), e.hue, alpha * 0.8);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.8 }}
    />
  );
};

export default EmberTrail;
