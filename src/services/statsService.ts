
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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn('No authenticated user found when recording action');
    return;
  }
  
  const { error } = await supabase.from('user_statistics').insert({
    user_id: user.id,
    action_type: actionType,
    law_name: lawName,
    article_number: articleNumber
  });

  if (error) {
    console.error('Error recording user action:', error);
  }
};

export const getUserStats = async (): Promise<UserStats | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn('No authenticated user found when getting stats');
    return null;
  }

  const { data: stats, error: statsError } = await supabase
    .from('user_statistics')
    .select('action_type')
    .eq('user_id', user.id);

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

  // Get user rank using a custom query instead of the rpc function
  // This avoids the type issues with the rpc function
  const { data: rankData, error: rankError } = await supabase
    .from('user_statistics')
    .select('user_id, count(*)')
    .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // last 30 days
    .group('user_id')
    .order('count', { ascending: false });

  if (rankError) {
    console.error('Error fetching user rank:', rankError);
    return null;
  }

  // Calculate the user's rank
  let userRank = 0;
  if (rankData) {
    const userIndex = rankData.findIndex(item => item.user_id === user.id);
    userRank = userIndex >= 0 ? userIndex + 1 : rankData.length + 1;
  }

  return {
    totalArticlesViewed: counts.view,
    totalExplanations: counts.explain,
    totalFavorites: counts.favorite,
    totalNotes: counts.note,
    points,
    rank: userRank
  };
};
