
import { Search, Book, Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const isSearchPage = location.pathname === "/pesquisa";
  const isAllLawsPage = location.pathname === "/leis";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Desconectado com sucesso",
        description: "Você foi desconectado da sua conta."
      });
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast({
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao tentar desconectar da sua conta.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-screen-md mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="font-bold text-primary text-xl"
          >
            <Book className="h-5 w-5 mr-1" />
            VM Pro
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/perfil")}
            className="text-primary-300"
          >
            <User className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-primary-300"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
