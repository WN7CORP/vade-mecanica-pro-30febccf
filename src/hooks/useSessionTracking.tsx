
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSessionTracking() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Iniciar rastreamento ao montar o componente
  useEffect(() => {
    let isActive = true;
    
    const startTracking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !isActive) return;
        
        // Registrar início da sessão
        const { data, error } = await supabase
          .from('user_sessions')
          .insert({
            user_id: session.user.id,
            login_time: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (error) throw error;
        
        setSessionId(data.id);
        setStartTime(new Date());
        
      } catch (error) {
        console.error("Erro ao iniciar rastreamento de sessão:", error);
      }
    };
    
    startTracking();
    
    return () => {
      isActive = false;
    };
  }, []);
  
  // Finalizar rastreamento ao desmontar ou na mudança de página
  useEffect(() => {
    if (!sessionId || !startTime) return;
    
    // Função para finalizar a sessão
    const endSession = async () => {
      try {
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        
        await supabase
          .from('user_sessions')
          .update({
            logout_time: endTime.toISOString(),
            duration: durationSeconds
          })
          .eq('id', sessionId);
          
      } catch (error) {
        console.error("Erro ao finalizar rastreamento de sessão:", error);
      }
    };
    
    // Eventos para detectar saída da página
    const handleBeforeUnload = () => {
      endSession();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [sessionId, startTime]);
}
