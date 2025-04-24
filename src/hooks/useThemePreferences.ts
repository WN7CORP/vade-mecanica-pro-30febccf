
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ThemePreferences {
  selected_themes: string[];
  order_mode: 'sequential' | 'random';
  font_size: number;
}

export function useThemePreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['theme-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_theme_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data as ThemePreferences || {
        selected_themes: [],
        order_mode: 'sequential',
        font_size: 16
      };
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<ThemePreferences>) => {
      const { error } = await supabase
        .from('user_theme_preferences')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-preferences'] });
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences
  };
}
