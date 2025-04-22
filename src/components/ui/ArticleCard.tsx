
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
  const [fontSize, setFontSize] = useState(16);
  const [isReading, setIsReading] = useState(false);
  const [readingContent, setReadingContent] = useState<{text: string, title: string}>({text: '', title: ''});
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [showExample, setShowExample] = useState(false);
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
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
        
        if (userId) {
          logUserActivity('copy', lawName, articleNumber);
        }
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
        
        if (userId) {
          logUserActivity('highlight', lawName, articleNumber);
        }
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
        
        if (userId) {
          logUserActivity('favorite', lawName, articleNumber);
        }
      } else {
        delete favorites[key];
      }
      
      localStorage.setItem('favoritedArticles', JSON.stringify(favorites));
    } catch (error) {
      console.error("Erro ao gerenciar favoritos:", error);
    }
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    if (onExplainRequest) {
      onExplainRequest(type);
      
      if (userId) {
        logUserActivity('explain', lawName, articleNumber);
      }
    }
  };

  const handleComment = () => {
    setShowNotes(true);
    
    if (userId) {
      logUserActivity('note_view', lawName, articleNumber);
    }
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
      setReadingContent({
        text: content,
        title: 'Artigo'
      });
      
      if (userId) {
        logUserActivity('narrate', lawName, articleNumber);
      }
    } else if (contentType === 'example' && example) {
      setReadingContent({
        text: example,
        title: 'Exemplo'
      });
    }
    
    setIsReading(true);
  };

  const handleShowExample = () => {
    setShowExample(!showExample);
    
    if (userId && !showExample) {
      logUserActivity('view_example', lawName, articleNumber);
    }
  };

  useEffect(() => {
    if (userId) {
      logUserActivity('read', lawName, articleNumber);
    }
  }, [userId, lawName, articleNumber, logUserActivity]);

  const isContentOnly = !articleNumber || articleNumber === "0";

  return (
    <div className="mb-6">
      <CopyToast show={showCopyToast} />

      <ArticleHeader
        articleNumber={articleNumber}
        lawName={lawName}
        onCopy={copyArticle}
        onToggleHighlight={() => setShowHighlightTools(!showHighlightTools)}
        onExplainRequest={handleExplain}
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

      <div
        className={
          isContentOnly
            ? "flex flex-col items-center justify-center my-8"
            : ""
        }
      >
        <ArticleContent
          content={content}
          example={undefined}
          fontSize={fontSize}
          onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
          onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
          articleNumber={articleNumber}
          isContentOnly={isContentOnly}
        />

        {example && (
          <button
            onClick={() => handleShowExample()}
            className="mt-3 mb-2 text-primary-300 hover:underline transition-all px-4 py-2 rounded"
          >
            {showExample ? "Ocultar Exemplo" : "Ver Exemplo"}
          </button>
        )}

        {showExample && example && (
          <div className="mt-4 w-full max-w-xl mx-auto">
            <div className="p-4 bg-primary-50/10 border-l-4 border-primary-200 rounded">
              <h4 className="text-primary-300 mb-2 font-medium">Exemplo:</h4>
              <p
                className="text-gray-400 whitespace-pre-wrap text-left"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: "normal",
                }}
              >
                {example}
              </p>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default ArticleCard;
