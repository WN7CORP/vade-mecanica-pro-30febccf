
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  totalArticlesViewed: number;
  totalExplanations: number;
  totalFavorites: number;
  totalNotes: number;
  points: number;
  rank: number;
}

export const recordUserAction = async (
  actionType: 'view' | 'explain' | 'favorite' | 'note' | 'narration',
  lawName?: string,
  articleNumber?: string
) => {
  const { error } = await supabase.from('user_statistics').insert({
    action_type: actionType,
    law_name: lawName,
    article_number: articleNumber
  });

  if (error) {
    console.error('Error recording user action:', error);
  }
};

export const getUserStats = async (): Promise<UserStats | null> => {
  const { data: stats, error: statsError } = await supabase
    .from('user_statistics')
    .select('action_type')
    .eq('user_id', supabase.auth.getUser());

  if (statsError) {
    console.error('Error fetching user stats:', statsError);
    return null;
  }

  const counts = {
    view: stats?.filter(s => s.action_type === 'view').length || 0,
    explain: stats?.filter(s => s.action_type === 'explain').length || 0,
    favorite: stats?.filter(s => s.action_type === 'favorite').length || 0,
    note: stats?.filter(s => s.action_type === 'note').length || 0
  };

  const points = (counts.view + counts.explain + counts.favorite + counts.note) * 10;

  // Get user rank
  const { data: ranking } = await supabase
    .rpc('get_user_ranking')
    .single();

  return {
    totalArticlesViewed: counts.view,
    totalExplanations: counts.explain,
    totalFavorites: counts.favorite,
    totalNotes: counts.note,
    points,
    rank: ranking?.rank || 0
  };
};
