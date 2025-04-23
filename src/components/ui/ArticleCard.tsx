import { useState, useEffect } from "react";
import ArticleHeader from "./article/ArticleHeader";
import HighlightTools from "./article/HighlightTools";
import ArticleContent from "./article/ArticleContent";
import CopyToast from "./article/CopyToast";
import VoiceNarration from "./VoiceNarration";
import ArticleInteractions from "./ArticleInteractions";
import ArticleNotes from "./ArticleNotes";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";

interface ArticleCardProps {
  articleNumber: string;
  content: string;
  example?: string;
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
}

declare global {
  interface Window {
    currentAudio: HTMLAudioElement | null;
  }
}

if (typeof window !== 'undefined' && !window.currentAudio) {
  window.currentAudio = null;
}

const ArticleCard = ({
  articleNumber,
  content,
  example,
  lawName,
  onExplainRequest,
  onAskQuestion
}: ArticleCardProps) => {
  const [fontSize, setFontSize] = useState(15);
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
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  
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
      ? `Art. ${articleNumber}. ${content}`
      : content;
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
          content, 
          example, 
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
      else if (example && typeof example === 'object' && 'explicacao_tecnica' in example) {
        setCustomExplanation((example as any).explicacao_tecnica);
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
      else if (example && typeof example === 'object' && 'explicacao_formal' in example) {
        setCustomExplanation((example as any).explicacao_formal);
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
        return;
      }
    }
    
    if (contentType === 'article') {
      setReadingContent({ 
        text: typeof content === 'string' ? content : (content ? JSON.stringify(content) : ''), 
        title: 'Artigo' 
      });
      if (userId) logUserActivity('narrate', lawName, articleNumber);
    } else if (contentType === 'example' && example) {
      setReadingContent({ 
        text: typeof example === 'string' ? example : (example ? JSON.stringify(example) : ''), 
        title: 'Exemplo' 
      });
    } else if (contentType === 'explanation' && customExplanation) {
      setReadingContent({ text: customExplanation, title: `Narração: ${explanationTitle}` });
    }
    setIsReading(true);
  };

  const handleIncreaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  const handleDecreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
  };

  useEffect(() => {
    if (userId) {
      logUserActivity('read', lawName, articleNumber);
    }
  }, [userId, lawName, articleNumber, logUserActivity]);

  const shouldLeftAlign = articleNumber === "esquerda nas linhas";
  const shouldCenterContent = (!articleNumber || articleNumber === "0") && !shouldLeftAlign;

  const safeContent = content ?? "";
  const safeExample = example ?? "";

  return (
    <div className="card-article mb-6 hover:shadow-lg transition-all duration-300">
      <CopyToast show={showCopyToast} />
      
      <ArticleHeader
        articleNumber={shouldCenterContent ? "" : articleNumber}
        lawName={lawName}
        onCopy={copyArticle}
        onToggleHighlight={() => setShowHighlightTools(!showHighlightTools)}
        showHighlightTools={showHighlightTools}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
      
      <ArticleContent
        content={safeContent}
        example={undefined}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        articleNumber={shouldCenterContent ? "" : articleNumber}
        centerContent={shouldCenterContent}
      />

      {!showExample && safeExample && (
        <button
          className="shadow-button w-full max-w-xs mx-auto mt-2 mb-2 text-primary bg-primary/10 text-sm font-medium rounded transition-all 
          hover:bg-primary/30 active:scale-95 animate-fade-in flex justify-center items-center"
          onClick={() => setShowExample(true)}
        >
          Exibir Exemplo
        </button>
      )}
      {showExample && safeExample && (
        <div className="flex flex-col items-center mt-2 mb-2 animate-fade-in">
          <div className="px-4 py-2 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-400 text-left whitespace-pre-wrap w-full max-w-xl">
            {safeExample}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleNarration('example')}
              className="shadow-button px-3 py-1 text-primary-300 bg-primary/10 text-sm font-medium rounded transition-all 
              hover:bg-primary/30 active:scale-95 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              Narrar Exemplo
            </button>
            <button
              className="shadow-button px-3 py-1 text-primary-300 bg-primary/10 text-sm font-medium rounded transition-all 
              hover:bg-primary/30 active:scale-95"
              onClick={() => setShowExample(false)}
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {showCustomExplanation && (
        <div className="mt-5 p-4 bg-primary-900/20 border-l-4 border-primary-300 rounded animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-primary-300 font-medium">{explanationTitle}</h4>
            <button
              onClick={() => handleNarration('explanation')}
              className="shadow-button px-3 py-1 text-primary-300 bg-primary/10 text-xs font-medium rounded transition-all 
                hover:bg-primary/30 active:scale-95 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
              Narrar
            </button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap text-left">
            {customExplanation}
          </p>
        </div>
      )}

      {!shouldLeftAlign && (
        <ArticleInteractions 
          articleNumber={articleNumber}
          content={safeContent}
          example={safeExample}
          onExplain={handleExplain}
          onAddComment={handleComment}
          onStartNarration={handleNarration}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
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
        articleContent={content || ""}
        lawName={lawName}
      />

      {shouldLeftAlign && (
        <div className="mt-8 mb-12 animate-fade-in">
          <p
            className="mb-4 whitespace-pre-wrap transition-all duration-200 text-left text-white"
            style={{ fontSize: `${fontSize + 2}px` }}
          >
            {content || ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
