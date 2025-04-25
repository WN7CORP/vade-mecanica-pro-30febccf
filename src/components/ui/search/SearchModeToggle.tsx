
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Text } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchModeToggleProps {
  mode: 'number';
  onModeChange: (mode: 'number') => void;
}

const SearchModeToggle = ({ mode, onModeChange }: SearchModeToggleProps) => {
  return (
    <div className="flex justify-center">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => value && onModeChange(value as 'number')}
        className="bg-background/50 backdrop-blur-sm border rounded-md w-full"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="number" 
                aria-label="Search by number"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
              >
                <Text className="h-4 w-4 mr-1" />
                <span className="text-xs">Número do Artigo</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buscar por número do artigo (ex: 5, art. 5)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </div>
  );
};

export default SearchModeToggle;
