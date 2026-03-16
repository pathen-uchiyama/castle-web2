import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "@/components/Footer";
import MemoriesHub from "@/components/memories/MemoriesHub";
import MemoriesTripDetail from "@/components/memories/MemoriesTripDetail";
import type { TripMemory } from "@/data/types";

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const Memories = ({ tripMemories }: MemoriesProps) => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [captureConsented, setCaptureConsented] = useState(() => {
    return localStorage.getItem("castle-capture-consent") === "true";
  });

  const handleConsent = (agreed: boolean) => {
    setCaptureConsented(agreed);
    localStorage.setItem("castle-capture-consent", String(agreed));
  };

  const selectedTrip = tripId ? tripMemories.find((m) => m.tripId === tripId) : null;

  // Mock: Legacy user with 0 credits remaining (triggers Sovereign Bridge)
  const creditsRemaining = 0;
  const totalCredits = 5;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "#F9F7F2" }}>
      {selectedTrip ? (
        <MemoriesTripDetail
          memory={selectedTrip}
          allMemories={tripMemories}
          onBack={() => navigate("/memories")}
        />
      ) : (
        <MemoriesHub
          tripMemories={tripMemories}
          captureConsented={captureConsented}
          onConsent={handleConsent}
          creditsRemaining={creditsRemaining}
          totalCredits={totalCredits}
          onSelectTrip={(id) => navigate(`/memories/${id}`)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Memories;
