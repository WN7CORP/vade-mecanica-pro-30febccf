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
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [showExample, setShowExample] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<string | null>(null);
  const [showCustomExplanation, setShowCustomExplanation] = useState(false);
  const [explanationTitle, setExplanationTitle] = useState("");
  const { logUserActivity } = useUserActivity(userId);
  
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
  
  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = colorClass;
      try {
        range.surroundContents(span);
        if (userId) logUserActivity('highlight', lawName, articleNumber);
      } catch (e) {
        console.error("Erro ao destacar texto: ", e);
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
      selection.removeAllRanges();
    }
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
      
      if ((content as any)?.explicacao_tecnica) {
        setCustomExplanation((content as any).explicacao_tecnica);
      } 
      else if (example && (example as any)?.explicacao_tecnica) {
        setCustomExplanation((example as any).explicacao_tecnica);
      }
      else {
        setCustomExplanation("Não há explicação técnica disponível para este artigo.");
      }
    } else {
      title = "Explicação Formal";
      
      if ((content as any)?.explicacao_formal) {
        setCustomExplanation((content as any).explicacao_formal);
      }
      else if (example && (example as any)?.explicacao_formal) {
        setCustomExplanation((example as any).explicacao_formal);
      }
      else {
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
  
  const handleNarration = (contentType: 'article' | 'example') => {
    if (isReading && contentType === 'article' && readingContent.title === 'Artigo') {
      setIsReading(false);
      return;
    }
    if (isReading && contentType === 'example' && readingContent.title === 'Exemplo') {
      setIsReading(false);
      return;
    }
    if (contentType === 'article') {
      setReadingContent({ text: content, title: 'Artigo' });
      if (userId) logUserActivity('narrate', lawName, articleNumber);
    } else if (contentType === 'example' && example) {
      setReadingContent({ text: example, title: 'Exemplo' });
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

  return (
    <div className="card-article mb-6">
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
      
      {showHighlightTools && (
        <HighlightTools
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onClose={() => setShowHighlightTools(false)}
        />
      )}
      
      <ArticleContent
        content={content}
        example={undefined}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
        articleNumber={shouldCenterContent ? "" : articleNumber}
        centerContent={shouldCenterContent}
      />

      {!showExample && example && (
        <button
          className="shadow-button w-full max-w-xs mx-auto mt-2 mb-2 text-primary bg-primary/10 text-sm font-medium rounded transition-all 
          hover:bg-primary/30 active:scale-95 animate-fade-in flex justify-center items-center"
          onClick={() => setShowExample(true)}
        >
          Exibir Exemplo
        </button>
      )}
      {showExample && example && (
        <div className="flex flex-col items-center mt-2 mb-2 animate-fade-in">
          <div className="px-4 py-2 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-400 text-left whitespace-pre-wrap w-full max-w-xl">
            {example}
          </div>
          <button
            className="shadow-button w-full max-w-xs mx-auto mt-3 text-primary bg-primary/10 text-sm font-medium rounded transition-all 
            hover:bg-primary/30 active:scale-95"
            onClick={() => setShowExample(false)}
          >
            Voltar
          </button>
        </div>
      )}

      {showCustomExplanation && (
        <div className="mt-5 p-4 bg-primary-900/20 border-l-4 border-primary-300 rounded animate-fade-in">
          <h4 className="text-primary-300 mb-2 font-medium">{explanationTitle}</h4>
          <p className="text-gray-300 whitespace-pre-wrap text-left">
            {customExplanation}
          </p>
        </div>
      )}

      {!shouldLeftAlign && (
        <ArticleInteractions 
          articleNumber={articleNumber}
          content={content}
          example={example}
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
        articleContent={content}
        lawName={lawName}
      />

      {shouldLeftAlign && (
        <div className="mt-8 mb-12 animate-fade-in">
          <p
            className="mb-4 whitespace-pre-wrap transition-all duration-200 text-left text-white"
            style={{ fontSize: `${fontSize + 2}px` }}
          >
            {content}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
