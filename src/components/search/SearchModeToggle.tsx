
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SearchModeToggleProps {
  isNumberSearch: boolean;
  onToggle: (value: boolean) => void;
}

export function SearchModeToggle({ isNumberSearch, onToggle }: SearchModeToggleProps) {
  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-primary/5 rounded-full">
      <Label htmlFor="search-mode" className="text-xs text-muted-foreground cursor-pointer">
        {isNumberSearch ? "Busca por número" : "Busca exata"}
      </Label>
      <Switch
        id="search-mode"
        checked={isNumberSearch}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
