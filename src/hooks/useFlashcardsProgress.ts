
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define the interface for raw database response
interface FlashcardProgressRaw {
  id: string;
  flashcard_id: string;
  viewed_count: number | null;
  correct_count: number | null;
  last_viewed: string | null;
  proficiency_level: number | null;
  streak: number | null;
  theme: string | null;
  user_id: string | null;
  created_at: string | null;
}

// Define the interface for normalized progress data
interface FlashcardProgress {
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
      
      // Transform the raw data into the expected format with default values for null fields
      return (data as FlashcardProgressRaw[] || []).map(row => ({
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
      } as FlashcardProgress));
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
        // Cast to FlashcardProgressRaw to handle potentially undefined fields
        const existingProgress = existing as FlashcardProgressRaw;
        
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            viewed_count: (existingProgress.viewed_count || 0) + 1,
            correct_count: (existingProgress.correct_count || 0) + (correct ? 1 : 0),
            streak: (existingProgress.streak || 0) + (correct ? 1 : 0),
            proficiency_level: correct 
              ? Math.min((existingProgress.proficiency_level || 0) + 1, 5)
              : Math.max((existingProgress.proficiency_level || 0) - 1, 0),
            last_viewed: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

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
