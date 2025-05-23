
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Plus } from "lucide-react";
import ArticleHeader from "./article/ArticleHeader";
import ArticleContent from "./article/ArticleContent";
import { ArticleActions } from "./article/ArticleActions";
import { ArticleExample } from "./article/ArticleExample";
import { ArticleCustomExplanation } from "./article/ArticleCustomExplanation";
import CopyToast from "./article/CopyToast";
import VoiceNarration from "./VoiceNarration";
import ArticleNotes from "./ArticleNotes";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import ArticleInteractions from "./ArticleInteractions";
import { toast } from "@/hooks/use-toast";

interface ArticleCardProps {
  articleNumber: string;
  content?: string | { [key: string]: any };
  example?: string | { [key: string]: any };
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
  onAddToComparison?: () => void;
  onStudyMode?: () => void;
  globalFontSize?: number;
}

const ArticleCard = ({ 
  articleNumber,
  content = "",
  example = "",
  lawName,
  onExplainRequest,
  onAskQuestion,
  onAddToComparison,
  onStudyMode,
  globalFontSize 
}: ArticleCardProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [isReading, setIsReading] = useState(false);
  const [readingContent, setReadingContent] = useState<{text: string, title: string}>({text: '', title: ''});
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [showExample, setShowExample] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<string | null>(null);
  const [showCustomExplanation, setShowCustomExplanation] = useState(false);
  const [explanationTitle, setExplanationTitle] = useState("");
  const [hasCompareSelection, setHasCompareSelection] = useState(false);
  const { logUserActivity } = useUserActivity(userId);
  
  const getReadableContent = (data: string | { [key: string]: any }): string => {
    if (data === null || data === undefined) return "";
    if (typeof data === 'string') return data;
    
    try {
      if (typeof data === 'object') {
        return data.artigo || data.conteudo || data.content || 
               (Object.values(data).find(val => typeof val === 'string' && val.length > 10) as string) || 
               "Conteúdo não disponível";
      }
      return String(data);
    } catch (err) {
      console.error("Error extracting readable content:", err);
      return "Erro ao processar conteúdo";
    }
  };

  const safeContent = typeof content === 'string' ? content : 
    (content ? typeof content === 'object' ? getReadableContent(content) : String(content) : "");
  const safeExample = typeof example === 'string' ? example : 
    (example ? typeof example === 'object' ? getReadableContent(example) : String(example) : "");
  const hasExample = safeExample && safeExample !== '""' && safeExample !== '{}';

  const displayContent = typeof content === 'object' ? getReadableContent(content) : safeContent;

  useEffect(() => {
    if (globalFontSize) {
      setFontSize(globalFontSize);
    }
  }, [globalFontSize]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);
  
  // Load favorite status when the component mounts or when lawName/articleNumber changes
  useEffect(() => {
    try {
      const checkFavoriteStatus = () => {
        const favoritedArticles = localStorage.getItem('favoritedArticles');
        if (favoritedArticles) {
          const favorites = JSON.parse(favoritedArticles);
          const key = `${lawName}-${articleNumber}`;
          setIsFavorite(!!favorites[key]);
        }
      };
      
      checkFavoriteStatus();
      
      // Add event listener for storage changes to update favorites in real-time across tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'favoritedArticles') {
          checkFavoriteStatus();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error("Erro ao carregar status de favorito:", error);
    }
  }, [lawName, articleNumber]);
  
  const copyArticle = () => {
    const textToCopy = (articleNumber && articleNumber !== "0")
      ? `Art. ${articleNumber}. ${displayContent}`
      : displayContent;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
        if (userId) logUserActivity('copy', lawName, articleNumber);
      })
      .catch(err => console.error("Erro ao copiar: ", err));
  };
  
  const toggleFavorite = () => {
    try {
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      
      // Get current favorites from localStorage
      const favoritedArticles = localStorage.getItem('favoritedArticles');
      const favorites = favoritedArticles ? JSON.parse(favoritedArticles) : {};
      
      const key = `${lawName}-${articleNumber}`;
      
      if (newStatus) {
        // Add to favorites
        favorites[key] = { 
          articleNumber, 
          content: safeContent, 
          example: safeExample, 
          lawName,
          timestamp: new Date().toISOString()
        };
        
        if (userId) logUserActivity('favorite', lawName, articleNumber);
      } else {
        // Remove from favorites
        delete favorites[key];
      }
      
      // Save updated favorites back to localStorage
      localStorage.setItem('favoritedArticles', JSON.stringify(favorites));
      
      // Dispatch a custom event to notify other components
      const event = new Event('favoritesUpdated');
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Erro ao gerenciar favoritos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seus favoritos",
        variant: "destructive"
      });
    }
  };

  const getExplanationFromContent = (
    content: any, 
    example: any, 
    possibleKeys: string[]
  ): string | null => {
    if (typeof content === 'object' && content !== null) {
      for (const key of possibleKeys) {
        if (key in content && content[key]) {
          return typeof content[key] === 'string' ? content[key] : getReadableContent(content[key]);
        }
      }
    }
    
    if (typeof example === 'object' && example !== null) {
      for (const key of possibleKeys) {
        if (key in example && example[key]) {
          return typeof example[key] === 'string' ? example[key] : getReadableContent(example[key]);
        }
      }
    }
    
    return null;
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    setShowCustomExplanation(false);
    setCustomExplanation(null);
    setExplanationTitle("");
    let title = "";
    
    if (type === "technical") {
      title = "Explicação Técnica";
      
      const technicalExplanation = getExplanationFromContent(content, example, [
        'explicacao_tecnica',
        'explicacao tecnica'
      ]);
      
      if (technicalExplanation) {
        setCustomExplanation(technicalExplanation);
      } else {
        if (onExplainRequest) {
          onExplainRequest(type);
          return;
        }
        setCustomExplanation("Não há explicação técnica disponível para este artigo.");
      }
    } else {
      title = "Explicação Formal";
      
      const formalExplanation = getExplanationFromContent(content, example, [
        'explicacao_formal',
        'explicacao formal'
      ]);
      
      if (formalExplanation) {
        setCustomExplanation(formalExplanation);
      } else {
        if (onExplainRequest) {
          onExplainRequest(type);
          return;
        }
        setCustomExplanation("Não há explicação formal disponível para este artigo.");
      }
    }
    
    setExplanationTitle(title);
    setShowCustomExplanation(true);
    
    if (userId) {
      logUserActivity('explain', lawName, articleNumber);
    }
  };

  const handleShowExample = () => {
    setShowExample(true);
    if (userId) logUserActivity('view_example', lawName, articleNumber);
  };

  const handleComment = () => {
    setShowNotes(true);
    if (userId) logUserActivity('note_view', lawName, articleNumber);
  };
  
  const handleNarration = (contentType: 'article' | 'example' | 'explanation') => {
    if (isReading) {
      if ((contentType === 'article' && readingContent.title === 'Artigo') ||
          (contentType === 'example' && readingContent.title === 'Exemplo') ||
          (contentType === 'explanation' && readingContent.title.includes('Explicação'))) {
        setIsReading(false);
        if (window.currentAudio) {
          window.currentAudio.pause();
          window.currentAudio.currentTime = 0;
        }
        return;
      }
    }
    
    if (contentType === 'article') {
      setReadingContent({ text: displayContent, title: 'Artigo' });
      if (userId) logUserActivity('narrate', lawName, articleNumber);
    } else if (contentType === 'example') {
      const exampleText = typeof example === 'object' ? getReadableContent(example) : safeExample;
      setReadingContent({ text: exampleText, title: 'Exemplo' });
    } else if (contentType === 'explanation' && customExplanation) {
      setReadingContent({ 
        text: customExplanation, 
        title: `Narração: ${explanationTitle}` 
      });
    }
    setIsReading(true);
  };

  const handleCompare = () => {
    if (onAddToComparison) {
      setHasCompareSelection(true);
      onAddToComparison();
    }
  };

  const shouldLeftAlign = articleNumber === "esquerda nas linhas";
  const shouldCenterContent = (!articleNumber || articleNumber === "0") && !shouldLeftAlign;

  return (
    <div 
      id={`article-${articleNumber}`}
      className="card-article mb-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
    >
      <CopyToast show={showCopyToast} />
      
      <ArticleHeader
        articleNumber={shouldCenterContent ? "" : articleNumber}
        lawName={lawName}
        onCopy={copyArticle}
        onToggleHighlight={() => {}}
        showHighlightTools={false}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
      
      <ArticleContent
        content={displayContent}
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 1, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 1, 12))}
        articleNumber={shouldCenterContent ? "" : articleNumber}
        centerContent={shouldCenterContent}
      />

      {!showExample && hasExample && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="max-w-xs mx-auto mt-3 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-fade-in"
            onClick={handleShowExample}
          >
            Ver Exemplo
          </Button>
        </div>
      )}

      {showExample && hasExample && (
        <ArticleExample
          example={safeExample}
          onClose={() => setShowExample(false)}
          onNarrate={() => handleNarration('example')}
        />
      )}

      {showCustomExplanation && customExplanation && (
        <ArticleCustomExplanation
          title={explanationTitle}
          explanation={customExplanation}
          onNarrate={() => handleNarration('explanation')}
        />
      )}

      {!shouldLeftAlign && (
        <ArticleInteractions
          articleNumber={articleNumber}
          content={displayContent}
          example={example}
          onExplain={handleExplain}
          onAddComment={handleComment}
          onStartNarration={() => handleNarration('article')}
          onShowExample={safeExample ? handleShowExample : undefined}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onCompare={onAddToComparison ? handleCompare : undefined}
          onStudyMode={onStudyMode}
          hasCompareSelection={hasCompareSelection}
        />
      )}

      <VoiceNarration
        text={readingContent.text}
        title={readingContent.title}
        isActive={isReading}
        onComplete={() => setIsReading(false)}
        onStop={() => setIsReading(false)}
      />

      <ArticleNotes
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        articleNumber={articleNumber}
        articleContent={displayContent}
        lawName={lawName}
      />

      {shouldLeftAlign && (
        <div className="mt-6 mb-8 animate-fade-in">
          <p
            className="mb-4 whitespace-pre-wrap transition-all duration-200 text-left text-white"
            style={{ fontSize: `${fontSize + 2}px` }}
          >
            {displayContent}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
