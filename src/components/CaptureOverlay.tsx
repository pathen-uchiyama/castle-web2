import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { X, Mic, Camera, FileText, Square, Save } from "lucide-react";
import { toast } from "sonner";

interface CaptureOverlayProps {
  open: boolean;
  onClose: () => void;
}

type CaptureMode = null | "voice" | "photo" | "note";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

/* ── Voice Memo ────────────────────────────────────────────────── */
const VoiceMemoCapture = ({ onSave }: { onSave: () => void }) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      {/* Recording area */}
      <div className="flex flex-col items-center gap-4 py-4">
        {!audioUrl ? (
          <>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                recording
                  ? "bg-destructive/10 border-2 border-destructive shadow-[0_0_24px_rgba(239,68,68,0.25)]"
                  : "bg-[hsl(var(--ink))]/5 border-2 border-[hsl(var(--border))] hover:border-[hsl(var(--ink))]/30"
              }`}
            >
              {recording ? (
                <Square className="w-6 h-6 text-destructive fill-destructive" />
              ) : (
                <Mic className="w-7 h-7 text-[hsl(var(--ink))]" />
              )}
            </button>
            {recording && (
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="font-display text-lg text-[hsl(var(--ink))] font-bold tabular-nums">{fmt(elapsed)}</span>
              </div>
            )}
            {!recording && (
              <p className="text-sm text-[hsl(var(--ink-light))] font-sans" style={{ letterSpacing: "-0.02em" }}>
                Tap to start recording
              </p>
            )}
          </>
        ) : (
          <>
            {/* Waveform preview placeholder */}
            <div className="w-full h-14 rounded-xl bg-[hsl(var(--ink))]/[0.03] border border-[hsl(var(--border))] flex items-center justify-center gap-1 px-4 overflow-hidden">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-[hsl(var(--gold))]"
                  style={{ height: `${8 + Math.random() * 30}px`, opacity: 0.4 + Math.random() * 0.6 }}
                />
              ))}
            </div>
            <span className="text-xs text-[hsl(var(--ink-light))] font-sans">{fmt(elapsed)} recorded</span>
          </>
        )}
      </div>

      {/* Label */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="What just happened?"
        className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--warm))] px-4 py-3 font-sans text-sm text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-light))]/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors rounded-xl"
      />

      {/* Save */}
      {audioUrl && (
        <button
          onClick={() => { console.log("[CaptureOverlay] Voice memo saved", { label, audioUrl }); onSave(); }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--ink))] text-white font-display text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> Save Voice Memo
        </button>
      )}
    </div>
  );
};

/* ── Photo Capture ─────────────────────────────────────────────── */
const PhotoCapture = ({ onSave }: { onSave: () => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      {!preview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-44 rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--warm))] flex flex-col items-center justify-center gap-3 hover:border-[hsl(var(--gold))]/50 transition-colors"
        >
          <Camera className="w-10 h-10 text-[hsl(var(--ink-light))]/40" />
          <span className="text-sm text-[hsl(var(--ink-light))] font-sans" style={{ letterSpacing: "-0.02em" }}>
            Tap to take a photo or choose one
          </span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="Captured" className="w-full h-44 object-cover" />
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption..."
        className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--warm))] px-4 py-3 font-sans text-sm text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-light))]/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors rounded-xl"
      />

      {preview && (
        <button
          onClick={() => { console.log("[CaptureOverlay] Photo saved", { caption, preview: preview.slice(0, 50) }); onSave(); }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--ink))] text-white font-display text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> Save Photo
        </button>
      )}
    </div>
  );
};

/* ── Ghost Note ────────────────────────────────────────────────── */
const GhostNoteCapture = ({ onSave }: { onSave: () => void }) => {
  const [text, setText] = useState("");
  const MAX = 500;

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="Capture this moment in words..."
          rows={5}
          className="w-full border border-[hsl(var(--border))] bg-[hsl(var(--warm))] px-4 py-3 font-sans text-sm text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-light))]/40 focus:outline-none focus:border-[hsl(var(--gold))] transition-colors resize-none rounded-xl"
        />
        <span className="absolute bottom-3 right-3 text-[0.625rem] text-[hsl(var(--ink-light))]/40 font-sans tabular-nums">
          {text.length}/{MAX}
        </span>
      </div>

      {text.trim().length > 0 && (
        <button
          onClick={() => { console.log("[CaptureOverlay] Ghost note saved", { text }); onSave(); }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--ink))] text-white font-display text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" /> Save Note
        </button>
      )}
    </div>
  );
};

/* ── Main Overlay ──────────────────────────────────────────────── */
const CaptureOverlay = ({ open, onClose }: CaptureOverlayProps) => {
  const [mode, setMode] = useState<CaptureMode>(null);

  const handleSave = () => {
    toast.success("✨ Moment captured.");
    setMode(null);
    onClose();
  };

  // Reset on close
  useEffect(() => { if (!open) setMode(null); }, [open]);

  const modes: { id: CaptureMode; emoji: string; label: string }[] = [
    { id: "voice", emoji: "🎤", label: "Voice Memo" },
    { id: "photo", emoji: "📸", label: "Photo" },
    { id: "note", emoji: "📝", label: "Ghost Note" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => { setMode(null); onClose(); }}
            className="fixed inset-0 z-[60] bg-[hsl(var(--ink))]/80 backdrop-blur-sm"
          />

          {/* Content sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[61] h-[100dvh] sm:h-auto sm:max-h-[60vh] overflow-y-auto"
          >
            <div
              className="bg-[hsl(var(--warm))] border-t border-[hsl(var(--border))]"
              style={{ borderTopLeftRadius: "1.25rem", borderTopRightRadius: "1.25rem" }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[hsl(var(--ink))]/10" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <h2 className="font-display text-xl text-[hsl(var(--ink))] font-bold">Capture a Moment</h2>
                <button
                  onClick={() => { setMode(null); onClose(); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[hsl(var(--ink-light))] hover:text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))]/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-8">
                <AnimatePresence mode="wait">
                  {!mode ? (
                    /* Mode selector */
                    <motion.div
                      key="selector"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {modes.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMode(m.id)}
                          className="flex flex-col items-center gap-3 py-6 px-3 bg-white border border-[hsl(var(--border))] hover:border-[hsl(var(--gold))]/40 hover:shadow-[0_10px_30px_rgba(26,26,27,0.06)] transition-all duration-300 rounded-xl"
                        >
                          <span className="text-3xl">{m.emoji}</span>
                          <span className="font-display text-sm text-[hsl(var(--ink))] font-medium">{m.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    /* Active capture mode */
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease }}
                    >
                      {/* Back button */}
                      <button
                        onClick={() => setMode(null)}
                        className="mb-4 text-[0.6875rem] uppercase tracking-[0.12em] text-[hsl(var(--gold-dark))] font-medium hover:text-[hsl(var(--ink))] transition-colors"
                      >
                        ← Back
                      </button>

                      {mode === "voice" && <VoiceMemoCapture onSave={handleSave} />}
                      {mode === "photo" && <PhotoCapture onSave={handleSave} />}
                      {mode === "note" && <GhostNoteCapture onSave={handleSave} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CaptureOverlay;
