import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, Clock, ArrowUp, BookText, FileText } from "lucide-react";
import ArticleList from "@/components/law/ArticleList";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import SearchBar from "@/components/ui/SearchBar";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
import ComparisonTool from "@/components/law/ComparisonTool";
import { Article, searchAcrossAllLaws, normalizeArticleNumber } from "@/services/lawService";
import StudyMode from "@/pages/StudyMode";
import LegalTimeline from "@/pages/LegalTimeline";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ArticleHistory from "./ArticleHistory";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";

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
  const [searchInput, setSearchInput] = useState("");
  const [searchPreviews, setSearchPreviews] = useState<{
    lawName: string;
    lawCategory: 'codigo' | 'estatuto';
    article?: string;
    content: string;
    previewType: 'article' | 'term';
    category?: 'codigo' | 'estatuto';
  }[]>([]);
  
  const debouncedSearchInput = useDebounce(searchInput, 300);
  
  const {
    filteredArticles,
    isLoading,
    isSearching,
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

  // Determine law category for styling
  const getLawCategory = (name: string | undefined): 'codigo' | 'estatuto' | 'outros' => {
    if (!name) return 'outros';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('código') || lowerName.includes('consolidação') || lowerName === 'constituição federal') {
      return 'codigo';
    } else if (lowerName.includes('estatuto')) {
      return 'estatuto';
    }
    return 'outros';
  };

  const lawCategory = getLawCategory(lawName);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (highlightedArticleNumber && filteredArticles.length > 0 && !isLoading) {
      const articleToHighlight = filteredArticles.find(article => {
        if (!article.numero) return false;
        return normalizeArticleNumber(article.numero) === normalizeArticleNumber(highlightedArticleNumber);
      });
      
      if (articleToHighlight) {
        setTimeout(() => {
          if (highlightedRef.current) {
            highlightedRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            
            toast({
              title: `Artigo ${articleToHighlight.numero}`,
              description: "Artigo encontrado e destacado",
              duration: 3000
            });
          }
        }, 500);
      }
    }
  }, [highlightedArticleNumber, filteredArticles, isLoading]);
  
  // Modified to search only within current law
  useEffect(() => {
    const loadSearchPreviews = async () => {
      if (debouncedSearchInput.length < 2) {
        setSearchPreviews([]);
        return;
      }
      
      try {
        // Instead of searching across all laws, only search in current law
        if (lawName) {
          // Get articles from current law that match the search term
          const results = await searchAcrossAllLaws(debouncedSearchInput, [lawName]);
          
          if (results && results.length > 0) {
            const currentLawResult = results[0]; // There should only be one law result
            
            const formattedPreviews = currentLawResult.articles.map(article => ({
              lawName: currentLawResult.lawName,
              lawCategory: currentLawResult.lawCategory,
              article: article.numero,
              content: article.conteudo,
              previewType: 'article' as const,
              category: currentLawResult.lawCategory
            }));
            
            setSearchPreviews(formattedPreviews.slice(0, 10)); // Limit to 10 previews
          } else {
            setSearchPreviews([]);
          }
        }
      } catch (error) {
        console.error("Error fetching search previews:", error);
        setSearchPreviews([]);
      }
    };
    
    loadSearchPreviews();
  }, [debouncedSearchInput, lawName]);

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

  // Fix here - remove the second parameter
  const handleArticleSearch = (term: string) => {
    if (!term) return;
    
    console.log("Iniciando busca por artigo:", term);
    handleSearch(term);
    
    setTimeout(() => {
      if (!filteredArticles || filteredArticles.length === 0) {
        console.log("Nenhum artigo encontrado para:", term);
        return;
      }
      
      const article = filteredArticles.find(article => {
        if (!article.numero) return false;
        return normalizeArticleNumber(article.numero) === normalizeArticleNumber(term);
      });

      if (article) {
        console.log("Artigo encontrado:", article.numero);
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
      }
    }, 500);
  };

  const handlePreviewClick = (preview: typeof searchPreviews[0]) => {
    if (!preview.article) return;

    if (preview.lawName !== lawName) {
      navigate(`/lei/${encodeURIComponent(preview.lawName)}?artigo=${preview.article}`);
    } else {
      handleArticleSearch(preview.article);
    }
  };
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Get icon based on law category
  const getCategoryIcon = () => {
    switch (lawCategory) {
      case 'codigo':
        return <BookOpen className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'estatuto':
        return <FileText className="mr-2 h-4 w-4 text-estatuto-light dark:text-estatuto-dark" />;
      default:
        return <BookText className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-20 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg mb-6 ${
          lawCategory === 'codigo' ? 'border-l-4 border-blue-500' : 
          lawCategory === 'estatuto' ? 'border-l-4 border-estatuto-light dark:border-estatuto-dark' :
          'border-l-4 border-gray-300'
        }`}
      >
        <SearchBar 
          onSearch={handleArticleSearch}
          initialValue={searchTerm}
          placeholder={`Buscar no ${lawCategory === 'codigo' ? 'Código' : lawCategory === 'estatuto' ? 'Estatuto' : 'Documento'}...`}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onInputChange={handleSearchInputChange}
          showInstantResults
          searchPreviews={searchPreviews}
          showPreviews={searchInput.length >= 2}
          onPreviewClick={handlePreviewClick}
          categoryIcon={getCategoryIcon()}
          lawCategory={lawCategory}
        />
      </motion.div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className={`w-full mb-4 ${
          lawCategory === 'codigo' ? 'bg-blue-50 dark:bg-blue-950/20' : 
          lawCategory === 'estatuto' ? 'bg-green-50 dark:bg-green-950/20' :
          ''
        }`}>
          <TabsTrigger value="articles" className="w-full">
            {getCategoryIcon()}
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
            isLoading={isLoading || isSearching} 
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
            onStudyMode={handleStudyMode}
            globalFontSize={globalFontSize}
            highlightedArticleNumber={highlightedArticleNumber}
            highlightedRef={highlightedRef}
            lawCategory={lawCategory}
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
