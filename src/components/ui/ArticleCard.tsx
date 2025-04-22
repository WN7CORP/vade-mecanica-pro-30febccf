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
  content?: string; // artigo
  conteudo?: string; // título/subtítulo
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
  content, // artigo
  conteudo, // título/subtítulo
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
    const textToCopy = content
      ? `Art. ${articleNumber}. ${content}`
      : conteudo
        ? conteudo
        : "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setShowCopyToast(true);
          setTimeout(() => setShowCopyToast(false), 2000);
          if (userId) {
            logUserActivity('copy', lawName, articleNumber);
          }
        })
        .catch(err => console.error("Erro ao copiar: ", err));
    }
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

    if (contentType === 'article' && content) {
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

  // Checa se existe artigo
  const hasArtigo = !!content && content.trim().length > 0;

  return (
    // remove todo card container/fundo extra, manter só fundo natural do app
    <div className="mb-6">
      {/* Conteúdo centralizado e negrito, antes do artigo */}
      {conteudo && (
        <div
          className="mb-3 text-center font-bold"
          style={{ fontSize: 18 }}
        >
          {conteudo}
        </div>
      )}

      {/* Texto do artigo, alinhado à esquerda, fonte normal */}
      {hasArtigo && (
        <div
          className="whitespace-pre-line text-left mb-4 text-white"
          style={{ fontWeight: "normal", fontSize: 16 }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
