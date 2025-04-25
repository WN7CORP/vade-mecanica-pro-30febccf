
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Text, FileText, Book, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchModeToggleProps {
  mode: 'number' | 'exact' | 'history' | 'fulltext';
  onModeChange: (mode: 'number' | 'exact' | 'history' | 'fulltext') => void;
}

const SearchModeToggle = ({ mode, onModeChange }: SearchModeToggleProps) => {
  return (
    <div className="flex justify-center">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => value && onModeChange(value as 'number' | 'exact' | 'history' | 'fulltext')}
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
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="exact" 
                aria-label="Search exact text"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
              >
                <FileText className="h-4 w-4 mr-1" />
                <span className="text-xs">Texto Exato</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buscar pelo conteúdo exato do artigo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="fulltext" 
                aria-label="Full text search"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
              >
                <Book className="h-4 w-4 mr-1" />
                <span className="text-xs">Texto Completo</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pesquisa avançada de texto completo</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="history" 
                aria-label="Search in history"
                className="flex-1 data-[state=on]:bg-primary/20 data-[state=on]:text-primary-foreground"
              >
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-xs">Histórico</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buscar em versões históricas da lei</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </div>
  );
};

export default SearchModeToggle;
