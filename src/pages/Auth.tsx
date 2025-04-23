
import AuthForm from "@/components/auth/AuthForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check for authenticated session and admin status
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          setCheckingSession(false);
          return;
        }
        
        if (data.session) {
          // Special case for hardcoded admin email
          if (data.session.user.email === "wesleyhard@hotmail.com") {
            navigate("/admin");
          } else if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
        setCheckingSession(false);
      } catch (err) {
        console.error("Error in session check:", err);
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate, isAdmin]);

  // Show loading state while checking admin status and session
  if (isLoading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full flex flex-col lg:flex-row lg:max-w-5xl">
        {/* Lado esquerdo - Informações (visível apenas em desktop) */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center">
          <h1 className="text-4xl font-bold text-primary mb-6">
            Vade Mecânica Pro
          </h1>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Acesso Simplificado
              </h3>
              <p className="text-muted-foreground">
                Consulte a legislação de forma rápida e eficiente
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Sempre Atualizado
              </h3>
              <p className="text-muted-foreground">
                Conteúdo constantemente atualizado com as últimas alterações
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-primary-300">
                Interface Intuitiva
              </h3>
              <p className="text-muted-foreground">
                Navegue facilmente entre artigos e seções
              </p>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12">
          <AuthForm onLoginSuccess={(email) => {
            if (email === "wesleyhard@hotmail.com" || isAdmin) {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
