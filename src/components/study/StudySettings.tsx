
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThemeSelector } from "@/components/study/ThemeSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useThemePreferences } from "@/hooks/useThemePreferences";

interface StudySettingsProps {
  themes: string[];
  onThemeSelect: (themes: string[]) => void;
  loadingThemes: boolean;
}

export const StudySettings = ({ 
  themes, 
  onThemeSelect, 
  loadingThemes 
}: StudySettingsProps) => {
  const { preferences, updatePreferences } = useThemePreferences();
  const [noThemesSelected, setNoThemesSelected] = useState(false);

  const handleThemeSelect = async (selectedThemes: string[]) => {
    setNoThemesSelected(selectedThemes.length === 0);
    onThemeSelect(selectedThemes);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Temas de estudo</label>
        </div>
        <ThemeSelector 
          themes={themes}
          onThemeSelect={handleThemeSelect}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="order-mode"
          checked={preferences?.order_mode === 'random'}
          onCheckedChange={(checked) =>
            updatePreferences.mutate({ 
              order_mode: checked ? 'random' : 'sequential' 
            })
          }
        />
        <Label htmlFor="order-mode">Ordem aleatória</Label>
      </div>

      {noThemesSelected && (
        <div className="text-center py-6 neomorph">
          <p className="text-gray-400">
            Selecione pelo menos um tema para começar.
          </p>
          <Button
            variant="outline"
            className="mt-4 bg-primary/10 hover:bg-primary/20"
            onClick={() => {
              const scrollElement = document.querySelector('.space-y-1');
              if (scrollElement) {
                scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
            Selecionar temas
          </Button>
        </div>
      )}
    </div>
  );
};
