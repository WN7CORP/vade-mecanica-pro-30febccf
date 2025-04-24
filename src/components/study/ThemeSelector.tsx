
import { Check, ChevronsUpDown } from "lucide-react";
import { useThemePreferences } from "@/hooks/useThemePreferences";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface ThemeSelectorProps {
  themes: string[];
  onThemeSelect: (themes: string[]) => void;
}

export function ThemeSelector({ themes = [], onThemeSelect }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const { preferences, isLoading, updatePreferences } = useThemePreferences();
  const [localSelectedThemes, setLocalSelectedThemes] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ensure themes is always an array, even if empty
  const safeThemes = Array.isArray(themes) ? themes : [];
  
  // Initialize local state from preferences when loaded
  useEffect(() => {
    if (preferences?.selected_themes) {
      setLocalSelectedThemes(Array.isArray(preferences.selected_themes) ? preferences.selected_themes : []);
    }
  }, [preferences]);

  // Handle theme selection with error handling and local state management
  const handleThemeSelect = async (theme: string) => {
    try {
      const newSelection = localSelectedThemes.includes(theme)
        ? localSelectedThemes.filter(t => t !== theme)
        : [...localSelectedThemes, theme];
      
      setLocalSelectedThemes(newSelection);
      setIsUpdating(true);
      
      if (onThemeSelect) {
        onThemeSelect(newSelection);
      }
      
      // Update preferences in the database
      await updatePreferences.mutateAsync({ selected_themes: newSelection });
      
      // Show success toast for feedback
      toast({
        title: "Temas atualizados",
        description: "Suas preferências de temas foram atualizadas com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating theme preferences:", error);
      
      // Reset to previous state on error
      setLocalSelectedThemes(Array.isArray(preferences?.selected_themes) ? preferences.selected_themes : []);
      
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas preferências de tema.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Render fallback if CMDK would receive invalid data
  if (!Array.isArray(safeThemes) || safeThemes.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full">
        Nenhum tema disponível
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            isUpdating && "opacity-70 cursor-wait"
          )}
          disabled={isLoading || isUpdating}
        >
          {localSelectedThemes.length === 0
            ? "Selecionar temas..."
            : `${localSelectedThemes.length} ${localSelectedThemes.length === 1 ? "tema selecionado" : "temas selecionados"}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-h-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar tema..." />
          <CommandEmpty>Nenhum tema encontrado.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {safeThemes.map((theme) => (
              <CommandItem
                key={theme}
                value={theme}
                onSelect={() => {
                  handleThemeSelect(theme);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    localSelectedThemes.includes(theme) ? "opacity-100" : "opacity-0"
                  )}
                />
                {theme}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
