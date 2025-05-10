
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudyTimerProvider } from "@/contexts/StudyTimerContext";
import { FloatingTimer } from "@/components/study/FloatingTimer";
import { useStudyTimer } from "@/contexts/StudyTimerContext";
import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Index from "./pages/Index";
import Search from "./pages/Search";
import AllLaws from "./pages/AllLaws";
import LawView from "./pages/LawView";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import { useSessionTracking } from "./hooks/useSessionTracking";

const queryClient = new QueryClient();

function AppWithProviders() {
  const { studyTimeMinutes, isActive, toggleTimer } = useStudyTimer();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return (
    <>
      {!isMobile && <Sidebar />}
      <div className={`min-h-screen ${!isMobile ? "ml-64" : ""} transition-all duration-300`}>
        {!isMobile && <Header />}
        
        <main className={`pt-20 px-4 pb-24 ${isMobile ? "pt-4" : ""}`}>
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pesquisa" element={<Search />} />
              <Route path="/leis" element={<AllLaws />} />
              <Route path="/lei/:lawName" element={<LawView />} />
              <Route path="/duvidas" element={<AIChat />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/anotacoes" element={<Notes />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/comunidade" element={<Community />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        
        {isMobile && <Footer />}
      </div>
      <FloatingTimer
        studyTimeMinutes={studyTimeMinutes}
        isActive={isActive}
        onToggle={toggleTimer}
      />
    </>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StudyTimerProvider>
            <AppWithProviders />
            <Toaster />
            <Sonner />
          </StudyTimerProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
