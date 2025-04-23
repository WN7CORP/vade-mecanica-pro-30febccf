
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
          setAdminEmail(null);
          setIsLoading(false);
          return;
        }

        // Hard-coded admin check as temporary solution until proper admin table access is fixed
        // This avoids recursive RLS policy issues
        if (session.user.email === "wesleyhard@hotmail.com") {
          setIsAdmin(true);
          setAdminEmail(session.user.email);
          setIsLoading(false);
          return;
        }

        // Check admin status using the is_admin function we just created
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: session.user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          setAdminEmail(null);
        } else {
          setIsAdmin(!!data);
          if (data) {
            setAdminEmail(session.user.email);
          } else {
            setAdminEmail(null);
          }
        }
      } catch (error) {
        console.error("Error in admin status check:", error);
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
