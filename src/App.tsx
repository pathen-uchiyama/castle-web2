import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import DayZeroIndex from "./pages/DayZeroIndex";
import TripsHub from "./pages/TripsHub";
import TripDetail from "./pages/TripDetail";
import Survey from "./pages/Survey";
import Memories from "./pages/Memories";
import Circle from "./pages/Circle";
import Account from "./pages/Account";
import ParkGuidePage from "./pages/ParkGuide";
import GuidesLanding from "./pages/GuidesLanding";
import ResortHub from "./pages/ResortHub";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PrivacyCa from "./pages/PrivacyCa";
import DoNotSell from "./pages/DoNotSell";
import NotFound from "./pages/NotFound";
import { mockData } from "./data/mockData";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
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
          <Route path="/adventure" element={<TripsHub bookedTrip={mockData.bookedTrip} futureTrips={mockData.futureTrips} />} />
          <Route path="/trip/:tripId" element={<TripDetail bookedTrip={mockData.bookedTrip} futureTrips={mockData.futureTrips} />} />
          <Route path="/survey/:tripId/:memberId" element={<Survey />} />
          <Route path="/memories" element={<Memories tripMemories={mockData.tripMemories} />} />
          <Route path="/memories/:tripId" element={<Memories tripMemories={mockData.tripMemories} />} />
          <Route path="/circle" element={<Circle partyMembers={mockData.partyMembers} guestName={mockData.guestName} />} />
          <Route path="/account" element={<Account account={mockData.account} />} />
          <Route path="/guides" element={<GuidesLanding />} />
          <Route path="/parks/:parkId" element={<ParkGuidePage parkGuides={mockData.parkGuides} />} />
          <Route path="/resort/:resortId" element={<ResortHub />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/privacy-ca" element={<PrivacyCa />} />
          <Route path="/do-not-sell" element={<DoNotSell />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
