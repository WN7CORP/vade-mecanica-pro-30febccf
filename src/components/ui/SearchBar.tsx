
import { Search, X, History, Filter } from "lucide-react";
import { useState, useEffect, forwardRef, useMemo } from "react";
import { getLawAbbreviation } from "@/utils/lawAbbreviations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchModeToggle from "./search/SearchModeToggle";
import { highlightSearchTerm } from "@/utils/textExpansion";

interface SearchPreview {
  article?: string;
  content: string;
  lawName: string;
  previewType: 'article' | 'term';
  category?: 'codigo' | 'estatuto';
}

interface SearchBarProps {
  onSearch: (term: string, mode?: 'number') => void;
  initialValue?: string;
  placeholder?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  searchPreviews?: SearchPreview[];
  showPreviews?: boolean;
  onPreviewClick?: (preview: SearchPreview) => void;
  showInstantResults?: boolean;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ 
  onSearch, 
  initialValue = "", 
  placeholder = "Buscar artigo...",
  onInputChange,
  onFocus: propOnFocus,
  onBlur: propOnBlur,
  searchPreviews = [],
  showPreviews = false,
  onPreviewClick,
  showInstantResults = false,
}, ref) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [localSearchMode] = useState<'number'>('number');
  const isMobile = useIsMobile();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (showInstantResults && searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, showInstantResults]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      onSearch(searchTerm.trim(), localSearchMode);
      setShowHistory(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onInputChange) {
      const event = { target: { value: "" } } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
    onSearch("");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
    
    if (onInputChange) {
      onInputChange(e);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    if (propOnFocus) {
      propOnFocus();
    }
    
    if (!searchTerm.trim() && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };
  
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowHistory(false);
      if (propOnBlur) {
        propOnBlur();
      }
    }, 200);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    setShowHistory(false);
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    onSearch(term, localSearchMode);
    setShowHistory(false);
  };

  const groupedPreviews = useMemo(() => {
    return searchPreviews.reduce<Record<string, SearchPreview[]>>((acc, preview) => {
      const category = preview.category || 'outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(preview);
      return acc;
    }, {});
  }, [searchPreviews]);

  const truncateContent = (content: string, maxLength = 90) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderHighlightedText = (text: string, term: string) => {
    if (!term || !text) return text;
    
    try {
      const result = highlightSearchTerm(text, term);
      
      if (typeof result === 'string') {
        return result;
      }
      
      return result.map((part, index) => (
        part.highlight 
          ? <mark key={index} className="bg-primary-300/20 font-semibold not-italic">{part.text}</mark>
          : part.text
      ));
    } catch (e) {
      console.error('Error in renderHighlightedText:', e);
      return text;
    }
  };

  return (
    <div className="relative">
      <motion.div 
        initial={false}
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        className={`transition-all duration-300 ${
          isFocused 
            ? "shadow-[0_0_15px_rgba(123,92,247,0.2)] border-primary-500/40" 
            : "shadow-md"
        } border border-gray-800/30 bg-gray-900/70 rounded-xl overflow-hidden`}
      >
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <Search 
              size={20} 
              className={`transition-colors ${
                isFocused ? "text-primary-400" : "text-gray-400"
              }`} 
            />
            
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Digite o número do artigo..."
              className="flex-1 bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground text-base"
              autoComplete="off"
              ref={ref}
            />
            
            {searchTerm && (
              <button 
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-300 rounded-full hover:bg-gray-800/50 transition-colors"
                aria-label="Limpar pesquisa"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <SearchModeToggle 
            mode={localSearchMode} 
            onModeChange={() => {}} 
          />
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isFocused && showHistory && searchHistory.length > 0 && !searchTerm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute z-50 w-full mt-2 bg-gray-900/95 border border-gray-800/50 rounded-xl shadow-lg max-h-60 overflow-y-auto backdrop-blur-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/30">
              <div className="flex items-center text-sm text-primary-300/80">
                <History className="mr-2 h-4 w-4" />
                Pesquisas recentes
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-primary-300 transition-colors px-2 py-1 hover:bg-gray-800/30 rounded"
              >
                Limpar histórico
              </button>
            </div>
            {searchHistory.map((term, index) => (
              <div
                key={`history-${index}`}
                onClick={() => handleHistoryClick(term)}
                className="p-3 hover:bg-gray-800/40 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-primary-100">{term}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {isFocused && showPreviews && Object.keys(groupedPreviews).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute z-50 w-full mt-2 bg-gray-900/95 border border-gray-800/50 rounded-xl shadow-lg max-h-[400px] overflow-y-auto backdrop-blur-sm"
          >
            {Object.entries(groupedPreviews).map(([category, categoryPreviews]) => (
              <div key={category} className="border-b border-gray-800/30 last:border-0">
                {category !== 'outros' && (
                  <div className="text-xs font-semibold text-primary-400/90 px-3 pt-3 pb-1 uppercase flex items-center">
                    {category === 'codigo' ? 'Códigos' : category === 'estatuto' ? 'Estatutos' : 'Outros'}
                    <Badge variant="secondary" className="ml-2 text-[10px] bg-primary-500/20 text-primary-300">
                      {categoryPreviews.length}
                    </Badge>
                  </div>
                )}
                
                {categoryPreviews.map((preview, index) => {
                  const abbreviation = getLawAbbreviation(preview.lawName);
                  return (
                    <motion.div
                      key={`${category}-${index}`}
                      whileHover={{ backgroundColor: "rgba(123, 92, 247, 0.08)" }}
                      onClick={() => onPreviewClick?.(preview)}
                      className="group p-4 hover:bg-primary-500/5 cursor-pointer transition-all duration-200"
                    >
                      <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'}`}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium text-primary-400 bg-primary-500/10 border-primary-500/20 ${
                                  isMobile ? 'self-start' : ''
                                }`}
                              >
                                {abbreviation}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-900/95 border border-gray-800/50">
                              <p>{preview.lawName}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="text-sm text-primary-100 group-hover:text-primary-300 transition-colors">
                          {preview.previewType === 'article' ? 'Art.' : ''} {preview.article}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {renderHighlightedText(truncateContent(preview.content), searchTerm)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
