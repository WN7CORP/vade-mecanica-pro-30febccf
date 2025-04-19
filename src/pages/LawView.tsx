
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import LawHeader from "@/components/law/LawHeader";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Article } from "@/services/lawService";

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const [showChat, setShowChat] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const isMobile = useIsMobile();
  
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
    handleExplainArticle
  } = useAIExplanation(lawName);
  
  // Ensure all audio is stopped when navigating
  useEffect(() => {
    return () => {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
    };
  }, []);

  const handleAskQuestion = (article: Article) => {
    if (!lawName) return;
    setSelectedArticle(article);
    setShowChat(true);
  };

  const handleExplain = async (article: Article, type: 'technical' | 'formal') => {
    setSelectedArticle(article);
    await handleExplainArticle(article, type);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 pt-20 px-4" style={{ background: '#131620' }}>
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
          onExplainArticle={handleExplain}
          onAskQuestion={handleAskQuestion}
          onCloseChat={() => setShowChat(false)}
          onCloseExplanation={() => setShowExplanation(false)}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default LawView;
