
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Ranking {
  id: string;
  full_name: string | null;
  total_points: number | null;
  rank_score: number | null;
  activity_points: number | null;
  global_rank: number | null;
}

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: async (): Promise<Ranking[]> => {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order('global_rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });
}
