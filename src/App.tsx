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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
