
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

// Novo: adicionar campos extras
interface ArticleCardProps {
  articleNumber: string;
  content: string;
  example?: string;
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
  artigo?: string; // novo campo
  explicacaoTecnica?: string; // novo campo
  explicacaoFormal?: string; // novo campo
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
  artigo,
  explicacaoTecnica,
  explicacaoFormal
}: ArticleCardProps) => {
  // Garante que articleNumber não seja null/undefined
  const safeArticleNumber = articleNumber || '';

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
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // === NOVA LÓGICA DE ALINHAMENTO E ESTILO ===
  // Se número do artigo estiver zerado/ausente
  const isNumberEmptyOrZero = !safeArticleNumber || safeArticleNumber.trim() === '0';
  const isNumberLeft = safeArticleNumber.trim().toLowerCase() === 'esquerdo';

  const contentWrapperClasses = isNumberEmptyOrZero
    ? 'flex items-center justify-center font-bold text-center'
    : isNumberLeft
    ? 'flex items-center justify-start font-normal text-left'
    : 'flex items-center justify-start font-normal text-left';

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
        setIsFavorite(!!favorites[`${lawName}-${safeArticleNumber}`]);
      }
    } catch (error) {
      console.error("Erro ao carregar status de favorito:", error);
    }
  }, [lawName, safeArticleNumber]);

  const copyArticle = () => {
    const textToCopy = isNumberEmptyOrZero && artigo
      ? artigo
      : `Art. ${safeArticleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
        if (userId) logUserActivity('copy', lawName, safeArticleNumber);
      })
      .catch(err => console.error("Erro ao copiar: ", err));
  };

  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
  };

  const toggleFavorite = () => {
    try {
      const favoritedArticles = localStorage.getItem('favoritedArticles') || '{}';
      const favorites = JSON.parse(favoritedArticles);
      const key = `${lawName}-${safeArticleNumber}`;
      if (favorites[key]) {
        delete favorites[key];
      } else {
        favorites[key] = true;
      }
      localStorage.setItem('favoritedArticles', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);

      if (userId) {
        logUserActivity(isFavorite ? 'unfavorite' : 'favorite', lawName, safeArticleNumber);
      }
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
    }
  };

  // NOVO: buscar explicação estática das props, com loading animado
  const handleExplain = async (type: 'technical' | 'formal') => {
    setIsLoadingExplanation(true);
    setExplanation(null);
    setTimeout(() => {
      if (type === 'technical' && explicacaoTecnica) {
        setExplanation(explicacaoTecnica);
      } else if (type === 'formal' && explicacaoFormal) {
        setExplanation(explicacaoFormal);
      } else {
        setExplanation('Explicação não disponível para este artigo.');
      }
      setIsLoadingExplanation(false);
    }, 1300); // Breve delay para animar "Gerando explicação..."
  };

  const handleNarration = (contentType: 'article' | 'example') => {
    const contentToRead = contentType === 'article'
      ? (isNumberEmptyOrZero && artigo ? artigo : content)
      : example || '';
    const titleToRead = contentType === 'article'
      ? (isNumberEmptyOrZero && artigo
        ? `Artigo Especial - ${lawName}`
        : `Artigo ${safeArticleNumber} - ${lawName}`)
      : `Exemplo do Artigo ${safeArticleNumber}`;

    setReadingContent({
      text: contentToRead,
      title: titleToRead
    });
    setIsReading(true);

    if (userId) {
      logUserActivity('narration', lawName, safeArticleNumber);
    }
  };

  const handleComment = () => {
    setShowNotes(true);
    if (userId) logUserActivity('note', lawName, safeArticleNumber);
  };

  useEffect(() => {
    if (userId) logUserActivity('read', lawName, safeArticleNumber);
  }, [userId, lawName, safeArticleNumber, logUserActivity]);

  return (
    <div className="card-article mb-6">
      <CopyToast show={showCopyToast} />

      {/* Header da coluna do artigo */}
      <div className={headerWrapperClasses}>
        <ArticleHeader
          articleNumber={safeArticleNumber}
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

      {/* Coluna de conteúdo ou artigo, centralizado se sem número */}
      <div className={contentWrapperClasses}>
        {isNumberEmptyOrZero && artigo ? (
          <div className="w-full flex flex-col items-center" style={{ background: "transparent" }}>
            <div className="w-full">
              <p
                className="mb-4 whitespace-pre-wrap font-bold text-center"
                style={{
                  fontSize: `${fontSize + 2}px`,
                  color: "#F4F4F5"
                }}
              >
                {artigo}
              </p>
            </div>
          </div>
        ) : (
          <ArticleContent
            content={content}
            example={example}
            showExample={showExample}
            onToggleExample={() => setShowExample(s => !s)}
            fontSize={fontSize}
            onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
            onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
            articleNumber={safeArticleNumber}
          />
        )}
      </div>

      {/* Explicação exibida, com animação durante carregamento */}
      {(isLoadingExplanation || explanation) && (
        <div className="mt-4 mb-2 p-4 rounded-md bg-primary-900/80 border border-primary-300 shadow animate-fade-in">
          {isLoadingExplanation ? (
            <span className="font-bold text-primary-200 animate-pulse">Gerando explicação...</span>
          ) : (
            <>
              <span className="font-bold text-primary-200">Explicação:</span>
              <span className="block text-primary-50 mt-1">{explanation}</span>
            </>
          )}
        </div>
      )}

      {/* Atenção: se artigo sem número/nulo, não mostra exemplo */}
      <ArticleInteractions
        articleNumber={safeArticleNumber}
        content={content}
        example={!isNumberEmptyOrZero ? example : undefined}
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
        articleNumber={safeArticleNumber}
        articleContent={content}
        lawName={lawName}
      />
    </div>
  );
};

export default ArticleCard;

