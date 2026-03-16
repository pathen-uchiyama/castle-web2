import { motion } from "framer-motion";
import { useState } from "react";
import Footer from "@/components/Footer";
import SectionNav from "@/components/SectionNav";
import KeepsakeNudge from "@/components/KeepsakeNudge";
import GhostVault from "@/components/memories/GhostVault";
import AudioEcho from "@/components/memories/AudioEcho";
import RestorationView from "@/components/memories/RestorationView";
import JoyBlueprint from "@/components/memories/JoyBlueprint";
import SovereignBridge from "@/components/memories/SovereignBridge";
import MemoriesCircle from "@/components/memories/MemoriesCircle";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const tabs = [
  { id: "vault", label: "The Vault" },
  { id: "echoes", label: "Echoes" },
  { id: "blueprint", label: "Joy Report" },
  { id: "circle", label: "Circle & Safety" },
];

const Memories = ({ tripMemories }: MemoriesProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [captureConsented, setCaptureConsented] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

  // Mock: Legacy user with 0 credits remaining (triggers Sovereign Bridge)
  const creditsRemaining = 0;
  const totalCredits = 5;

  const handleConsent = (agreed: boolean) => {
    setCaptureConsented(agreed);
    if (agreed && !nudgeDismissed) {
      setTimeout(() => setShowNudge(true), 1500);
    }
  };

  const handleSelectMemory = (tripId: string) => {
    setSelectedMemory(tripId);
  };

  const selectedTripMemory = tripMemories.find((m) => m.tripId === selectedMemory);

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "#F9F7F2" }}>
      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
        >
          <p
            className="mb-4 uppercase tracking-[0.3em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            Memories
          </p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
            The Ghost Vault.
          </h1>
          <p
            className="text-muted-foreground max-w-lg"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em", lineHeight: 1.7 }}
          >
            Every trip leaves behind a constellation of memories. We are not waiting for a server — we are witnessing a restoration.
          </p>
        </motion.div>
      </section>

      {/* Sub-navigation — sharp edges, parchment bg */}
      <div
        className="border-b border-border px-4 sm:px-8 sticky top-16 z-30"
        style={{ backgroundColor: "#F9F7F2" }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionNav tabs={tabs} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); setSelectedMemory(null); }} />
        </div>
      </div>

      {/* ═══ THE VAULT ═══ */}
      {activeTab === "vault" && !selectedMemory && (
        <GhostVault tripMemories={tripMemories} onSelectMemory={handleSelectMemory} />
      )}

      {/* ═══ RESTORATION DETAIL VIEW ═══ */}
      {activeTab === "vault" && selectedMemory && selectedTripMemory && (
        <RestorationView memory={selectedTripMemory} onBack={() => setSelectedMemory(null)} />
      )}

      {/* ═══ ECHOES (AUDIO) ═══ */}
      {activeTab === "echoes" && <AudioEcho />}

      {/* ═══ JOY BLUEPRINT ═══ */}
      {activeTab === "blueprint" && (
        <>
          <JoyBlueprint tripMemories={tripMemories} />
          <SovereignBridge creditsRemaining={creditsRemaining} totalCredits={totalCredits} />
        </>
      )}

      {/* ═══ CIRCLE & SAFETY ═══ */}
      {activeTab === "circle" && (
        <MemoriesCircle captureConsented={captureConsented} onConsent={handleConsent} />
      )}

      <Footer />

      {/* Keepsake Nudge overlay */}
      {showNudge && (
        <KeepsakeNudge
          trigger="Approaching Space Mountain — 15 min wait"
          onCapture={(type) => {
            console.log("Capture:", type);
            setShowNudge(false);
            setNudgeDismissed(true);
          }}
          onDismiss={() => {
            setShowNudge(false);
            setNudgeDismissed(true);
          }}
        />
      )}
    </div>
  );
};

export default Memories;
