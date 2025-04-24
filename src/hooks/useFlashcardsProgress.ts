
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  viewed_count: number;
  correct_count: number;
  last_viewed: string;
  proficiency_level: number;
  streak: number;
  theme: string;
  user_id: string;
  created_at: string;
}

interface DbFlashcardProgress {
  id: string;
  flashcard_id: string;
  viewed_count: number;
  correct_count: number;
  last_viewed: string;
  user_id: string;
  created_at: string;
  proficiency_level: number;
  streak: number;
  theme: string;
}

export function useFlashcardsProgress(theme?: string) {
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['flashcard-progress', theme],
    queryFn: async () => {
      let query = supabase
        .from('user_flashcard_progress')
        .select('*');

      if (theme) {
        query = query.eq('theme', theme);
      }

      const { data, error } = await query;
      if (error) throw error;

      const dbData = data as DbFlashcardProgress[];
      
      return dbData.map((row): FlashcardProgress => ({
        id: row.id,
        flashcard_id: row.flashcard_id,
        viewed_count: row.viewed_count,
        correct_count: row.correct_count,
        last_viewed: row.last_viewed,
        proficiency_level: row.proficiency_level || 0,
        streak: row.streak || 0,
        theme: row.theme || '',
        user_id: row.user_id,
        created_at: row.created_at
      }));
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data: existingData } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .single();

      if (existingData) {
        const existingRecord = existingData as DbFlashcardProgress;

        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            viewed_count: existingRecord.viewed_count + 1,
            correct_count: existingRecord.correct_count + (correct ? 1 : 0),
            streak: (existingRecord.streak || 0) + (correct ? 1 : 0),
            proficiency_level: correct 
              ? Math.min((existingRecord.proficiency_level || 0) + 1, 5)
              : Math.max((existingRecord.proficiency_level || 0) - 1, 0),
            last_viewed: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            flashcard_id: flashcardId,
            user_id: user.id,
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
