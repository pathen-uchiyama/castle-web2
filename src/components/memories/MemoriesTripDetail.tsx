import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SectionNav from "@/components/SectionNav";
import GhostVault from "./GhostVault";
import RestorationView from "./RestorationView";
import AudioEcho from "./AudioEcho";
import JoyBlueprint from "./JoyBlueprint";
import type { TripMemory } from "@/data/types";

const ease: [number, number, number, number] = [0.19, 1, 0.22, 1];

const tabs = [
  { id: "vault", label: "The Vault" },
  { id: "echoes", label: "Echoes" },
  { id: "joy", label: "Joy Report" },
];

interface MemoriesTripDetailProps {
  memory: TripMemory;
  allMemories: TripMemory[];
  onBack: () => void;
}

/**
 * Trip-specific memories view with sub-tabs: Vault, Echoes, Joy Report.
 * Each tab shows content scoped to this specific trip.
 */
const MemoriesTripDetail = ({ memory, allMemories, onBack }: MemoriesTripDetailProps) => {
  const [activeTab, setActiveTab] = useState("vault");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <>
      {/* Trip Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
        >
          {/* Back to hub */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Adventures
          </button>

          <p
            className="mb-4 uppercase tracking-[0.3em] text-muted-foreground"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.6875rem", fontWeight: 400 }}
          >
            {memory.date} · {memory.destination}
          </p>
          <h1 className="font-display text-5xl sm:text-7xl text-foreground leading-[1.02] mb-4">
            {memory.tripName}
          </h1>
          <div className="flex items-center gap-4">
            <p
              className="text-muted-foreground"
              style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.9375rem", letterSpacing: "-0.02em" }}
            >
              {memory.photoCount} photos
            </p>
            <div className="flex flex-wrap gap-2">
              {memory.highlights.map((h) => (
                <span
                  key={h}
                  className="px-3 py-1.5 border border-border bg-white text-muted-foreground"
                  style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sub-navigation */}
      <div
        className="border-b border-border px-4 sm:px-8 sticky top-16 z-30"
        style={{ backgroundColor: "#F9F7F2" }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id);
              setSelectedPhoto(null);
            }}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "vault" && !selectedPhoto && (
        <GhostVault
          tripMemories={[memory]}
          onSelectMemory={(tripId) => setSelectedPhoto(tripId)}
        />
      )}

      {activeTab === "vault" && selectedPhoto && (
        <RestorationView
          memory={memory}
          onBack={() => setSelectedPhoto(null)}
        />
      )}

      {activeTab === "echoes" && <AudioEcho />}

      {activeTab === "joy" && (
        <JoyBlueprint tripMemories={[memory]} />
      )}
    </>
  );
};

export default MemoriesTripDetail;
