import { useEffect, useRef } from "react";

/**
 * Glowing embers that follow an invisible fairy path through the scene.
 * Each ember fades in, glows warm gold, then fades out along the trail.
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

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    // Fairy path — a smooth looping curve across the screen
    const fairyX = (t: number, w: number) =>
      w * (0.15 + 0.7 * (0.5 + 0.5 * Math.sin(t * 0.3)) * (0.5 + 0.5 * Math.cos(t * 0.17)));
    const fairyY = (t: number, h: number) =>
      h * (0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.23 + 1.2)) * (0.5 + 0.5 * Math.cos(t * 0.31 + 0.8)));

    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
    }

    const embers: Ember[] = [];
    const maxEmbers = 60;

    const spawnEmber = (w: number, h: number) => {
      const fx = fairyX(time, w);
      const fy = fairyY(time, h);
      embers.push({
        x: fx + (Math.random() - 0.5) * 30,
        y: fy + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        life: 0,
        maxLife: 80 + Math.random() * 80,
        size: Math.random() * 2.5 + 1,
        hue: 35 + Math.random() * 15,
      });
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // Spawn 1-2 embers per frame
      if (embers.length < maxEmbers) {
        spawnEmber(w, h);
        if (Math.random() > 0.5) spawnEmber(w, h);
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= 0.002; // gentle float up

        const progress = e.life / e.maxLife;
        // Fade in fast, glow, fade out slowly
        const alpha =
          progress < 0.15
            ? progress / 0.15
            : progress < 0.5
              ? 1
              : 1 - (progress - 0.5) / 0.5;

        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
          continue;
        }

        const glow = e.size * (1 + (1 - progress) * 2);

        // Outer glow
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glow * 3);
        grad.addColorStop(0, `hsla(${e.hue}, 80%, 60%, ${alpha * 0.3})`);
        grad.addColorStop(1, `hsla(${e.hue}, 80%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, glow * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core ember
        ctx.fillStyle = `hsla(${e.hue}, 90%, 70%, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
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
      style={{ opacity: 0.7 }}
    />
  );
};

export default EmberTrail;
