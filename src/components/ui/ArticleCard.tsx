
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
  const [showExample, setShowExample] = useState(false); // PARA EXIBIR O EXEMPLO
  const [customExplanation, setCustomExplanation] = useState<string | null>(null); // EXPLICAÇÃO DIRETO DO BANCO
  const [showCustomExplanation, setShowCustomExplanation] = useState(false);
  const [explanationTitle, setExplanationTitle] = useState(""); // 'Técnica' ou 'Formal'
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

  // Novo: busca explicação direto do artigo
  const handleExplain = (type: 'technical' | 'formal') => {
    setShowCustomExplanation(false);
    setCustomExplanation(null);
    setExplanationTitle("");
    let explanation = null;
    let title = "";
    if (type === "technical") {
      explanation = (content as any)?.explicacao_tecnica || (example as any)?.explicacao_tecnica;
      title = "Explicação Técnica";
    } else {
      explanation = (content as any)?.explicacao_formal || (example as any)?.explicacao_formal;
      title = "Explicação Formal";
    }
    // Se ArticleCard recebeu as propriedades, vão estar como props, não dentro do content
    // Então vamos esperar essas props serem repassadas pelo ArticleList
    // Mas por via das dúvidas, tentamos os dois padrões
    if ((type === "technical" && (content as any).explicacao_tecnica) ||
        (type === "formal" && (content as any).explicacao_formal)) {
      explanation = (content as any)[type === "technical" ? "explicacao_tecnica" : "explicacao_formal"];
    } else if (
      type === "technical" && (example as any)?.explicacao_tecnica
    ) {
      explanation = (example as any).explicacao_tecnica;
    } else if (
      type === "formal" && (example as any)?.explicacao_formal
    ) {
      explanation = (example as any).explicacao_formal;
    } else if (
      type === "technical" && (arguments.length === 2 && typeof arguments[1] === "object") && (arguments[1] as any).explicacao_tecnica
    ) {
      explanation = (arguments[1] as any).explicacao_tecnica;
    } else if (
      type === "formal" && (arguments.length === 2 && typeof arguments[1] === "object") && (arguments[1] as any).explicacao_formal
    ) {
      explanation = (arguments[1] as any).explicacao_formal;
    }
    // Alternativa: tentar acessar via props se forem passadas
    if (type === "technical" && (arguments[0] as any)?.explicacao_tecnica) {
      explanation = (arguments[0] as any).explicacao_tecnica;
    }
    if (type === "formal" && (arguments[0] as any)?.explicacao_formal) {
      explanation = (arguments[0] as any).explicacao_formal;
    }
    // Por fim fallback: se veio como prop, pode estar direto: ArticleCardProps add essas props
    
    if (type === "technical" && (articleNumber as any)?.explicacao_tecnica) {
      explanation = (articleNumber as any).explicacao_tecnica;
    }
    if (type === "formal" && (articleNumber as any)?.explicacao_formal) {
      explanation = (articleNumber as any).explicacao_formal;
    }

    // Nova versão: Recebe por props as colunas explicacao_tecnica e explicacao_formal
    // Se não achar nada, não mostra

    setExplanationTitle(title);
    if (type === "technical" && (content as any)?.explicacao_tecnica) {
      setCustomExplanation((content as any).explicacao_tecnica);
    } else if (type === "formal" && (content as any)?.explicacao_formal) {
      setCustomExplanation((content as any).explicacao_formal);
    } else {
      // fallback (não encontrado)
      setCustomExplanation("Não há explicação disponível para este artigo.");
    }
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

  useEffect(() => {
    if (userId) {
      logUserActivity('read', lawName, articleNumber);
    }
  }, [userId, lawName, articleNumber, logUserActivity]);

  // Verifica se deve centralizar/se é artigo zerado
  const shouldCenterContent = !articleNumber || articleNumber === "0";

  return (
    <div className="card-article mb-6">
      <CopyToast show={showCopyToast} />
      
      <ArticleHeader
        articleNumber={shouldCenterContent ? "" : articleNumber}
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
      
      <ArticleContent
        content={content}
        example={undefined} // O exemplo será gerenciado abaixo ao clicar no botão
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
        articleNumber={shouldCenterContent ? "" : articleNumber}
        centerContent={shouldCenterContent}
      />

      {!showExample && example && (
        <button
          className="text-primary-300 underline mb-2 mt-2 block mx-auto"
          onClick={() => setShowExample(true)}
        >
          Exibir Exemplo
        </button>
      )}
      {showExample && example && (
        <div className="mt-2 mb-2 px-4 py-2 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-400 text-left whitespace-pre-wrap">
          {example}
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

