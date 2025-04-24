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

interface ArticleCardProps {
  articleNumber: string;
  content?: string | { [key: string]: any };
  example?: string | { [key: string]: any };
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
  onAddToComparison?: () => void;
  onStudyMode?: () => void;
}

const ArticleCard = ({
  articleNumber,
  content = "",
  example = "",
  lawName,
  onExplainRequest,
  onAskQuestion,
  onAddToComparison,
  onStudyMode
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
  const { logUserActivity } = useUserActivity(userId);
  
  const safeContent = typeof content === 'string' ? content : (content ? JSON.stringify(content) : '');
  const safeExample = typeof example === 'string' ? example : (example ? JSON.stringify(example) : '');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);
  
  useEffect(() => {
    try {
      const favoritedArticles = localStorage.getItem('favoritedArticles');
      if (favoritedArticles) {
        const favorites = JSON.parse(favoritedArticles);
        setIsFavorite(!!favorites[`${lawName}-${articleNumber}`]);
      }
    } catch (error) {
      console.error("Erro ao carregar status de favorito:", error);
    }
  }, [lawName, articleNumber]);
  
  const copyArticle = () => {
    const textToCopy = (articleNumber && articleNumber !== "0")
      ? `Art. ${articleNumber}. ${safeContent}`
      : safeContent;
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
      const favoritedArticles = localStorage.getItem('favoritedArticles');
      const favorites = favoritedArticles ? JSON.parse(favoritedArticles) : {};
      const key = `${lawName}-${articleNumber}`;
      if (newStatus) {
        favorites[key] = { 
          articleNumber, 
          content: safeContent, 
          example: safeExample, 
          lawName,
          timestamp: new Date().toISOString()
        };
        if (userId) logUserActivity('favorite', lawName, articleNumber);
      } else {
        delete favorites[key];
      }
      localStorage.setItem('favoritedArticles', JSON.stringify(favorites));
    } catch (error) {
      console.error("Erro ao gerenciar favoritos:", error);
    }
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    setShowCustomExplanation(false);
    setCustomExplanation(null);
    setExplanationTitle("");
    let title = "";
    
    if (type === "technical") {
      title = "Explicação Técnica";
      
      if (typeof content === 'object' && content !== null && 'explicacao_tecnica' in content) {
        setCustomExplanation((content as any).explicacao_tecnica);
      } 
      else if (typeof content === 'object' && content !== null && 'explicacao tecnica' in content) {
        setCustomExplanation((content as any)["explicacao tecnica"]);
      }
      else if (example && typeof example === 'object' && 'explicacao_tecnica' in example) {
        setCustomExplanation((example as any).explicacao_tecnica);
      }
      else if (example && typeof example === 'object' && 'explicacao tecnica' in example) {
        setCustomExplanation((example as any)["explicacao tecnica"]);
      }
      else {
        if (onExplainRequest) {
          onExplainRequest(type);
          return;
        }
        setCustomExplanation("Não há explicação técnica disponível para este artigo.");
      }
    } else {
      title = "Explicação Formal";
      
      if (typeof content === 'object' && content !== null && 'explicacao_formal' in content) {
        setCustomExplanation((content as any).explicacao_formal);
      }
      else if (typeof content === 'object' && content !== null && 'explicacao formal' in content) {
        setCustomExplanation((content as any)["explicacao formal"]);
      }
      else if (example && typeof example === 'object' && 'explicacao_formal' in example) {
        setCustomExplanation((example as any).explicacao_formal);
      }
      else if (example && typeof example === 'object' && 'explicacao formal' in example) {
        setCustomExplanation((example as any)["explicacao formal"]);
      }
      else {
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
      setReadingContent({ text: safeContent, title: 'Artigo' });
      if (userId) logUserActivity('narrate', lawName, articleNumber);
    } else if (contentType === 'example') {
      setReadingContent({ text: safeExample, title: 'Exemplo' });
    } else if (contentType === 'explanation' && customExplanation) {
      setReadingContent({ 
        text: customExplanation, 
        title: `Narração: ${explanationTitle}` 
      });
    }
    setIsReading(true);
  };

  const shouldLeftAlign = articleNumber === "esquerda nas linhas";
  const shouldCenterContent = (!articleNumber || articleNumber === "0") && !shouldLeftAlign;

  return (
    <div className="card-article mb-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
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
        content={safeContent}
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 1, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 1, 12))}
        articleNumber={shouldCenterContent ? "" : articleNumber}
        centerContent={shouldCenterContent}
      />

      {!showExample && safeExample && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="w-full max-w-xs mx-auto mt-4 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-fade-in"
            onClick={() => setShowExample(true)}
          >
            Ver Exemplo
          </Button>
        </div>
      )}

      {showExample && safeExample && (
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
        <ArticleActions
          articleNumber={articleNumber}
          content={safeContent}
          onExplain={handleExplain}
          onAddComment={handleComment}
          onStartNarration={handleNarration}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onCompare={onAddToComparison}
          onStudyMode={onStudyMode}
          userId={userId}
          lawName={lawName}
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
        articleContent={safeContent}
        lawName={lawName}
      />

      {shouldLeftAlign && (
        <div className="mt-8 mb-12 animate-fade-in">
          <p
            className="mb-4 whitespace-pre-wrap transition-all duration-200 text-left text-white"
            style={{ fontSize: `${fontSize + 2}px` }}
          >
            {safeContent}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
