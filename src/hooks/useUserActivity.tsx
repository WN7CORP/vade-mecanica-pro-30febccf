
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface ActivityData {
  name: string;
  points: number;
}

const dayNames = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sab"
};

export function useUserActivity(userId: string | undefined) {
  // Função para registrar a atividade do usuário - cada ação vale 10 pontos
  const logUserActivity = async (actionType: string, lawName?: string, articleNumber?: string) => {
    if (!userId) return;
    
    try {
      // Registrar a atividade na tabela de estatísticas
      await supabase.from('user_statistics').insert({
        user_id: userId,
        action_type: actionType,
        law_name: lawName,
        article_number: articleNumber
      });
      
      // Atualizar os pontos do usuário (+10 por ação)
      const { error: pointsError } = await supabase.from('user_profiles').update({
        points: supabase.rpc('increment', { x: 10 })
      }).eq('id', userId);
      
      if (pointsError) throw pointsError;
      
      const { error: activityError } = await supabase.from('user_profiles').update({
        activity_points: supabase.rpc('increment', { x: 10 })
      }).eq('id', userId);
      
      if (activityError) throw activityError;
      
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);
    }
  };

  return {
    activityData: useQuery({
      queryKey: ['user-activity', userId],
      queryFn: async (): Promise<ActivityData[]> => {
        if (!userId) return [];
        
        const { data, error } = await supabase
          .from('user_weekly_activity')
          .select('activity_day, action_count')
          .eq('user_id', userId);

        if (error) throw error;

        const activityMap = new Map<string, number>();
        
        // Initialize all days of the week with 0
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          activityMap.set(dayNames[date.getDay() as keyof typeof dayNames], 0);
        }

        // Update with actual data
        data.forEach(activity => {
          const date = new Date(activity.activity_day);
          const dayName = dayNames[date.getDay() as keyof typeof dayNames];
          activityMap.set(dayName, activity.action_count * 10); // Multiply by 10 for visual effect
        });

        return Array.from(activityMap.entries()).map(([name, points]) => ({
          name,
          points
        })).reverse();
      },
      enabled: !!userId
    }),
    logUserActivity
  };
}
