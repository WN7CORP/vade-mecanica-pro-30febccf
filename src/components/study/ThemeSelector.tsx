
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
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  themes: string[];
  onThemeSelect: (themes: string[]) => void;
}

export function ThemeSelector({ themes = [], onThemeSelect }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const { preferences } = useThemePreferences();

  const selectedThemes = preferences?.selected_themes || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedThemes.length === 0
            ? "Selecionar temas..."
            : `${selectedThemes.length} temas selecionados`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar tema..." />
          <CommandEmpty>Nenhum tema encontrado.</CommandEmpty>
          <CommandGroup>
            {themes.map((theme) => (
              <CommandItem
                key={theme}
                value={theme}
                onSelect={() => {
                  const newSelection = selectedThemes.includes(theme)
                    ? selectedThemes.filter((t) => t !== theme)
                    : [...selectedThemes, theme];
                  onThemeSelect(newSelection);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedThemes.includes(theme) ? "opacity-100" : "opacity-0"
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
