import { motion } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, Play, Pause } from "lucide-react";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface AudioClip {
  id: string;
  title: string;
  location: string;
  day: string;
  time: string;
  durationSeconds: number;
}

const mockClips: AudioClip[] = [
  { id: "aud-1", title: "First gasp at the castle", location: "Magic Kingdom", day: "Day 1", time: "8:15 AM", durationSeconds: 15 },
  { id: "aud-2", title: "Emma meets Cinderella", location: "Magic Kingdom", day: "Day 2", time: "10:42 AM", durationSeconds: 30 },
  { id: "aud-3", title: "Post-fireworks family debrief", location: "Magic Kingdom", day: "Day 3", time: "9:48 PM", durationSeconds: 47 },
  { id: "aud-4", title: "Jack's first roller coaster scream", location: "Magic Kingdom", day: "Day 4", time: "2:15 PM", durationSeconds: 8 },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/** Generate a silent WAV blob of N seconds at 8000Hz mono */
const createSilentBlob = (seconds: number): Blob => {
  const sampleRate = 8000;
  const numSamples = sampleRate * seconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);
  return new Blob([buffer], { type: "audio/wav" });
};

/** Generate pseudo-random waveform bars from a seed string */
const generateWaveform = (seed: string, count = 50) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(Math.abs(Math.sin(hash * (i + 1) * 0.1)) * 0.7 + 0.3);
  }
  return bars;
};

const AudioEcho = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTimes, setCurrentTimes] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const urlRefs = useRef<Record<string, string>>({});
  const rafRef = useRef<number | null>(null);

  // Create audio elements on mount
  useEffect(() => {
    mockClips.forEach((clip) => {
      const blob = createSilentBlob(clip.durationSeconds);
      const url = URL.createObjectURL(blob);
      urlRefs.current[clip.id] = url;
      const audio = new Audio(url);
      audio.preload = "auto";
      audioRefs.current[clip.id] = audio;
    });
    return () => {
      Object.values(urlRefs.current).forEach(URL.revokeObjectURL);
      Object.values(audioRefs.current).forEach((a) => { a.pause(); a.src = ""; });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // RAF loop for smooth time updates
  const tick = useCallback(() => {
    const updates: Record<string, number> = {};
    let anyPlaying = false;
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (!audio.paused) {
        updates[id] = audio.currentTime;
        anyPlaying = true;
      }
    });
    if (Object.keys(updates).length) {
      setCurrentTimes((prev) => ({ ...prev, ...updates }));
    }
    // Check if finished
    if (playingId) {
      const a = audioRefs.current[playingId];
      if (a && a.ended) {
        setPlayingId(null);
      }
    }
    if (anyPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [playingId]);

  useEffect(() => {
    if (playingId) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playingId, tick]);

  const togglePlay = (clipId: string) => {
    // Pause any currently playing
    if (playingId && playingId !== clipId) {
      audioRefs.current[playingId]?.pause();
    }

    const audio = audioRefs.current[clipId];
    if (!audio) return;

    if (playingId === clipId) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.play();
      setPlayingId(clipId);
    }
  };

  const scrub = (clipId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRefs.current[clipId];
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setCurrentTimes((prev) => ({ ...prev, [clipId]: audio.currentTime }));
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <p
          className="mb-2 uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
        >
          Family Journal
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

        {mockClips.length === 0 ? (
          <EmptyState
            emoji="🎤"
            headline="No voice memos yet."
            description="No voice memos captured on this trip. Next time, tap the Golden Anchor to record a moment."
          />
        ) : (
        <div className="space-y-3">
          {mockClips.map((clip, i) => {
            const bars = generateWaveform(clip.id);
            const isPlaying = playingId === clip.id;
            const ct = currentTimes[clip.id] || 0;
            const pct = clip.durationSeconds > 0 ? (ct / clip.durationSeconds) * 100 : 0;

            return (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06, ease }}
                className="bg-card p-5 sm:p-6 border border-border rounded-lg"
                style={{ boxShadow: "0 10px 30px rgba(26,26,27,0.05)" }}
              >
                {/* Title + timestamp */}
                <div className="flex items-baseline justify-between mb-3">
                  <h4 className="font-display text-base text-foreground">{clip.title}</h4>
                  <span
                    className="text-muted-foreground shrink-0 ml-3"
                    style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem", letterSpacing: "-0.02em" }}
                  >
                    {clip.day} · {clip.time} · {clip.location}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Play/Pause button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePlay(clip.id)}
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300"
                    style={{
                      minHeight: 44, minWidth: 44,
                      borderColor: isPlaying ? "hsl(var(--gold))" : "hsl(var(--border))",
                      backgroundColor: isPlaying ? "hsl(var(--gold) / 0.08)" : "transparent",
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-[hsl(var(--gold-dark))]" />
                    ) : (
                      <Play className="w-4 h-4 text-foreground ml-0.5" />
                    )}
                  </motion.button>

                  {/* Waveform + scrubber */}
                  <div className="flex-1 min-w-0">
                    {/* Waveform bars — clickable for scrubbing */}
                    <div
                      className="flex items-end gap-[2px] h-8 cursor-pointer group"
                      onClick={(e) => scrub(clip.id, e)}
                    >
                      {bars.map((h, j) => {
                        const barPct = (j / bars.length) * 100;
                        const isActive = barPct <= pct;
                        return (
                          <div
                            key={j}
                            className="flex-1 rounded-[1px] transition-colors duration-100"
                            style={{
                              height: `${h * 100}%`,
                              backgroundColor: isActive ? "hsl(var(--gold))" : "hsl(var(--border))",
                              minWidth: 2,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Progress bar + duration */}
                    <div className="flex items-center gap-3 mt-2">
                      <div
                        className="flex-1 h-1 rounded-full bg-border cursor-pointer relative overflow-hidden"
                        onClick={(e) => scrub(clip.id, e)}
                      >
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
                          style={{ width: `${pct}%`, backgroundColor: "hsl(var(--gold))" }}
                        />
                      </div>
                      <span
                        className="text-muted-foreground shrink-0 tabular-nums"
                        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.625rem" }}
                      >
                        {formatTime(ct)} / {formatTime(clip.durationSeconds)}
                      </span>
                    </div>
                  </div>

                  <Volume2 className="w-4 h-4 text-muted-foreground/40 shrink-0 hidden sm:block" />
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};

export default AudioEcho;
