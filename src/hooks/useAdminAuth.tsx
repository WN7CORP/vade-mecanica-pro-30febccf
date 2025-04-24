
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("[AdminAuth] No active session");
          setIsAdmin(false);
          setAdminEmail(null);
          setIsLoading(false);
          return;
        }

        // Hardcoded admin check as first fallback
        if (session.user.email === "wesleyhard@hotmail.com") {
          console.log("[AdminAuth] Hardcoded admin found:", session.user.email);
          setIsAdmin(true);
          setAdminEmail(session.user.email);
          setIsLoading(false);
          return;
        }

        // Try direct query to admin_users table as second fallback
        try {
          const { data: directAdminCheck, error: directError } = await supabase
            .from('admin_users')
            .select('email')
            .eq('id', session.user.id)
            .single();

          if (!directError && directAdminCheck) {
            console.log("[AdminAuth] Admin user found in table:", directAdminCheck.email);
            setIsAdmin(true);
            setAdminEmail(directAdminCheck.email);
            setIsLoading(false);
            return;
          }
        } catch (directCheckError) {
          console.log("[AdminAuth] Direct admin check failed:", directCheckError);
        }

        // Use the is_admin RPC function as final approach
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });
        
        if (error) {
          console.error("[AdminAuth] Error checking admin status:", error);
          setError(error.message);
          setIsAdmin(false);
          setAdminEmail(null);
        } else {
          console.log("[AdminAuth] RPC admin check result:", data);
          setIsAdmin(!!data);
          if (data) {
            setAdminEmail(session.user.email);
          } else {
            setAdminEmail(null);
          }
        }
      } catch (error: any) {
        console.error("[AdminAuth] Error in admin status check:", error);
        setError(error?.message || "Erro ao verificar status de administrador");
        setIsAdmin(false);
        setAdminEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Set up listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AdminAuth] Auth state changed:", event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setAdminEmail(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [retryCount]);
  
  const retryAdminCheck = () => {
    setRetryCount(prev => prev + 1);
  };

  return { isAdmin, isLoading, adminEmail, error, retryAdminCheck };
}
