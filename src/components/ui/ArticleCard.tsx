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
  titulo?: string;
  explicacao_tecnica?: string;
  explicacao_formal?: string;
  exemplo1?: string;
  exemplo2?: string;
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
  onAskQuestion,
  titulo,
  explicacao_tecnica,
  explicacao_formal,
  exemplo1,
  exemplo2
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

  useEffect(() => {
    if (userId) {
      logUserActivity('read', lawName, articleNumber);
    }
  }, [userId, lawName, articleNumber, logUserActivity]);

  const [showExplicacao, setShowExplicacao] = useState<null | 'tecnica' | 'formal'>(null);
  const [showExemplo1, setShowExemplo1] = useState(false);
  const [showExemplo2, setShowExemplo2] = useState(false);

  const handleShowExplicacao = (type: 'tecnica' | 'formal') => {
    if (showExplicacao === type) {
      setShowExplicacao(null);
    } else {
      setShowExplicacao(type);
    }
  };

  return (
    <div className="card-article mb-6">
      <CopyToast show={showCopyToast} />

      {titulo && (
        <div className="mb-2 text-primary-400 font-semibold text-lg">{titulo}</div>
      )}

      <ArticleHeader
        articleNumber={articleNumber}
        lawName={lawName}
        onCopy={copyArticle}
        onToggleHighlight={() => setShowHighlightTools(!showHighlightTools)}
        onExplainRequest={undefined}
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
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
        articleNumber={articleNumber}
      />

      {(explicacao_tecnica || explicacao_formal) && (
        <div className="flex gap-2 mb-4">
          {explicacao_tecnica && (
            <button
              className={`px-3 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/30 transition ${showExplicacao === 'tecnica' ? 'bg-primary/40' : ''}`}
              onClick={() => handleShowExplicacao('tecnica')}
            >
              Ver Explicação Técnica
            </button>
          )}
          {explicacao_formal && (
            <button
              className={`px-3 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/30 transition ${showExplicacao === 'formal' ? 'bg-primary/40' : ''}`}
              onClick={() => handleShowExplicacao('formal')}
            >
              Ver Explicação Formal
            </button>
          )}
        </div>
      )}
      {showExplicacao === 'tecnica' && explicacao_tecnica && (
        <div className="p-3 mb-2 rounded bg-primary-900/20 border border-primary-600 text-primary-100 animate-fade-in">
          <h4 className="font-medium text-primary-200 mb-1">Explicação Técnica</h4>
          <p>{explicacao_tecnica}</p>
        </div>
      )}
      {showExplicacao === 'formal' && explicacao_formal && (
        <div className="p-3 mb-2 rounded bg-primary-900/20 border border-primary-600 text-primary-100 animate-fade-in">
          <h4 className="font-medium text-primary-200 mb-1">Explicação Formal</h4>
          <p>{explicacao_formal}</p>
        </div>
      )}

      {(exemplo1 || exemplo2) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {exemplo1 && (
            <>
              <button
                className={`px-3 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/30 transition`}
                onClick={() => setShowExemplo1((v) => !v)}
              >
                {showExemplo1 ? "Ocultar Exemplo 1" : "Ver Exemplo 1"}
              </button>
              {showExemplo1 && (
                <div className="w-full mt-2 p-3 bg-primary-50/10 border-l-4 border-primary-200 rounded animate-fade-in">
                  <h4 className="text-primary-300 mb-2 font-medium">Exemplo 1:</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">{exemplo1}</p>
                </div>
              )}
            </>
          )}
          {exemplo2 && (
            <>
              <button
                className={`px-3 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/30 transition`}
                onClick={() => setShowExemplo2((v) => !v)}
              >
                {showExemplo2 ? "Ocultar Exemplo 2" : "Ver Exemplo 2"}
              </button>
              {showExemplo2 && (
                <div className="w-full mt-2 p-3 bg-primary-50/10 border-l-4 border-primary-200 rounded animate-fade-in">
                  <h4 className="text-primary-300 mb-2 font-medium">Exemplo 2:</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">{exemplo2}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ArticleInteractions 
        articleNumber={articleNumber}
        content={content}
        example={undefined}
        onExplain={() => {}}
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
