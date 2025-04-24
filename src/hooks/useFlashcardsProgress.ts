
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  viewed_count: number;
  correct_count: number;
  last_viewed: string;
  proficiency_level: number;
  streak: number;
  theme: string;
}

export function useFlashcardsProgress(theme?: string) {
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['flashcard-progress', theme],
    queryFn: async () => {
      const query = supabase
        .from('user_flashcard_progress')
        .select('*');

      if (theme) {
        query.eq('theme', theme);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to ensure it matches the FlashcardProgress interface
      return (data || []).map(item => ({
        id: item.id,
        flashcard_id: item.flashcard_id,
        viewed_count: item.viewed_count || 0,
        correct_count: item.correct_count || 0,
        last_viewed: item.last_viewed || new Date().toISOString(),
        proficiency_level: item.proficiency_level || 0,
        streak: item.streak || 0,
        theme: item.theme || ''
      })) as FlashcardProgress[];
    }
  });

  const updateProgress = useMutation({
    mutationFn: async ({ 
      flashcardId, 
      correct,
      theme: cardTheme 
    }: { 
      flashcardId: string; 
      correct: boolean;
      theme?: string;
    }) => {
      const { data: existing } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            viewed_count: existing.viewed_count + 1,
            correct_count: existing.correct_count + (correct ? 1 : 0),
            streak: (existing.streak || 0) + (correct ? 1 : 0),
            proficiency_level: correct 
              ? Math.min((existing.proficiency_level || 0) + 1, 5)
              : Math.max((existing.proficiency_level || 0) - 1, 0),
            last_viewed: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create a new progress entry if none exists
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            flashcard_id: flashcardId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            viewed_count: 1,
            correct_count: correct ? 1 : 0,
            streak: correct ? 1 : 0,
            proficiency_level: correct ? 1 : 0,
            theme: cardTheme || theme || null
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-progress'] });
    }
  });

  return {
    progress,
    isLoading,
    updateProgress
  };
}
