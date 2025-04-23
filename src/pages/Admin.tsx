
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminDashboard from "@/components/admin/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import CommentModeration from "@/components/admin/CommentModeration";
import AdminMessages from "@/components/admin/AdminMessages";
import AdminLogs from "@/components/admin/AdminLogs";
import AdminLogin from "@/components/admin/AdminLogin";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('is_super_admin')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        // Se encontrou o usuário na tabela de admins, atualizar último login
        if (data) {
          await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id);
            
          // Registrar login no log de atividades
          await supabase.rpc('log_admin_action', {
            action_type: 'login',
            details: { timestamp: new Date().toISOString() }
          });
        }
        
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar suas permissões administrativas",
          variant: "destructive",
        });
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader activeTab={activeTab} onNavigateHome={() => navigate("/")} />
      
      <main className="flex-grow p-4 md:p-6 container max-w-7xl mx-auto">
        <Tabs 
          defaultValue="dashboard" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="moderation">Moderação</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="moderation">
            <CommentModeration />
          </TabsContent>
          
          <TabsContent value="messages">
            <AdminMessages />
          </TabsContent>
          
          <TabsContent value="logs">
            <AdminLogs />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
