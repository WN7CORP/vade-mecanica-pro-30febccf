
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
          .limit(20);

        if (error) throw error;
        
        // Adicionar posição formatada ao ranking
        return data.map((user, index) => ({
          ...user,
          position: index + 1
        }));
      } catch (error) {
        console.error("Erro ao buscar rankings:", error);
        return [];
      }
    },
    refetchInterval: 30000 // Recarregar a cada 30 segundos para manter atualizado
  });
}
