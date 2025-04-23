
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const navigate = useNavigate();
  const { isAdmin, isLoading, adminEmail, error, retryAdminCheck } = useAdminAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    // Check session exists
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setSessionError("Sessão expirada. Por favor, faça login novamente.");
          toast({
            title: "Sessão expirada",
            description: "Você precisa fazer login novamente.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        if (!data.session) {
          setSessionError("Você precisa fazer login para acessar essa página.");
          toast({
            title: "Acesso restrito",
            description: "Faça login para continuar.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setSessionError("Erro ao verificar sessão. Por favor, tente novamente.");
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
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <Alert variant="destructive" className="border-red-500">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Erro ao verificar permissões</AlertTitle>
              <AlertDescription className="mt-2">
                {error}
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryAdminCheck} 
                className="mt-4 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tentar novamente</span>
              </Button>
            </Alert>
          </div>
        </div>
      );
    }
    
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader 
        activeTab={activeTab} 
        onNavigateHome={() => navigate("/")} 
        adminEmail={adminEmail}
        error={error}
        onRetry={retryAdminCheck}
      />
      
      <main className="flex-grow p-4 md:p-6 container max-w-7xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Erro nas permissões administrativas</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryAdminCheck} 
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Tentar novamente</span>
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
