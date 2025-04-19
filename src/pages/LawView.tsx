
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { ChevronUp } from "lucide-react";
import LawHeader from "@/components/law/LawHeader";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import { fetchAvailableLaws } from "@/services/lawService";
import { Article } from "@/types/law";

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [lawId, setLawId] = useState<number>();
  
  useEffect(() => {
    const loadLawId = async () => {
      try {
        const laws = await fetchAvailableLaws();
        const law = laws.find(l => l.nome === lawName);
        if (law) {
          setLawId(law.id);
        } else {
          navigate('/leis');
        }
      } catch (error) {
        console.error('Error loading law:', error);
        navigate('/leis');
      }
    };
    
    if (lawName) {
      loadLawId();
    }
  }, [lawName, navigate]);
  
  const {
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch
  } = useLawArticles(lawId);

  const {
    showExplanation,
    setShowExplanation,
    explanation,
    loadingExplanation,
    selectedArticle,
    setSelectedArticle,
    handleExplainArticle
  } = useAIExplanation(lawName);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAskQuestion = (article: Article) => {
    if (!lawName) return;
    
    setSelectedArticle(article);
    setShowChat(true);
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
        <LawHeader lawName={lawName} />
        
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchTerm}
            placeholder="Buscar artigo específico..." 
          />
        </div>
        
        <ArticleList
          isLoading={isLoading}
          searchTerm={searchTerm}
          filteredArticles={filteredArticles}
          lawName={lawName}
          showExplanation={showExplanation}
          explanation={explanation}
          loadingExplanation={loadingExplanation}
          selectedArticle={selectedArticle}
          showChat={showChat}
          onExplainArticle={handleExplainArticle}
          onAskQuestion={handleAskQuestion}
          onCloseChat={() => setShowChat(false)}
          onCloseExplanation={() => setShowExplanation(false)}
        />
      </main>
      
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
