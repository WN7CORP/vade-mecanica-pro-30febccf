
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

// Define a simpler interface without deep nesting
interface RawDatabaseRow {
  id: string;
  flashcard_id: string;
  viewed_count: number | null;
  correct_count: number | null;
  last_viewed: string | null;
  proficiency_level: number | null;
  streak: number | null;
  theme: string | null;
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
      
      // Create a new array and explicitly construct each FlashcardProgress object
      const transformedData: FlashcardProgress[] = [];
      
      if (data) {
        // Use a simple assertion without complex type reasoning
        const rows = data as unknown[];
        
        for (const row of rows) {
          // Cast to access properties with a simpler type
          const item = row as Record<string, any>;
          
          transformedData.push({
            id: item.id as string,
            flashcard_id: item.flashcard_id as string,
            viewed_count: (item.viewed_count as number) ?? 0,
            correct_count: (item.correct_count as number) ?? 0,
            last_viewed: (item.last_viewed as string) ?? new Date().toISOString(),
            proficiency_level: (item.proficiency_level as number) ?? 0,
            streak: (item.streak as number) ?? 0,
            theme: (item.theme as string) ?? ''
          });
        }
      }
      
      return transformedData;
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
        // Simplify type handling with a direct assertion
        const dbProgress = existing as Record<string, any>;
        
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            viewed_count: (dbProgress.viewed_count ?? 0) + 1,
            correct_count: (dbProgress.correct_count ?? 0) + (correct ? 1 : 0),
            streak: (dbProgress.streak ?? 0) + (correct ? 1 : 0),
            proficiency_level: correct 
              ? Math.min((dbProgress.proficiency_level ?? 0) + 1, 5)
              : Math.max((dbProgress.proficiency_level ?? 0) - 1, 0),
            last_viewed: new Date().toISOString()
          })
          .eq('id', dbProgress.id as string);

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
