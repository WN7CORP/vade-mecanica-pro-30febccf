import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch,
    hasMore,
    loadingRef
  } = useLawArticles(lawName);

  const {
    showExplanation,
    setShowExplanation,
    explanation,
    loadingExplanation,
    handleExplainArticle
  } = useAIExplanation(lawName);

  const handleOpenSearch = () => {
    setShowSearchBar(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
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
        
        <div className={`mb-6 transition-all duration-300 ${showSearchBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <SearchBar 
            onSearch={handleSearch} 
            initialValue={searchTerm}
            placeholder="Buscar artigo específico..." 
          />
        </div>
        
        {!isLoading && filteredArticles.length > 0 && (
          <div className="mb-4 text-sm text-gray-400">
            {searchTerm ? 
              `${filteredArticles.length} ${filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}` : 
              `Mostrando ${filteredArticles.length} de ${totalCount} artigos`
            }
          </div>
        )}
        
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
          loadingRef={loadingRef}
          hasMore={hasMore}
          onExplainArticle={handleExplain}
          onAskQuestion={handleAskQuestion}
          onCloseChat={() => setShowChat(false)}
          onCloseExplanation={() => setShowExplanation(false)}
        />

        <FloatingSearchButton onOpenSearch={handleOpenSearch} />
      </main>
      
      <Footer />
    </div>
  );
};

export default LawView;
