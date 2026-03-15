import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import DayZeroIndex from "./pages/DayZeroIndex";
import Adventure from "./pages/Adventure";
import Survey from "./pages/Survey";
import Memories from "./pages/Memories";
import Circle from "./pages/Circle";
import Account from "./pages/Account";
import ParkGuidePage from "./pages/ParkGuide";
import NotFound from "./pages/NotFound";
import { mockData } from "./data/mockData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/welcome" element={<DayZeroIndex />} />
          <Route
            path="/"
            element={
              <Index
                guestName={mockData.guestName}
                bookedTrip={mockData.bookedTrip}
                futureTrips={mockData.futureTrips}
                parkGuides={mockData.parkGuides}
                partyMembers={mockData.partyMembers}
                tripMemories={mockData.tripMemories}
                account={mockData.account}
              />
            }
          />
          <Route path="/adventure" element={<Adventure bookedTrip={mockData.bookedTrip} />} />
          <Route path="/trip/:tripId" element={<Adventure bookedTrip={mockData.bookedTrip} />} />
          <Route path="/memories" element={<Memories tripMemories={mockData.tripMemories} />} />
          <Route path="/memories/:tripId" element={<Memories tripMemories={mockData.tripMemories} />} />
          <Route path="/circle" element={<Circle partyMembers={mockData.partyMembers} />} />
          <Route path="/account" element={<Account account={mockData.account} />} />
          <Route path="/parks/:parkId" element={<ParkGuidePage parkGuides={mockData.parkGuides} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
