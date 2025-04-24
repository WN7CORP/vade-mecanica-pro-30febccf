
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Timeline } from "lucide-react";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import SearchBar from "@/components/ui/SearchBar";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
import ComparisonTool from "@/components/law/ComparisonTool";
import { Article } from "@/services/lawService";
import FlashCard from "@/components/study/FlashCard";
import { useStudyTimer } from "@/contexts/StudyTimerContext";

const LawTabbedView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [articlesToCompare, setArticlesToCompare] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showChat, setShowChat] = useState(false);
  
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

  const handleAddToComparison = (article: Article) => {
    if (articlesToCompare.length >= 2) {
      setArticlesToCompare([articlesToCompare[1], article]);
      return;
    }
    if (!articlesToCompare.find(a => a.id === article.id)) {
      setArticlesToCompare([...articlesToCompare, article]);
      if (articlesToCompare.length === 1) {
        setShowComparison(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all duration-300 ${showSearchBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <SearchBar onSearch={handleSearch} initialValue={searchTerm} placeholder="Buscar artigo específico..." />
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="articles" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Artigos</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="w-full">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Estudar</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="w-full">
            <Timeline className="mr-2 h-4 w-4" />
            <span>Linha do Tempo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-0">
          {showComparison && (
            <ComparisonTool 
              articles={articlesToCompare}
              lawName={lawName}
              onClose={() => {
                setShowComparison(false);
                setArticlesToCompare([]);
              }}
            />
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
            onExplainArticle={handleExplainArticle}
            onAskQuestion={(article) => {
              setSelectedArticle(article);
              setShowChat(true);
            }}
            onCloseChat={() => setShowChat(false)}
            onCloseExplanation={() => setShowExplanation(false)}
            onAddToComparison={handleAddToComparison}
          />
        </TabsContent>

        <TabsContent value="study" className="mt-0">
          <StudyMode />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <LegalTimeline />
        </TabsContent>
      </Tabs>

      <FloatingSearchButton onOpenSearch={handleOpenSearch} />
    </div>
  );
};

export default LawTabbedView;
