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

// Create a global variable to track current audio
declare global {
  interface Window {
    currentAudio: HTMLAudioElement | null;
  }
}

// Initialize if not already present
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
  const { logUserActivity } = useUserActivity(userId);
  const [showExample, setShowExample] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, []);
  
  // Load favorite status from localStorage on mount
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
    
    // Handle text selection
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      // Criar um range para o texto selecionado
      const range = selection.getRangeAt(0);
      
      // Criar um span para envolver o texto selecionado
      const span = document.createElement('span');
      span.className = colorClass;
      
      // Aplicar o span ao texto selecionado
      try {
        range.surroundContents(span);
        
        if (userId) {
          logUserActivity('highlight', lawName, articleNumber);
        }
      } catch (e) {
        console.error("Erro ao destacar texto: ", e);
        // Alternativa se o range contiver elementos parciais
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
      
      // Limpar a seleção
      selection.removeAllRanges();
    }
  };
  
  const toggleFavorite = () => {
    try {
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);
      
      // Save to localStorage
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

  // Buscar explicação apropriada no supabase conforme tipo
  const handleExplain = async (type: 'technical' | 'formal') => {
    if (!articleNumber || !lawName) return;
    let fieldName = type === "technical" ? "explicacao tecnica" : "explicacao formal";
    try {
      // Buscar da tabela conforme lawName (mapeamento igual a fetchLawArticles)
      let tableName = "";
      const tables = [
        { display: "Constituição Federal", table: "constituicao_federal" },
        { display: "Código Civil", table: "codigo_civil" },
        { display: "Código Penal", table: "codigo_penal" },
        { display: "Código de Processo Civil", table: "codigo_processo_civil" },
        { display: "Código de Processo Penal", table: "codigo_processo_penal" },
        { display: "Código de Defesa do Consumidor", table: "codigo_defesa_consumidor" },
        { display: "Código Tributário Nacional", table: "codigo_tributario" },
        { display: "Consolidação das Leis do Trabalho", table: "consolidacao_leis_trabalho" },
        { display: "Código de Trânsito Brasileiro", table: "codigo_transito" }
      ];
      const found = tables.find(opt => opt.display === lawName);
      if (!found) return;
      tableName = found.table;

      const { data, error } = await supabase
        .from(tableName as any)
        .select(`${fieldName}`)
        .eq("numero", articleNumber)
        .maybeSingle();

      if (error) {
        setExplanation("Erro ao buscar explicação.");
        return;
      }
      if (data && data[fieldName]) {
        setExplanation(data[fieldName]);
      } else {
        setExplanation("Explicação não encontrada neste artigo.");
      }
    } catch (e) {
      setExplanation("Erro ao buscar explicação.");
    }

    if (onExplainRequest) {
      onExplainRequest(type);
      if (userId) {
        logUserActivity('explain', lawName, articleNumber);
      }
    }
  };

  const handleNarration = (contentType: 'article' | 'example') => {
    if (isReading && contentType === 'article' && readingContent.title === 'Artigo') {
      // If already narrating this content, stop it
      setIsReading(false);
      return;
    }
    
    if (isReading && contentType === 'example' && readingContent.title === 'Exemplo') {
      // If already narrating this content, stop it
      setIsReading(false);
      return;
    }
    
    // Start narration of the requested content
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

  // Define handleComment function to fix the ReferenceError
  const handleComment = () => {
    setShowNotes(true);
    if (userId) {
      logUserActivity('note', lawName, articleNumber);
    }
  };

  useEffect(() => {
    // Registrar leitura do artigo quando o componente é montado
    if (userId) {
      logUserActivity('read', lawName, articleNumber);
    }
  }, [userId, lawName, articleNumber, logUserActivity]);

  return (
    <div className="card-article mb-6">
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

      {/* Exibição da explicação, quando existe */}
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
