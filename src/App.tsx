import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudyTimerProvider } from "@/contexts/StudyTimerContext";
import { FloatingTimer } from "@/components/study/FloatingTimer";
import { useStudyTimer } from "@/contexts/StudyTimerContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import AllLaws from "./pages/AllLaws";
import LawView from "./pages/LawView";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";
import Notes from "./pages/Notes";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import { useSessionTracking } from "./hooks/useSessionTracking";

const queryClient = new QueryClient();

function AppWithProviders() {
  const { studyTimeMinutes, isActive, toggleTimer } = useStudyTimer();
  
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
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
      <FloatingTimer
        studyTimeMinutes={studyTimeMinutes}
        isActive={isActive}
        onToggle={toggleTimer}
      />
    </>
  );
}

const App = () => (
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

export default App;
