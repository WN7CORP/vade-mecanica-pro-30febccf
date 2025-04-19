
import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { ChevronUp } from "lucide-react";
import LawHeader from "@/components/law/LawHeader";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import { Article } from "@/services/lawService";

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const {
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch
  } = useLawArticles(lawName);

  const {
    showExplanation,
    setShowExplanation,
    explanation,
    loadingExplanation,
    selectedArticle,
    setSelectedArticle,
    handleExplainArticle
  } = useAIExplanation(lawName);
  
  useState(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

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
