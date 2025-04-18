
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  initialValue?: string;
  placeholder?: string;
}

const SearchBar = ({ 
  onSearch, 
  initialValue = "", 
  placeholder = "Buscar artigo ou termo..." 
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Atualiza o termo de pesquisa se o valor inicial mudar
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

  return (
    <div className={`relative transition-all duration-300 neomorph ${
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
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground"
          autoComplete="off"
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
  );
};

export default SearchBar;
