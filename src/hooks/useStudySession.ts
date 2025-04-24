
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudySession {
  id: string;
  theme: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  flashcards_viewed: number;
  flashcards_correct: number;
}

export function useStudySession() {
  const queryClient = useQueryClient();

  const startSession = useMutation({
    mutationFn: async (theme: string | undefined) => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id, // Add the required user_id field
          theme,
          flashcards_viewed: 0,
          flashcards_correct: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  const endSession = useMutation({
    mutationFn: async ({ 
      sessionId,
      flashcardsViewed,
      flashcardsCorrect 
    }: {
      sessionId: string;
      flashcardsViewed: number;
      flashcardsCorrect: number;
    }) => {
      const endTime = new Date();
      const { data: session } = await supabase
        .from('user_study_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

      if (!session) throw new Error('Session not found');

      const startTime = new Date(session.started_at);
      const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

      const { error } = await supabase
        .from('user_study_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration_seconds: durationSeconds,
          flashcards_viewed: flashcardsViewed,
          flashcards_correct: flashcardsCorrect
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
    }
  });

  return {
    startSession,
    endSession
  };
}
