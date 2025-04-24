
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Simplified interface for flashcard progress with all possible fields
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

// Define what the database actually returns
interface DbFlashcardProgress {
  id: string;
  flashcard_id: string;
  viewed_count?: number;
  correct_count?: number;
  last_viewed?: string;
  user_id: string;
  created_at: string;
  // These fields might not exist in the current database schema
  proficiency_level?: number;
  streak?: number;
  theme?: string;
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
      
      // Map the raw data to our interface with default values for missing fields
      return (data || []).map((row): FlashcardProgress => ({
        id: row.id || '',
        flashcard_id: row.flashcard_id || '',
        viewed_count: row.viewed_count || 0,
        correct_count: row.correct_count || 0,
        last_viewed: row.last_viewed || new Date().toISOString(),
        proficiency_level: row.proficiency_level || 0,
        streak: row.streak || 0,
        theme: row.theme || '',
        user_id: row.user_id || '',
        created_at: row.created_at || new Date().toISOString()
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
      const { data: existingData } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .single();

      if (existingData) {
        // Handle case where fields might be missing in the database
        const existingStreak = (existingData as any).streak || 0;
        const existingProficiency = (existingData as any).proficiency_level || 0;

        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            viewed_count: (existingData.viewed_count || 0) + 1,
            correct_count: (existingData.correct_count || 0) + (correct ? 1 : 0),
            streak: existingStreak + (correct ? 1 : 0),
            proficiency_level: correct 
              ? Math.min(existingProficiency + 1, 5)
              : Math.max(existingProficiency - 1, 0),
            last_viewed: new Date().toISOString()
          })
          .eq('id', existingData.id);

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
