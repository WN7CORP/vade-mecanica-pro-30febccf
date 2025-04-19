import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { BookOpen, ChevronRight, Grid, List, Loader2 } from "lucide-react";
import { fetchAvailableLaws } from "@/services/lawService";

type ViewMode = "grid" | "list";

const AllLaws = () => {
  const navigate = useNavigate();
  const [laws, setLaws] = useState<string[]>([]);
  const [filteredLaws, setFilteredLaws] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  useEffect(() => {
    const loadLaws = async () => {
      try {
        setIsLoading(true);
        const availableLaws = await fetchAvailableLaws();
        setLaws(availableLaws);
        setFilteredLaws(availableLaws);
      } catch (error) {
        console.error("Erro ao carregar leis:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLaws();
  }, []);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setFilteredLaws(laws);
      return;
    }
    
    const filtered = laws.filter(law => 
      law.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredLaws(filtered);
  };
  
  const navigateToLaw = (lawName: string) => {
    navigate(`/lei/${encodeURIComponent(lawName)}`);
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary-300">
            Legislação
          </h1>
          
          <button
            onClick={toggleViewMode}
            className="p-2 neomorph-sm"
            aria-label={viewMode === "grid" ? "Visualizar em lista" : "Visualizar em grade"}
          >
            {viewMode === "grid" ? (
              <List size={18} className="text-primary-300" />
            ) : (
              <Grid size={18} className="text-primary-300" />
            )}
          </button>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchTerm}
            placeholder="Filtrar legislação..." 
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary-300 animate-spin" />
          </div>
        ) : filteredLaws.length === 0 ? (
          <div className="text-center py-8 neomorph">
            <p className="text-gray-400">
              Nenhuma legislação encontrada com o termo "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-3"}>
            {filteredLaws.map((law, index) => (
              viewMode === "grid" ? (
                <button
                  key={index}
                  onClick={() => navigateToLaw(law)}
                  className="neomorph p-4 h-32 flex flex-col items-center justify-center text-center transition-all hover:shadow-neomorph-inset"
                >
                  <BookOpen size={24} className="text-primary-300 mb-3" />
                  <span className="text-gray-300 text-sm font-medium line-clamp-2">
                    {law}
                  </span>
                </button>
              ) : (
                <button
                  key={index}
                  onClick={() => navigateToLaw(law)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                >
                  <div className="flex items-center">
                    <BookOpen size={18} className="text-primary-300 mr-3" />
                    <span className="text-gray-300">{law}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              )
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AllLaws;
