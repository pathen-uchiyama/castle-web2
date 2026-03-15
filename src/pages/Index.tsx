import ExperienceCard from "@/components/ExperienceCard";
import CollectionHeader from "@/components/CollectionHeader";
import {
  GoldenAnchor, Compass, Book, Blueprint,
  Window, Carriage, Trunk, People, Gallery, Flame
} from "@/components/Icons";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

        {/* The Hearth */}
        <header className="w-full border-b-2 border-foreground pb-8 mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-accent">
              <GoldenAnchor className="w-8 h-8" />
            </div>
            <span className="label-text">Castle Companion</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-foreground leading-tight">
            Welcome, Patchen
          </h1>
          <p className="mt-4 text-sm text-muted max-w-xl">
            The realm is at rest. Your sovereign dashboard awaits your deliberation.
          </p>
        </header>

        {/* Collection: The Daily Pulse */}
        <CollectionHeader title="Collection I — The Daily Pulse" subtitle="Status, direction, and the day's horizon." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExperienceCard
            title="The Active Adventure"
            icon={<Flame />}
            colSpan="md:col-span-2"
          >
            <div className="space-y-3">
              <p className="label-text">Current Objective</p>
              <p className="text-lg text-foreground font-display">
                Complete the Northern Expedition manifesto before the equinox gathering.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div>
                  <p className="label-text">Priority</p>
                  <p className="text-sm text-primary font-medium">Sovereign</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="label-text">Due</p>
                  <p className="text-sm text-foreground">March 21, 2026</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="label-text">Status</p>
                  <p className="text-sm text-foreground">In Progress</p>
                </div>
              </div>
            </div>
          </ExperienceCard>

          <ExperienceCard title="The Compass" icon={<Compass />}>
            <div className="space-y-4">
              <div>
                <p className="label-text">Current Heading</p>
                <p className="text-sm text-foreground truncate">
                  North-by-Northwest towards The Great Silence
                </p>
              </div>
              <div>
                <p className="label-text">Coordinates</p>
                <p className="text-sm text-foreground">51.5074° N, 0.1278° W</p>
              </div>
              <div>
                <p className="label-text">Conditions</p>
                <p className="text-sm text-foreground">Clear skies. Favorable winds.</p>
              </div>
            </div>
          </ExperienceCard>
        </div>

        {/* Collection: The Grand Plan */}
        <CollectionHeader title="Collection II — The Grand Plan" subtitle="Architecture of ambition, projected and measured." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExperienceCard title="The Intelligent Blueprint" icon={<Blueprint />}>
            <div className="space-y-3">
              <p className="label-text">Grand Plan Progress</p>
              <div className="w-full h-2 bg-secondary border border-border">
                <div className="h-full bg-primary" style={{ width: "47.2%" }} />
              </div>
              <p className="text-sm text-foreground">47.2% of the Grand Plan realized.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted truncate mr-2">Foundation Phase</span>
                  <span className="text-foreground">Complete</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted truncate mr-2">Expansion Phase</span>
                  <span className="text-primary">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted truncate mr-2">Sovereignty Phase</span>
                  <span className="text-muted">Pending</span>
                </div>
              </div>
            </div>
          </ExperienceCard>

          <ExperienceCard title="The Magic Window" icon={<Window />}>
            <div className="space-y-3">
              <p className="label-text">Forecast</p>
              <p className="text-sm text-foreground">
                Current trajectory suggests full realization by Q4 2027.
              </p>
              <div className="mt-4 border border-border p-4">
                <p className="label-text mb-2">Key Metrics</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Revenue</span>
                    <span className="text-foreground">£142,800</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Ventures</span>
                    <span className="text-foreground">7 active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Risk Index</span>
                    <span className="text-primary">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </ExperienceCard>

          <ExperienceCard title="The Royal Carriage" icon={<Carriage />}>
            <div className="space-y-3">
              <p className="label-text">Transport & Logistics</p>
              <div className="space-y-3 mt-2">
                {[
                  { route: "London → Edinburgh", date: "Mar 18", status: "Confirmed" },
                  { route: "Edinburgh → Inverness", date: "Mar 22", status: "Pending" },
                  { route: "Inverness → London", date: "Mar 28", status: "Unbooked" },
                ].map((trip) => (
                  <div key={trip.route} className="border border-border p-3">
                    <p className="text-sm text-foreground truncate">{trip.route}</p>
                    <div className="flex justify-between mt-1">
                      <span className="label-text">{trip.date}</span>
                      <span className="text-xs text-primary">{trip.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ExperienceCard>
        </div>

        {/* Collection: The Field Kit */}
        <CollectionHeader title="Collection III — The Field Kit" subtitle="Notes, provisions, and trusted allies." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExperienceCard title="The Library of Whispers" icon={<Book />}>
            <div className="space-y-3">
              <p className="label-text">Recent Notes</p>
              {[
                { title: "On the nature of patience", date: "Mar 14" },
                { title: "Letter to the Northern Guild", date: "Mar 12" },
                { title: "Observations at the harbor", date: "Mar 9" },
              ].map((note) => (
                <div
                  key={note.title}
                  className="border border-border p-3 cursor-pointer transition-colors hover:border-foreground"
                >
                  <p className="text-sm text-foreground truncate">{note.title}</p>
                  <p className="label-text mt-1">{note.date}</p>
                </div>
              ))}
              <p className="text-xs text-muted mt-2 italic">Waiting for the ink to dry.</p>
            </div>
          </ExperienceCard>

          <ExperienceCard title="The Traveler's Trunk" icon={<Trunk />}>
            <div className="space-y-3">
              <p className="label-text">Provisions</p>
              <div className="space-y-2">
                {[
                  { item: "Passport & documents", status: "Packed" },
                  { item: "Field journal (leather-bound)", status: "Packed" },
                  { item: "Cartographic instruments", status: "Pending" },
                  { item: "Correspondence kit", status: "Packed" },
                  { item: "Emergency provisions", status: "Review" },
                ].map((p) => (
                  <div key={p.item} className="flex justify-between text-sm">
                    <span className="text-foreground truncate mr-2">{p.item}</span>
                    <span className={`shrink-0 ${p.status === "Packed" ? "text-primary" : "text-muted"}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ExperienceCard>

          <ExperienceCard title="The Inner Circle" icon={<People />}>
            <div className="space-y-3">
              <p className="label-text">Trusted Allies</p>
              <div className="space-y-3">
                {[
                  { name: "Lord Whitfield", role: "Counsel", status: "Available" },
                  { name: "Dame Ashworth", role: "Navigator", status: "On Expedition" },
                  { name: "Sir Pemberton", role: "Quartermaster", status: "Available" },
                ].map((ally) => (
                  <div key={ally.name} className="border border-border p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-foreground">{ally.name}</p>
                        <p className="label-text mt-0.5">{ally.role}</p>
                      </div>
                      <span className={`text-xs ${ally.status === "Available" ? "text-primary" : "text-muted"}`}>
                        {ally.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ExperienceCard>
        </div>

        {/* Collection: The Keepsake */}
        <CollectionHeader title="Collection IV — The Keepsake" subtitle="Moments preserved in perpetuity." />
        <div className="grid grid-cols-1 gap-6">
          <ExperienceCard title="The Digital Gallery" icon={<Gallery />} colSpan="col-span-1">
            <div className="space-y-3">
              <p className="label-text">Recent Acquisitions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { title: "Dawn at Hadrian's Wall", date: "Feb 2026" },
                  { title: "The Chartroom, Evening", date: "Jan 2026" },
                  { title: "First Snow at the Estate", date: "Dec 2025" },
                  { title: "The Boathouse, Low Tide", date: "Nov 2025" },
                ].map((img) => (
                  <div key={img.title} className="border border-border p-4">
                    <div className="w-full aspect-square bg-secondary border border-border mb-3 flex items-center justify-center">
                      <span className="label-text text-center px-2">{img.title}</span>
                    </div>
                    <p className="text-sm text-foreground truncate">{img.title}</p>
                    <p className="label-text mt-0.5">{img.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </ExperienceCard>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <GoldenAnchor className="w-4 h-4 text-accent" />
              <span className="label-text">Castle Companion — Sovereign Operating System</span>
            </div>
            <span className="label-text">MMXXVI</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
