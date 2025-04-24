
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import StudyMode from "./pages/StudyMode"; // Nova página
import LegalTimeline from "./pages/LegalTimeline"; // Nova página
import { useSessionTracking } from "./hooks/useSessionTracking";

const queryClient = new QueryClient();

function AppContent() {
  useSessionTracking();
  
  return (
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
      <Route path="/estudar/:lawName" element={<StudyMode />} />
      <Route path="/timeline/:lawName" element={<LegalTimeline />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
