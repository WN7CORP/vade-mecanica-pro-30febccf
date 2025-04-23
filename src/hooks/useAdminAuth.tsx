
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

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
          .select('is_super_admin, email')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Erro ao verificar status de admin:", error);
          setIsAdmin(false);
          setAdminEmail(null);
        } else {
          setIsAdmin(!!data);
          setAdminEmail(data?.email || null);
          
          // Se é admin, atualizar último login
          if (data) {
            await supabase
              .from('admin_users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        setIsAdmin(false);
        setAdminEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setAdminEmail(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading, adminEmail };
}
