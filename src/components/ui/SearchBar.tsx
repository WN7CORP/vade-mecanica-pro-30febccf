
import { Search, X } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";
import { getLawAbbreviation } from "@/utils/lawAbbreviations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchPreview {
  article?: string;
  content: string;
  lawName: string;
  previewType: 'article' | 'term';
  category?: 'codigo' | 'estatuto';
}

interface SearchBarProps {
  onSearch: (term: string) => void;
  initialValue?: string;
  placeholder?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  searchPreviews?: SearchPreview[];
  showPreviews?: boolean;
  onPreviewClick?: (preview: SearchPreview) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ 
  onSearch, 
  initialValue = "", 
  placeholder = "Buscar artigo ou termo...",
  onInputChange,
  onFocus: propOnFocus,
  onBlur: propOnBlur,
  searchPreviews = [],
  showPreviews = false,
  onPreviewClick
}, ref) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (onInputChange) {
      onInputChange(e);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    if (propOnFocus) {
      propOnFocus();
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (propOnBlur) {
      propOnBlur();
    }
  };

  // Group previews by category
  const groupedPreviews = searchPreviews.reduce<Record<string, SearchPreview[]>>((acc, preview) => {
    const category = preview.category || 'outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(preview);
    return acc;
  }, {});

  return (
    <div className="relative">
      <div className={`transition-all duration-300 neomorph ${
        isFocused ? "neomorph-inset" : ""
      }`}>
        <div className="flex items-center px-3 py-2">
          <Search 
            size={18} 
            className={`mr-2 transition-colors ${
              isFocused ? "text-primary-300" : "text-gray-400"
            }`} 
          />
          
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground"
            autoComplete="off"
            ref={ref}
          />
          
          {searchTerm && (
            <button 
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-300"
              aria-label="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {showPreviews && Object.keys(groupedPreviews).length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto animate-fade-in">
          {Object.entries(groupedPreviews).map(([category, categoryPreviews]) => (
            <div key={category} className="border-b border-border last:border-0">
              {category !== 'outros' && (
                <div className="text-xs font-semibold text-primary-300/70 px-3 pt-2 pb-1 uppercase">
                  {category === 'codigo' ? 'Códigos' : category === 'estatuto' ? 'Estatutos' : 'Outros'}
                </div>
              )}
              
              {categoryPreviews.map((preview, index) => {
                const abbreviation = getLawAbbreviation(preview.lawName);
                return (
                  <div 
                    key={`${category}-${index}`}
                    onClick={() => onPreviewClick?.(preview)}
                    className="group p-3 hover:bg-accent/20 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-medium text-primary-300/70 bg-primary-300/10 px-2 py-0.5 rounded">
                              {abbreviation}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{preview.lawName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="text-sm text-primary-100 group-hover:text-primary-300 transition-colors">
                        {preview.previewType === 'article' ? 'Art.' : ''} {preview.article}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
                      {preview.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
