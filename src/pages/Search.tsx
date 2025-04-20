
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import { Loader2, FileText, BookOpen } from "lucide-react";
import { 
  searchArticle, 
  searchByTerm,
  fetchAvailableLaws,
  LAW_OPTIONS
} from "@/services/lawService";
import { 
  generateArticleExplanation, 
  AIExplanation as AIExplanationType 
} from "@/services/aiService";

interface SearchResult {
  article: string;
  content: string;
  lawName: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLaw, setSelectedLaw] = useState<string>("");
  const [availableLaws, setAvailableLaws] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  
  // Estados para explicação da IA
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<SearchResult | null>(null);
  
  // Estado para o chat de IA
  const [showChat, setShowChat] = useState(false);

  // Carregar leis disponíveis
  useEffect(() => {
    const loadLaws = async () => {
      try {
        const laws = fetchAvailableLaws();
        setAvailableLaws(laws);
        
        // Se não houver lei selecionada, usar a primeira
        if (!selectedLaw && laws.length > 0) {
          setSelectedLaw(laws[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar leis:", error);
      }
    };
    
    loadLaws();
  }, [selectedLaw]);

  // Realizar pesquisa quando a query ou lei selecionada muda
  useEffect(() => {
    const performSearch = async () => {
      if (!query || !selectedLaw) return;
      
      setIsLoading(true);
      setNoResults(false);
      
      try {
        // Primeira tentativa: buscar artigo exato
        const article = await searchArticle(selectedLaw, query);
        
        if (article && article.numero) {
          setSearchResults([{
            article: article.numero,
            content: article.conteudo,
            lawName: selectedLaw
          }]);
        } else {
          // Segunda tentativa: buscar por termo
          const results = await searchByTerm(selectedLaw, query);
          
          if (results.length > 0) {
            setSearchResults(
              results.map(result => ({
                article: result.numero,
                content: result.conteudo,
                lawName: selectedLaw
              }))
            );
          } else {
            setSearchResults([]);
            setNoResults(true);
          }
        }
      } catch (error) {
        console.error("Erro na pesquisa:", error);
        setSearchResults([]);
        setNoResults(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [query, selectedLaw]);

  const handleSearch = (term: string) => {
    setSearchParams({ q: term });
  };
  
  const handleLawChange = (lawName: string) => {
    setSelectedLaw(lawName);
  };
  
  const handleExplainArticle = async (result: SearchResult, type: 'technical' | 'formal' = 'technical') => {
    if (!result.article) return;
    
    setSelectedArticle(result);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        result.article,
        result.content,
        result.lawName,
        type
      );
      
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
    } finally {
      setLoadingExplanation(false);
    }
  };
  
  const handleAskQuestion = (result: SearchResult) => {
    setSelectedArticle(result);
    setShowChat(true);
  };
  
  const closeChat = () => {
    setShowChat(false);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={query}
            placeholder="Buscar artigo ou termo..." 
          />
        </div>
        
        {/* Seletor de lei */}
        <div className="mb-6 overflow-x-auto scrollbar-thin pb-2">
          <div className="flex space-x-2">
            {LAW_OPTIONS.map((law) => (
              <button
                key={law.table}
                onClick={() => handleLawChange(law.display)}
                className={`px-4 py-2 whitespace-nowrap text-sm ${
                  selectedLaw === law.display
                    ? "neomorph text-primary-300"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {law.display}
              </button>
            ))}
          </div>
        </div>
        
        {/* Resultados da pesquisa */}
        <div>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-400">Buscando resultados...</p>
            </div>
          ) : noResults ? (
            <div className="text-center py-8 neomorph">
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-primary-100 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-400">
                Tente usar outros termos ou verificar a ortografia.
              </p>
            </div>
          ) : (
            <div>
              {searchResults.map((result, index) => (
                <ArticleCard
                  key={index}
                  articleNumber={result.article}
                  content={result.content}
                  lawName={result.lawName}
                  onExplainRequest={(type) => handleExplainArticle(result, type)}
                  onAskQuestion={() => handleAskQuestion(result)}
                />
              ))}
              
              {showExplanation && selectedArticle && (
                <AIExplanation
                  explanation={explanation}
                  isLoading={loadingExplanation}
                  articleNumber={selectedArticle.article}
                  lawName={selectedArticle.lawName}
                  onClose={() => setShowExplanation(false)}
                />
              )}
              
              {/* Exibir o chat quando solicitado */}
              {showChat && selectedArticle && (
                <AIChat
                  articleNumber={selectedArticle.article}
                  articleContent={selectedArticle.content}
                  lawName={selectedArticle.lawName}
                  onClose={closeChat}
                />
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
