
import { useState, useEffect } from "react";
import ArticleHeader from "./article/ArticleHeader";
import HighlightTools from "./article/HighlightTools";
import ArticleContent from "./article/ArticleContent";
import CopyToast from "./article/CopyToast";
import VoiceNarration from "./VoiceNarration";
import ArticleInteractions from "./ArticleInteractions";
import ArticleNotes from "./ArticleNotes";

interface ArticleCardProps {
  articleNumber: string;
  content: string;
  example?: string;
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
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
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Verificar se o artigo está nos favoritos quando o componente é carregado
  useEffect(() => {
    const checkFavorite = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isArticleFavorite = favorites.some(
        (fav: {lawName: string, articleNumber: string}) => 
          fav.lawName === lawName && fav.articleNumber === articleNumber
      );
      setIsFavorite(isArticleFavorite);
    };
    
    checkFavorite();
  }, [lawName, articleNumber]);
  
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Verifica se o artigo já está nos favoritos
    const existingIndex = favorites.findIndex(
      (fav: {lawName: string, articleNumber: string}) => 
        fav.lawName === lawName && fav.articleNumber === articleNumber
    );
    
    // Se estiver, remove; se não, adiciona
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
      setIsFavorite(false);
      toast({
        description: "Artigo removido dos favoritos"
      });
    } else {
      favorites.push({
        lawName,
        articleNumber,
        content,
        addedAt: new Date().toISOString()
      });
      setIsFavorite(true);
      toast({
        description: "Artigo adicionado aos favoritos"
      });
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };
  
  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };
  
  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    if (onExplainRequest) {
      onExplainRequest(type);
    }
  };

  const handleComment = () => {
    setShowNotes(true);
  };
  
  const toast = {
    description: (message: string) => {
      const toastEl = document.createElement('div');
      toastEl.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary-300 text-white px-4 py-2 rounded-md shadow-lg z-50';
      toastEl.textContent = message;
      document.body.appendChild(toastEl);
      
      setTimeout(() => {
        toastEl.remove();
      }, 3000);
    }
  };

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
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
        onScrollToTop={scrollToTop}
        articleNumber={articleNumber}
      />
      
      <ArticleInteractions 
        articleNumber={articleNumber}
        content={content}
        onExplain={handleExplain}
        onAddComment={handleComment}
        onStartNarration={() => setIsReading(true)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
      
      <VoiceNarration
        text={content}
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
