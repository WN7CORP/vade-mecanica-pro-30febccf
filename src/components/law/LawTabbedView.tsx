
import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Clock, ArrowUp } from "lucide-react";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import SearchBar from "@/components/ui/SearchBar";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
import ComparisonTool from "@/components/law/ComparisonTool";
import { Article } from "@/services/lawService";
import StudyMode from "@/pages/StudyMode";
import LegalTimeline from "@/pages/LegalTimeline";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ArticleHistory from "./ArticleHistory";
import { motion } from "framer-motion";

const LawTabbedView = () => {
  const navigate = useNavigate();
  const { lawName } = useParams<{ lawName: string }>();
  const [searchParams] = useSearchParams();
  const highlightedArticleNumber = searchParams.get('artigo');
  const highlightedRef = useRef<HTMLDivElement>(null);
  
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [articlesToCompare, setArticlesToCompare] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [globalFontSize, setGlobalFontSize] = useState(16);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    filteredArticles,
    isLoading,
    searchTerm,
    handleSearch: handleFilterSearch,
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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (highlightedArticleNumber && filteredArticles.length > 0 && !isLoading) {
      const articleToHighlight = filteredArticles.find(
        article => article.numero === highlightedArticleNumber
      );
      
      if (articleToHighlight) {
        setTimeout(() => {
          if (highlightedRef.current) {
            highlightedRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            toast({
              title: `Artigo ${highlightedArticleNumber}`,
              description: "Artigo encontrado e destacado",
              duration: 3000
            });
          }
        }, 500);
      }
    }
  }, [highlightedArticleNumber, filteredArticles, isLoading]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleOpenSearch = () => {
    setShowSearchBar(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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

  const handleStudyMode = () => {
    navigate(`/study/${lawName}`);
  };

  const handleArticleSearch = (term: string) => {
    if (!term) return;
    
    const article = filteredArticles.find(article => 
      article.numero.toLowerCase() === term.toLowerCase() ||
      article.conteudo.toLowerCase().includes(term.toLowerCase())
    );

    if (article) {
      const articleElement = document.getElementById(`article-${article.numero}`);
      if (articleElement) {
        articleElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        articleElement.classList.add('highlight-article');
        setTimeout(() => {
          articleElement.classList.remove('highlight-article');
        }, 2000);

        toast({
          title: `Artigo ${article.numero} encontrado`,
          description: "Artigo encontrado e destacado",
          duration: 3000
        });
      }
    } else {
      toast({
        title: "Artigo não encontrado",
        description: "Tente usar outro termo ou número",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-20 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg mb-6"
      >
        <SearchBar 
          onSearch={handleArticleSearch}
          initialValue={searchTerm}
          placeholder="Buscar por número do artigo ou conteúdo..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          showInstantResults
        />
      </motion.div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="articles" className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Artigos</span>
          </TabsTrigger>
          <TabsTrigger value="study" className="w-full">
            <GraduationCap className="mr-2 h-4 w-4" />
            <span>Estudar</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="w-full">
            <Clock className="mr-2 h-4 w-4" />
            <span>Histórico</span>
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
            globalFontSize={globalFontSize}
            onStudyMode={handleStudyMode}
            highlightedArticleNumber={highlightedArticleNumber}
            highlightedRef={highlightedRef}
          />
        </TabsContent>

        <TabsContent value="study" className="mt-0">
          <StudyMode />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <ArticleHistory />
        </TabsContent>
      </Tabs>

      <FloatingSearchButton onOpenSearch={handleOpenSearch} />
      
      {showScrollTop && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={scrollToTop} 
          className="fixed bottom-20 right-4 z-50 bg-primary/20 text-primary hover:bg-primary/30 rounded-full shadow-lg animate-fade-in"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* Adding styles for article highlighting */}
      <style>
        {`
          @keyframes highlight {
            0% { background-color: rgba(var(--primary), 0.2); }
            100% { background-color: transparent; }
          }
          
          .highlight-article {
            animation: highlight 2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default LawTabbedView;
