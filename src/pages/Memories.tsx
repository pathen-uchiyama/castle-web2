import { useParams, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import MemoriesHub from "@/components/memories/MemoriesHub";
import MemoriesTripDetail from "@/components/memories/MemoriesTripDetail";
import EmptyState from "@/components/EmptyState";
import SparkleField from "@/components/SparkleField";
import type { TripMemory } from "@/data/types";

interface MemoriesProps {
  tripMemories: TripMemory[];
}

const Memories = ({ tripMemories }: MemoriesProps) => {
  const { tripId } = useParams();
  const navigate = useNavigate();

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
      ) : tripMemories.length === 0 ? (
        <div className="relative py-8">
          <SparkleField count={8} />
          <EmptyState
            emoji="📸"
            headline="Your Keepsake is empty."
            description="Memories will appear here after your first trip. Every photo, voice memo, and ghost note — preserved in heirloom quality."
            sparkle
          />
        </div>
      ) : (
        <MemoriesHub
          tripMemories={tripMemories}
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
