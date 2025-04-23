
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface AdminHeaderProps {
  activeTab: string;
  onNavigateHome: () => void;
  adminEmail?: string | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, onNavigateHome, adminEmail }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do painel administrativo.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          {adminEmail && (
            <span className="text-sm bg-primary-foreground/20 px-2 py-1 rounded">
              {adminEmail}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onNavigateHome}>
            <Home className="h-5 w-5 text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto mt-2">
        <div className="text-sm text-white/80">
          <span className="font-medium">Área: </span>
          {activeTab === "dashboard" && "Dashboard"}
          {activeTab === "users" && "Gerenciamento de Usuários"}
          {activeTab === "moderation" && "Moderação de Conteúdo"}
          {activeTab === "messages" && "Mensagens"}
          {activeTab === "logs" && "Logs do Sistema"}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
