
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import { FloatingSearchButton } from "@/components/ui/FloatingSearchButton";
import LawHeader from "@/components/law/LawHeader";
import ArticleList from "@/components/law/ArticleList";
import ComparisonTool from "@/components/law/ComparisonTool";
import { useLawArticles } from "@/hooks/use-law-articles";
import { useAIExplanation } from "@/hooks/use-ai-explanation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Article } from "@/services/lawService";
import { BookOpen, Timer, BarChart2, GraduationCap, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const LawView = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [articlesToCompare, setArticlesToCompare] = useState<Article[]>([]);
  const [studySessionActive, setStudySessionActive] = useState(false);
  const [studyTimeMinutes, setStudyTimeMinutes] = useState(0);
  
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
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    return () => {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    if (studySessionActive) {
      timer = window.setInterval(() => {
        setStudyTimeMinutes(prev => prev + 1);
      }, 60000); // 1 minute
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [studySessionActive]);

  const handleAskQuestion = (article: Article) => {
    if (!lawName) return;
    setSelectedArticle(article);
    setShowChat(true);
  };

  const handleExplain = async (article: Article, type: 'technical' | 'formal') => {
    setSelectedArticle(article);
    await handleExplainArticle(article, type);
  };

  const handleAddToComparison = (article: Article) => {
    // Limite máximo de 2 artigos para comparação
    if (articlesToCompare.length >= 2) {
      // Remover o primeiro e adicionar o novo
      setArticlesToCompare([articlesToCompare[1], article]);
      toast({
        description: "Comparando apenas os 2 artigos mais recentes",
      });
      return;
    }
    
    // Verificar se o artigo já está na comparação
    if (!articlesToCompare.find(a => a.id === article.id)) {
      setArticlesToCompare([...articlesToCompare, article]);
      
      toast({
        description: articlesToCompare.length === 0 
          ? "Artigo adicionado à comparação. Adicione mais um para comparar." 
          : "Artigos prontos para comparação.",
      });
      
      if (articlesToCompare.length === 1) {
        setShowComparison(true);
      }
    }
  };

  const handleStudyMode = () => {
    if (lawName) {
      navigate(`/estudar/${lawName}`);
    }
  };

  const handleViewTimeline = () => {
    if (lawName) {
      navigate(`/timeline/${lawName}`);
    }
  };

  const toggleStudySession = () => {
    setStudySessionActive(!studySessionActive);
    
    toast({
      description: !studySessionActive 
        ? "Modo de estudo ativado. Seu tempo será registrado." 
        : `Sessão de estudo encerrada. Tempo total: ${studyTimeMinutes} minutos.`,
    });
  };

  return (
    <div 
      style={{ background: '#131620' }} 
      className="flex flex-col min-h-screen px-[9px]"
    >
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-20">
        <div className="space-y-4">
          <LawHeader lawName={lawName} />
          
          {/* Botões de ações adicionais */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                onClick={handleStudyMode}
              >
                <GraduationCap size={16} />
                <span className="hidden sm:inline">Modo Estudo</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                onClick={handleViewTimeline}
              >
                <History size={16} />
                <span className="hidden sm:inline">Alterações</span>
              </Button>
              
              <Button
                variant={studySessionActive ? "default" : "outline"}
                size="sm"
                className={`${studySessionActive 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"} flex items-center gap-1`}
                onClick={toggleStudySession}
              >
                <Timer size={16} />
                <span className="hidden sm:inline">{studySessionActive ? "Parar" : "Iniciar"} Sessão</span>
                {studySessionActive && <span className="text-xs ml-1">({studyTimeMinutes}m)</span>}
              </Button>
            </div>
            
            <div className="flex items-center">
              {articlesToCompare.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                  onClick={() => setShowComparison(true)}
                >
                  <BarChart2 size={16} />
                  <span className="hidden sm:inline">Comparar</span>
                  <span className="text-xs ml-1">({articlesToCompare.length})</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className={`transition-all duration-300 ${showSearchBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <SearchBar onSearch={handleSearch} initialValue={searchTerm} placeholder="Buscar artigo específico..." />
          </div>
          
          {!isLoading && filteredArticles.length > 0 && (
            <div className="text-sm text-gray-400">
              {searchTerm ? `${filteredArticles.length} ${filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}` : ''}
            </div>
          )}
          
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
            onExplainArticle={handleExplain} 
            onAskQuestion={handleAskQuestion} 
            onCloseChat={() => setShowChat(false)} 
            onCloseExplanation={() => setShowExplanation(false)}
            onAddToComparison={handleAddToComparison}
            onStudyMode={handleStudyMode}
          />

          <FloatingSearchButton onOpenSearch={handleOpenSearch} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LawView;
