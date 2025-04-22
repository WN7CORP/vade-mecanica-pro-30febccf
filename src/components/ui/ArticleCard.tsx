import { useState, useEffect } from "react";
import ArticleHeader from "./article/ArticleHeader";
import HighlightTools from "./article/HighlightTools";
import ArticleContent from "./article/ArticleContent";
import CopyToast from "./article/CopyToast";
import VoiceNarration from "@/components/ui/VoiceNarration";
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
  // Estados e hooks existentes...
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
  const [showExample, setShowExample] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  // === NOVA LÓGICA DE ALINHAMENTO E ESTILO ===
  // Detecta se o número do artigo está vazio ou zerado
  const isNumberEmptyOrZero = !articleNumber || articleNumber.trim() === '0';
  // Detecta se o conteúdo é 'esquerdo'
  const isNumberLeft = articleNumber.trim().toLowerCase() === 'esquerdo';

  // Classes condicionais Tailwind para a coluna de conteúdo
  const contentWrapperClasses = isNumberEmptyOrZero
    ? 'flex items-center justify-center font-bold text-center'
    : isNumberLeft
    ? 'flex items-center justify-start font-normal text-left'
    : 'flex items-center justify-start font-normal text-left';

  // Classe fixa para a coluna de artigos: centralizado verticalmente e alinhado à esquerda, sem negrito
  const headerWrapperClasses = 'flex items-center justify-start font-normal';
  // ==============================================

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
        if (userId) logUserActivity('copy', lawName, articleNumber);
      })
      .catch(err => console.error("Erro ao copiar: ", err));
  };

  const handleColorSelect = (colorClass: string) => {
    // lógica existente...
  };

  const toggleFavorite = () => {
    // lógica existente...
  };

  const handleExplain = async (type: 'technical' | 'formal') => {
    // lógica existente...
  };

  const handleNarration = (contentType: 'article' | 'example') => {
    // lógica existente...
  };

  const handleComment = () => {
    setShowNotes(true);
    if (userId) logUserActivity('note', lawName, articleNumber);
  };

  useEffect(() => {
    if (userId) logUserActivity('read', lawName, articleNumber);
  }, [userId, lawName, articleNumber, logUserActivity]);

  return (
    <div className="card-article mb-6">
      <CopyToast show={showCopyToast} />

      {/* Coluna de artigos: centralizado verticalmente e alinhado à esquerda, sem negrito */}
      <div className={headerWrapperClasses}>
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
      </div>

      {showHighlightTools && (
        <HighlightTools
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onClose={() => setShowHighlightTools(false)}
        />
      )}

      {/* Coluna de conteúdo: classes condicionais para centralização e negrito */}
      <div className={contentWrapperClasses}>
        <ArticleContent
          content={content}
          example={example}
          showExample={showExample}
          onToggleExample={() => setShowExample(s => !s)}
          fontSize={fontSize}
          onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
          onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
          articleNumber={articleNumber}
        />
      </div>

      {explanation && (
        <div className="mt-4 mb-2 p-4 rounded-md bg-primary-900/80 border border-primary-300 shadow animate-fade-in">
          <span className="font-bold text-primary-200">Explicação:</span>
          <span className="block text-primary-50 mt-1">{explanation}</span>
        </div>
      )}

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
