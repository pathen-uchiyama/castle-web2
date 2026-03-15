import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Adventure from "./pages/Adventure";
import Memories from "./pages/Memories";
import Circle from "./pages/Circle";
import Account from "./pages/Account";
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
          <Route
            path="/"
            element={
              <Index
                guestName={mockData.guestName}
                activeItinerary={mockData.activeItinerary}
                partyMembers={mockData.partyMembers}
                galleryImages={mockData.galleryImages}
                account={mockData.account}
              />
            }
          />
          <Route
            path="/adventure"
            element={<Adventure activeItinerary={mockData.activeItinerary} />}
          />
          <Route
            path="/memories"
            element={<Memories galleryImages={mockData.galleryImages} whispers={mockData.whispers} />}
          />
          <Route
            path="/circle"
            element={<Circle partyMembers={mockData.partyMembers} />}
          />
          <Route
            path="/account"
            element={<Account account={mockData.account} />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
