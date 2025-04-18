
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import PDFExporter from "@/components/ui/PDFExporter";
import { ArrowLeft, Loader2, BookOpen, ChevronUp } from "lucide-react";
import { fetchSheetData } from "@/services/sheetsApi";
import { 
  generateArticleExplanation, 
  AIExplanation as AIExplanationType 
} from "@/services/aiService";

interface Article {
  article: string;
  content: string;
}

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Estados para explicação da IA
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Estado para o chat de IA
  const [showChat, setShowChat] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const loadArticles = async () => {
      if (!lawName) return;
      
      try {
        setIsLoading(true);
        const decodedLawName = decodeURIComponent(lawName);
        const data = await fetchSheetData(decodedLawName);
        
        setArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticles();
  }, [lawName]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term) {
      setFilteredArticles(articles);
      return;
    }
    
    const filtered = articles.filter(article => 
      (article.article && article.article.toLowerCase().includes(term.toLowerCase())) ||
      (article.content && article.content.toLowerCase().includes(term.toLowerCase()))
    );
    
    setFilteredArticles(filtered);
  };
  
  const handleExplainArticle = async (article: Article) => {
    if (!article.article || !lawName) return;
    
    setSelectedArticle(article);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        article.article,
        article.content,
        decodeURIComponent(lawName)
      );
      
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
    } finally {
      setLoadingExplanation(false);
    }
  };
  
  const handleAskQuestion = (article: Article) => {
    if (!lawName) return;
    
    setSelectedArticle(article);
    setShowChat(true);
  };
  
  const closeChat = () => {
    setShowChat(false);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full">
        {/* Cabeçalho com nome da lei */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/leis")}
            className="p-2 neomorph-sm mr-3"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} className="text-primary-300" />
          </button>
          
          <h1 className="text-xl font-heading font-semibold text-primary-300 line-clamp-1">
            {lawName ? decodeURIComponent(lawName) : "Legislação"}
          </h1>
        </div>
        
        {/* Barra de pesquisa */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchTerm}
            placeholder="Buscar artigo específico..." 
          />
        </div>
        
        {/* Lista de artigos */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary-300 animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-8 neomorph">
            <p className="text-gray-400">
              Nenhum artigo encontrado com o termo "{searchTerm}".
            </p>
          </div>
        ) : (
          <div>
            {filteredArticles.map((article, index) => (
              <ArticleCard
                key={index}
                articleNumber={article.article}
                content={article.content}
                lawName={lawName ? decodeURIComponent(lawName) : ""}
                onExplainRequest={() => handleExplainArticle(article)}
                onAskQuestion={() => handleAskQuestion(article)}
              />
            ))}
            
            {showExplanation && selectedArticle && (
              <AIExplanation
                explanation={explanation}
                isLoading={loadingExplanation}
                articleNumber={selectedArticle.article}
                lawName={lawName ? decodeURIComponent(lawName) : ""}
                onClose={() => setShowExplanation(false)}
              />
            )}
            
            {/* Exibir o chat quando solicitado */}
            {showChat && selectedArticle && lawName && (
              <AIChat
                articleNumber={selectedArticle.article}
                articleContent={selectedArticle.content}
                lawName={decodeURIComponent(lawName)}
                onClose={closeChat}
              />
            )}
            
            {/* Botão de exportar PDF somente quando houver uma explicação carregada */}
            {showExplanation && !loadingExplanation && selectedArticle && explanation && (
              <div className="mt-4 flex justify-end">
                <PDFExporter
                  articleNumber={selectedArticle.article}
                  articleContent={selectedArticle.content}
                  lawName={lawName ? decodeURIComponent(lawName) : ""}
                  explanation={explanation}
                />
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Botão de volta ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 p-3 neomorph-sm text-primary-300 z-10"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={20} />
        </button>
      )}
      
      <Footer />
    </div>
  );
};

export default LawView;
