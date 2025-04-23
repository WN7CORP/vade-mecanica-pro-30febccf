import { Search, X } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  initialValue?: string;
  placeholder?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ 
  onSearch, 
  initialValue = "", 
  placeholder = "Buscar artigo ou termo...",
  onInputChange,
  onFocus: propOnFocus,
  onBlur: propOnBlur
}, ref) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [searchPreviews, setSearchPreviews] = useState<Array<{
    title: string;
    preview: string;
  }>>([]);

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
    // Se quiser limpar os resultados quando o campo for limpo
    // onSearch("");
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Simulate search previews - replace with actual API call
    if (value.length >= 2) {
      setSearchPreviews([
        { title: "Art. 5º CF", preview: "Direitos e garantias fundamentais..." },
        { title: "Art. 37 CF", preview: "Administração pública direta e indireta..." },
      ]);
    } else {
      setSearchPreviews([]);
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
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (propOnBlur) {
      propOnBlur();
    }
  };

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
      
      {/* Search previews */}
      {isFocused && searchPreviews.length > 0 && (
        <div className="search-preview animate-fade-in">
          {searchPreviews.map((preview, index) => (
            <div 
              key={index}
              className="search-preview-item"
              onClick={() => {
                setSearchTerm(preview.title);
                onSearch(preview.title);
              }}
            >
              <Search size={16} className="text-primary-300" />
              <div>
                <div className="text-sm font-medium">{preview.title}</div>
                <div className="text-xs text-gray-400">{preview.preview}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
