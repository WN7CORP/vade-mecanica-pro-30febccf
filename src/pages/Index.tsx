
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { Book, Search, Scale, BookOpen, Bookmark, ScrollText } from "lucide-react";
import { fetchAvailableLaws, fetchCategorizedLaws, searchAcrossAllLaws } from "@/services/lawService";
import debounce from 'lodash/debounce';

const Index = () => {
  const navigate = useNavigate();
  const [recentLaws, setRecentLaws] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPreviews, setSearchPreviews] = useState<any[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadRecentLaws = async () => {
      try {
        const sheets = await fetchAvailableLaws();
        setRecentLaws(sheets.slice(0, 4));
      } catch (error) {
        console.error("Erro ao carregar leis recentes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentLaws();
  }, []);

  const handleSearch = (term: string) => {
    if (term) {
      navigate(`/pesquisa?q=${encodeURIComponent(term)}`);
    }
  };

  const debouncedSearch = debounce(async (term: string) => {
    if (term.length < 2) {
      setSearchPreviews([]);
      setShowPreviews(false);
      return;
    }

    try {
      const results = await searchAcrossAllLaws(term);
      const previews = results.flatMap(lawResult => 
        lawResult.articles.map(article => ({
          article: article.numero,
          content: article.conteudo.substring(0, 100) + "...",
          lawName: lawResult.lawName,
          previewType: 'article',
          category: getLawCategory(lawResult.lawName)
        }))
      );
      setSearchPreviews(previews.slice(0, 10)); // Limit to 10 results total
      setShowPreviews(previews.length > 0);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchPreviews([]);
      setShowPreviews(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      debouncedSearch(term);
    } else {
      setSearchPreviews([]);
      setShowPreviews(false);
    }
  };

  const handlePreviewClick = (preview: any) => {
    navigate(`/lei/${encodeURIComponent(preview.lawName)}?artigo=${preview.article}`);
  };

  // Helper to get category from law name
  const getLawCategory = (lawName: string): 'codigo' | 'estatuto' | 'outros' => {
    if (lawName.toLowerCase().includes('código') || lawName === 'Constituição Federal' || lawName.includes('Consolidação')) {
      return 'codigo';
    } else if (lawName.toLowerCase().includes('estatuto')) {
      return 'estatuto'; 
    }
    return 'outros';
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
            VADE MECUM <span className="text-primary-100">PRO</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Vade Mecum Profissional
          </p>
        </div>
        
        <div className="mb-10 relative">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Buscar artigo, lei ou assunto..." 
            onInputChange={handleInputChange}
            searchPreviews={searchPreviews}
            showPreviews={showPreviews}
            onPreviewClick={handlePreviewClick}
          />
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4">
            Acesso rápido
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate("/leis")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <BookOpen size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Ver Tudo</span>
              <span className="text-xs text-gray-400 mt-1">
                Navegar entre leis
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/favoritos")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <Bookmark size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Favoritos</span>
              <span className="text-xs text-gray-400 mt-1">
                Artigos salvos
              </span>
            </button>

            <button 
              onClick={() => navigate("/anotacoes")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <ScrollText size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Anotações</span>
              <span className="text-xs text-gray-400 mt-1">
                Anotações de estudos
              </span>
            </button>
            
            <button 
              onClick={() => navigate("/pesquisa")}
              className="neomorph p-6 flex flex-col items-center justify-center text-center h-32 hover:scale-105 transition-all duration-300"
            >
              <Search size={28} className="text-primary-300 mb-3" />
              <span className="text-gray-300 font-medium">Pesquisar</span>
              <span className="text-xs text-gray-400 mt-1">
                Buscar artigos e termos
              </span>
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-heading font-semibold text-primary-100 mb-4">
            Leis recentes
          </h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="neomorph-sm p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentLaws.map((law, index) => (
                <button
                  key={index}
                  onClick={() => navigate(`/lei/${encodeURIComponent(law)}`)}
                  className="neomorph-sm p-4 w-full flex items-center justify-between transition-all hover:shadow-neomorph-inset"
                >
                  <div className="flex items-center">
                    <Book size={18} className="text-primary-300 mr-3" />
                    <span className="text-gray-300">{law}</span>
                  </div>
                  <Scale size={16} className="text-gray-500" />
                </button>
              ))}
              
              {recentLaws.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  Nenhuma lei encontrada. Verifique a conexão com a planilha.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
