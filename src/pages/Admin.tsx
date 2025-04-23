
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
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    // Check session exists
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Sessão expirada",
            description: "Você precisa fazer login novamente.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        if (!data.session) {
          navigate("/auth");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if user has admin privileges
  if (!isAdmin) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
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
