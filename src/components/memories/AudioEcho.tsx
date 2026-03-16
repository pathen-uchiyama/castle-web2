import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface AudioClip {
  id: string;
  title: string;
  location: string;
  duration: string;
  durationSeconds: number;
  date: string;
}

const mockClips: AudioClip[] = [
  { id: "aud-1", title: "Castle arrival — first gasp", location: "Main Street U.S.A.", duration: "0:23", durationSeconds: 23, date: "March 22" },
  { id: "aud-2", title: "Emma meets Cinderella", location: "Fantasyland", duration: "0:41", durationSeconds: 41, date: "March 23" },
  { id: "aud-3", title: "Post-fireworks family debrief", location: "Magic Kingdom Hub", duration: "1:12", durationSeconds: 72, date: "March 24" },
  { id: "aud-4", title: "Jack's first roller coaster scream", location: "Tomorrowland", duration: "0:08", durationSeconds: 8, date: "March 25" },
];

/**
 * Minimalist waveform cards for audio check-ins.
 * Burnished Gold (#947120) for active playback progress.
 */
const AudioEcho = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const intervalRef = useRef<number | null>(null);

  // Simulate playback progress
  const togglePlay = (clip: AudioClip) => {
    if (playingId === clip.id) {
      setPlayingId(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setPlayingId(clip.id);
    setProgress((p) => ({ ...p, [clip.id]: p[clip.id] || 0 }));

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        const current = p[clip.id] || 0;
        if (current >= 100) {
          setPlayingId(null);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return { ...p, [clip.id]: 0 };
        }
        return { ...p, [clip.id]: current + 100 / (clip.durationSeconds * 10) };
      });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Generate pseudo-random waveform bars
  const generateWaveform = (seed: string) => {
    const bars: number[] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 40; i++) {
      const val = Math.abs(Math.sin(hash * (i + 1) * 0.1)) * 0.7 + 0.3;
      bars.push(val);
    }
    return bars;
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <p
          className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
        >
          Echoes of the Realm
        </p>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">
          Audio Keepsakes
        </h2>
        <p
          className="text-muted-foreground mb-12 max-w-lg"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.875rem", letterSpacing: "-0.02em" }}
        >
          The sounds of your adventure — whispered reactions, delighted screams, and bedtime recaps.
        </p>

        <div className="space-y-3">
          {mockClips.map((clip, i) => {
            const bars = generateWaveform(clip.id);
            const isPlaying = playingId === clip.id;
            const pct = progress[clip.id] || 0;

            return (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06, ease }}
                className="bg-white p-5 sm:p-6 border border-border"
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              >
                <div className="flex items-center gap-4">
                  {/* Play button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePlay(clip)}
                    className="w-11 h-11 flex items-center justify-center shrink-0 border border-border hover:border-[#947120] transition-colors"
                    style={{ minHeight: 44, minWidth: 44 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-[#947120]" />
                    ) : (
                      <Play className="w-4 h-4 text-foreground ml-0.5" />
                    )}
                  </motion.button>

                  {/* Info + waveform */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h4 className="font-display text-base text-foreground truncate">{clip.title}</h4>
                      <span
                        className="text-muted-foreground shrink-0"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
                      >
                        {clip.duration}
                      </span>
                    </div>

                    {/* Waveform */}
                    <div className="flex items-end gap-[2px] h-6">
                      {bars.map((h, j) => {
                        const barPct = (j / bars.length) * 100;
                        const isActive = barPct <= pct;
                        return (
                          <div
                            key={j}
                            className="flex-1 transition-colors duration-150"
                            style={{
                              height: `${h * 100}%`,
                              backgroundColor: isActive ? "#947120" : "hsl(var(--border))",
                              minWidth: 2,
                            }}
                          />
                        );
                      })}
                    </div>

                    <p
                      className="text-muted-foreground mt-1"
                      style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "-0.02em" }}
                    >
                      {clip.location} · {clip.date}
                    </p>
                  </div>

                  {/* Speaker icon in serif style */}
                  <Volume2 className="w-4 h-4 text-muted-foreground/40 shrink-0 hidden sm:block" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AudioEcho;
