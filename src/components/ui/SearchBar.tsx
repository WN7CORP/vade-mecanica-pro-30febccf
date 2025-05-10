
import { Search, X, History, BookOpen, FileText, BookText } from "lucide-react";
import { useState, useEffect, forwardRef, useMemo } from "react";
import { getLawAbbreviation } from "@/utils/lawAbbreviations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchModeToggle from "./search/SearchModeToggle";
import { highlightSearchTerm } from "@/utils/textExpansion";
import { ReactNode } from "react";

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
  categoryIcon?: ReactNode;
  lawCategory?: 'codigo' | 'estatuto' | 'outros';
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
  categoryIcon,
  lawCategory = 'outros',
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
    if (!text || !term) return text;
    
    try {
      const regex = new RegExp(`(${term})`, 'gi');
      return text.replace(regex, match => `<span class="search-highlight">${match}</span>`);
    } catch (e) {
      return text;
    }
  };
  
  const getPreviewIcon = (preview: SearchPreview) => {
    if (preview.category === 'codigo') {
      return <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
    } else if (preview.category === 'estatuto') {
      return <FileText className="h-4 w-4 text-estatuto-light dark:text-estatuto-dark flex-shrink-0" />;
    }
    return <BookText className="h-4 w-4 text-gray-500 flex-shrink-0" />;
  };

  return (
    <div className="relative w-full">
      <div className={`relative flex items-center rounded-lg border ${
        lawCategory === 'codigo' ? 'border-blue-200 dark:border-blue-800/50 focus-within:border-blue-400 dark:focus-within:border-blue-600' : 
        lawCategory === 'estatuto' ? 'border-green-200 dark:border-green-800/50 focus-within:border-green-400 dark:focus-within:border-green-600' :
        'border-gray-200 dark:border-gray-800 focus-within:border-primary dark:focus-within:border-primary-400'
      } bg-background transition-all duration-200 focus-within:ring-1 ${
        lawCategory === 'codigo' ? 'focus-within:ring-blue-400/30 dark:focus-within:ring-blue-400/20' : 
        lawCategory === 'estatuto' ? 'focus-within:ring-green-400/30 dark:focus-within:ring-green-400/20' :
        'focus-within:ring-primary/30 dark:focus-within:ring-primary-400/20'
      }`}>
        <div className="pl-3 flex items-center">
          {categoryIcon || <Search className="h-4 w-4 text-muted-foreground" />}
        </div>
        <input
          ref={ref}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`flex-1 py-3 px-3 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground ${
            lawCategory === 'codigo' ? 'focus:ring-0 text-blue-900 dark:text-blue-300' : 
            lawCategory === 'estatuto' ? 'focus:ring-0 text-green-900 dark:text-green-300' :
            'focus:ring-0'
          }`}
          aria-label="Buscar"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="mr-1 p-2 hover:bg-muted rounded-full"
            aria-label="Limpar pesquisa"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={handleSearch}
          className={`px-4 py-2 mr-1 rounded-md ${
            lawCategory === 'codigo' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
            lawCategory === 'estatuto' ? 'bg-estatuto-light hover:bg-estatuto-light/90 text-white' :
            'bg-primary hover:bg-primary/90 text-primary-foreground'
          } transition-colors`}
          aria-label="Pesquisar"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Search previews */}
      <AnimatePresence>
        {showPreviews && searchPreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-1 w-full bg-popover border ${
              lawCategory === 'codigo' ? 'border-blue-200 dark:border-blue-800/50' : 
              lawCategory === 'estatuto' ? 'border-green-200 dark:border-green-800/50' :
              'border-border'
            } rounded-md shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto`}
          >
            <div className="p-1 divide-y divide-border">
              {Object.entries(groupedPreviews).length > 0 ? (
                Object.entries(groupedPreviews).map(([category, previews]) => (
                  <div key={category} className="py-1">
                    <div className={`px-3 py-1.5 text-xs font-medium ${
                      category === 'codigo' ? 'text-blue-600 dark:text-blue-400' : 
                      category === 'estatuto' ? 'text-estatuto-light dark:text-estatuto-dark' :
                      'text-muted-foreground'
                    }`}>
                      {category === 'codigo' ? 'Códigos' : 
                       category === 'estatuto' ? 'Estatutos' : 'Outros'}
                    </div>
                    {previews.map((preview, index) => (
                      <div
                        key={`${preview.article || 'term'}-${index}`}
                        className={`px-3 py-2 hover:bg-muted cursor-pointer transition-colors ${
                          preview.category === 'codigo' ? 'hover:bg-blue-50 dark:hover:bg-blue-950/20' : 
                          preview.category === 'estatuto' ? 'hover:bg-green-50 dark:hover:bg-green-950/20' :
                          'hover:bg-accent'
                        }`}
                        onClick={() => onPreviewClick && onPreviewClick(preview)}
                      >
                        <div className="flex items-start gap-2">
                          {getPreviewIcon(preview)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium truncate max-w-[150px]">
                                  {preview.lawName}
                                </span>
                                {preview.article && (
                                  <Badge variant="outline" className={`text-xs ${
                                    preview.category === 'codigo' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' : 
                                    preview.category === 'estatuto' ? 'bg-green-50 dark:bg-green-950/20 text-estatuto-light dark:text-estatuto-dark' :
                                    ''
                                  }`}>
                                    Art. {preview.article}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: renderHighlightedText(truncateContent(preview.content), searchTerm),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-muted-foreground">Buscando resultados...</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Search history */}
        {showHistory && searchHistory.length > 0 && !showPreviews && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center text-sm text-muted-foreground">
                <History className="mr-2 h-4 w-4" />
                Pesquisas recentes
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Limpar
              </button>
            </div>
            {searchHistory.map((term, index) => (
              <div
                key={`history-${index}`}
                onClick={() => handleHistoryClick(term)}
                className="p-3 hover:bg-accent/20 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-primary-100">{term}</span>
                </div>
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
