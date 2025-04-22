
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Ranking {
  id: string;
  full_name: string | null;
  total_points: number | null;
  rank_score: number | null;
  activity_points: number | null;
  global_rank: number | null;
  position?: number;
  streak_points?: number | null;
  streak_change?: number | null;
}

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: async (): Promise<Ranking[]> => {
      try {
        const { data, error } = await supabase
          .from('user_rankings')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(100);

        if (error) throw error;
        
        // Adicionar posição formatada ao ranking e valores de exemplo para streak
        return data.map((user, index) => ({
          ...user,
          position: index + 1,
          streak_points: user.activity_points || 0,
          // Simulação de mudança de streak (para demonstração)
          streak_change: Math.random() > 0.8 ? -5 : null
        }));
      } catch (error) {
        console.error("Erro ao buscar rankings:", error);
        return [];
      }
    },
    refetchInterval: 30000 // Recarregar a cada 30 segundos para manter atualizado
  });
}

// Hook para registrar login e calcular pontos de streak
export function useLoginStreak(userId: string | undefined) {
  const recordLogin = async () => {
    if (!userId) return;
    
    try {
      // Verificar último login
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('created_at, action_type')
        .eq('user_id', userId)
        .eq('action_type', 'login')
        .order('created_at', { ascending: false })
        .limit(1);
        
      const lastLogin = statsData && statsData.length > 0 ? new Date(statsData[0].created_at) : null;
      const today = new Date();
      
      // Verificar se já fez login hoje (mesmo dia)
      if (lastLogin && 
          lastLogin.getDate() === today.getDate() &&
          lastLogin.getMonth() === today.getMonth() &&
          lastLogin.getFullYear() === today.getFullYear()) {
        console.log("Usuário já fez login hoje");
        return;
      }
        
      // Registrar novo login
      await supabase.from('user_statistics').insert({
        user_id: userId,
        action_type: 'login'
      });
      
      // Atualizar pontos (+20 por login)
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('points, activity_points')
        .eq('id', userId)
        .single();
        
      if (!userData) return;
      
      await supabase
        .from('user_profiles')
        .update({ 
          points: (userData.points || 0) + 20,
          activity_points: (userData.activity_points || 0) + 20
        })
        .eq('id', userId);
        
      console.log("Login registrado: +20 pontos");
    } catch (error) {
      console.error("Erro ao registrar login:", error);
    }
  };
  
  const calculateStreakLoss = async () => {
    if (!userId) return;
    
    try {
      // Buscar último login
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('created_at')
        .eq('user_id', userId)
        .eq('action_type', 'login')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (!statsData || statsData.length === 0) return;
      
      const lastLogin = new Date(statsData[0].created_at);
      const today = new Date();
      
      // Calcular diferença em dias
      const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Se mais de 1 dia sem login, aplicar penalidade
      if (diffDays > 1) {
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('points, activity_points')
          .eq('id', userId)
          .single();
          
        if (!userData) return;
        
        // Perda de pontos: -5 por dia de inatividade (máximo de -15)
        const lossPoints = Math.min(diffDays * 5, 15);
        
        await supabase
          .from('user_profiles')
          .update({ 
            points: Math.max((userData.points || 0) - lossPoints, 0),
            activity_points: Math.max((userData.activity_points || 0) - lossPoints, 0),
          })
          .eq('id', userId);
          
        console.log(`Penalidade por inatividade: -${lossPoints} pontos`);
      }
    } catch (error) {
      console.error("Erro ao calcular perda de streak:", error);
    }
  };
  
  return {
    recordLogin,
    calculateStreakLoss
  };
}

// Hook para buscar a posição do usuário atual no ranking
export function useUserRank(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-rank', userId],
    queryFn: async (): Promise<number | null> => {
      if (!userId) return null;
      
      try {
        // Fix: Use proper RPC call with correct typing
        const { data, error } = await supabase
          .rpc('get_user_rank', { user_id: userId });
          
        if (error) {
          console.error("Error fetching user rank:", error);
          throw error;
        }
        
        // The RPC function should return a number directly
        return data as number;
      } catch (error) {
        console.error("Erro ao buscar posição do usuário:", error);
        return null;
      }
    },
    enabled: !!userId
  });
}
