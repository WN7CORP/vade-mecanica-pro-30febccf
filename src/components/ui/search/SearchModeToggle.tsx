
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Text, FileText } from "lucide-react";

interface SearchModeToggleProps {
  mode: 'number' | 'exact';
  onModeChange: (mode: 'number' | 'exact') => void;
}

const SearchModeToggle = ({ mode, onModeChange }: SearchModeToggleProps) => {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => value && onModeChange(value as 'number' | 'exact')}
      className="bg-background/50 backdrop-blur-sm border rounded-md"
    >
      <ToggleGroupItem 
        value="number" 
        aria-label="Search by number"
        className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
      >
        <Text className="h-4 w-4 mr-1" />
        <span className="text-xs">Número</span>
      </ToggleGroupItem>
      
      <ToggleGroupItem 
        value="exact" 
        aria-label="Search exact text"
        className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
      >
        <FileText className="h-4 w-4 mr-1" />
        <span className="text-xs">Exata</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default SearchModeToggle;
