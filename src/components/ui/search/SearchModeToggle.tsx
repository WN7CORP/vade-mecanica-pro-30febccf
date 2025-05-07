
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
        className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-800/50 rounded-md w-full shadow-lg"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="number" 
                aria-label="Search by number"
                className="flex-1 data-[state=on]:bg-primary-500/20 data-[state=on]:text-primary-foreground hover:bg-primary-500/10 transition-all"
              >
                <Text className="h-4 w-4 mr-1" />
                <span className="text-xs">Número do Artigo</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900/90 border border-gray-800">
              <p>Buscar por número do artigo (ex: 5, art. 5)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </div>
  );
};

export default SearchModeToggle;
