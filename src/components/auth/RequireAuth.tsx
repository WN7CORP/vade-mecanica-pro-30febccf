
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedFirstLogin, setHasCheckedFirstLogin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // For mobile, check if this is first time login
          if (isMobile) {
            const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
            if (!hasLoggedInBefore) {
              localStorage.setItem('intendedPath', location.pathname);
              navigate('/auth');
              return;
            }
          }
          
          // For desktop or returning mobile users
          if (location.pathname !== '/auth') {
            toast.error('Faça login para continuar');
            navigate('/auth', { state: { from: location.pathname } });
          }
          return;
        }

        // Mark as logged in for mobile users
        if (isMobile) {
          localStorage.setItem('hasLoggedInBefore', 'true');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Erro ao verificar autenticação');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          if (isMobile) {
            localStorage.setItem('hasLoggedInBefore', 'true');
            const intendedPath = localStorage.getItem('intendedPath');
            if (intendedPath) {
              localStorage.removeItem('intendedPath');
              navigate(intendedPath);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          navigate('/auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, isMobile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/auth') {
    return null;
  }

  return <>{children}</>;
};
