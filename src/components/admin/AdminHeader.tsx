
import { LogOut, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AdminHeaderProps {
  activeTab: string;
  onNavigateHome: () => void;
}

const AdminHeader = ({ activeTab, onNavigateHome }: AdminHeaderProps) => {
  const handleLogout = async () => {
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'logout',
        details: { timestamp: new Date().toISOString() }
      });
      
      await supabase.auth.signOut();
      
      toast({
        title: "Logout realizado",
        description: "Você saiu do painel administrativo com sucesso",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="container max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldCheck size={28} />
          <h1 className="text-xl font-bold">
            Dashboard Administrativo {activeTab && `- ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onNavigateHome}
            className="flex items-center gap-1"
          >
            <Home size={18} />
            <span className="hidden md:inline">Início</span>
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
