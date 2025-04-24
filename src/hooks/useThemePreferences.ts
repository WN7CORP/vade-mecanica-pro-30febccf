
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ThemePreferences {
  selected_themes: string[];
  order_mode: 'sequential' | 'random';
  font_size: number;
}

export function useThemePreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error: fetchError } = useQuery({
    queryKey: ['theme-preferences'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('user_theme_preferences')
          .select('*')
          .maybeSingle();  // Changed from .single() to .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        // Return data with defaults if missing
        return {
          selected_themes: Array.isArray(data?.selected_themes) ? data.selected_themes : [],
          order_mode: data?.order_mode || 'sequential',
          font_size: data?.font_size || 16,
          ...data
        } as ThemePreferences;
      } catch (err) {
        console.error('Error fetching theme preferences:', err);
        // Return defaults on error
        return {
          selected_themes: [],
          order_mode: 'sequential',
          font_size: 16
        };
      }
    },
    retry: 2,
    staleTime: 60000 // 1 minute
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<ThemePreferences>) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Make sure arrays are properly formed
      if (newPreferences.selected_themes !== undefined) {
        newPreferences.selected_themes = Array.isArray(newPreferences.selected_themes) 
          ? newPreferences.selected_themes 
          : [];
      }
      
      const { error } = await supabase
        .from('user_theme_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      return newPreferences;
    },
    onSuccess: (data) => {
      // Update cache with optimistic update
      queryClient.setQueryData(['theme-preferences'], (oldData: ThemePreferences | undefined) => {
        if (!oldData) return data;
        return { ...oldData, ...data };
      });
      
      queryClient.invalidateQueries({ queryKey: ['theme-preferences'] });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Erro ao salvar preferências',
        description: 'Houve um problema ao salvar suas preferências. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences,
    fetchError
  };
}
