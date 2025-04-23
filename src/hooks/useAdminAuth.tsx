
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

        // Hard-coded admin check as temporary solution until proper admin table access is fixed
        // This avoids recursive RLS policy issues
        if (session.user.email === "wesleyhard@hotmail.com") {
          setIsAdmin(true);
          setAdminEmail(session.user.email);
        } else {
          // Still try the regular check but catch and handle errors
          try {
            const { data, error } = await supabase
              .from('admin_users')
              .select('is_super_admin, email')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error("Error checking admin status in database:", error);
              setIsAdmin(false);
              setAdminEmail(null);
            } else {
              setIsAdmin(!!data && data.is_super_admin);
              setAdminEmail(data?.email || null);
            }
          } catch (error) {
            console.error("Error in admin status check:", error);
            setIsAdmin(false);
            setAdminEmail(null);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setAdminEmail(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Set up listener for authentication state changes
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
