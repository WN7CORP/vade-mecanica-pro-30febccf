
import { useState, useRef, useEffect } from "react";
import ArticleHeader from "./article/ArticleHeader";
import HighlightTools from "./article/HighlightTools";
import ArticleContent from "./article/ArticleContent";
import CopyToast from "./article/CopyToast";
import VoiceNarration from "./VoiceNarration";
import ArticleInteractions from "./ArticleInteractions";
import ArticleNotes from "./ArticleNotes";
import { useToast } from "@/hooks/use-toast";

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
  const [isReadingExample, setIsReadingExample] = useState(false);
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Guardar o artigo nos favoritos
  useEffect(() => {
    const checkFavorite = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFav = favorites.some((fav: any) => 
        fav.articleNumber === articleNumber && fav.lawName === lawName
      );
      setIsFavorite(isFav);
    };
    
    checkFavorite();
  }, [articleNumber, lawName]);

  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };
  
  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
    // Add highlight functionality
    document.addEventListener('mouseup', handleHighlight);
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selectedColor) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    // Check if selection is within the article content
    if (contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
      const span = document.createElement('span');
      span.classList.add(selectedColor);
      range.surroundContents(span);
      selection.removeAllRanges();

      // Save highlighted text to localStorage
      saveHighlight(articleNumber, lawName, selectedColor, span.innerText);
      
      toast({
        description: "Texto destacado com sucesso!",
      });
    }
  };

  const saveHighlight = (article: string, law: string, colorClass: string, text: string) => {
    const highlights = JSON.parse(localStorage.getItem('highlights') || '[]');
    highlights.push({
      articleNumber: article,
      lawName: law,
      colorClass,
      text,
      date: new Date().toISOString()
    });
    localStorage.setItem('highlights', JSON.stringify(highlights));
  };

  useEffect(() => {
    return () => {
      // Clean up event listener
      document.removeEventListener('mouseup', handleHighlight);
    };
  }, [selectedColor]);
  
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

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((fav: any) => 
        !(fav.articleNumber === articleNumber && fav.lawName === lawName)
      );
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast({
        description: "Removido dos favoritos"
      });
    } else {
      // Add to favorites
      favorites.push({
        articleNumber,
        lawName,
        content,
        example,
        date: new Date().toISOString()
      });
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast({
        description: "Adicionado aos favoritos"
      });
    }
  };

  const handleNarrateExample = () => {
    if (!example) return;
    
    // Stop article narration if it's playing
    if (isReading) {
      setIsReading(false);
    }
    
    setIsReadingExample(true);
  };

  return (
    <div className="card-article mb-6" ref={contentRef}>
      <CopyToast show={showCopyToast} />
      
      <ArticleHeader
        articleNumber={articleNumber}
        lawName={lawName}
        onCopy={copyArticle}
        onToggleHighlight={() => setShowHighlightTools(!showHighlightTools)}
        onExplainRequest={handleExplain}
        onNarrate={() => setIsReading(true)}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={isFavorite}
        showHighlightTools={showHighlightTools}
      />
      
      {showHighlightTools && (
        <HighlightTools
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          onClose={() => {
            setShowHighlightTools(false);
            document.removeEventListener('mouseup', handleHighlight);
          }}
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
        example={example}
        onExplain={handleExplain}
        onAddComment={handleComment}
        onStartNarration={() => setIsReading(true)}
        onNarrateExample={handleNarrateExample}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
      />
      
      <VoiceNarration
        text={content}
        isActive={isReading}
        onComplete={() => setIsReading(false)}
        onStop={() => setIsReading(false)}
        type="article"
      />

      {example && (
        <VoiceNarration
          text={example}
          isActive={isReadingExample}
          onComplete={() => setIsReadingExample(false)}
          onStop={() => setIsReadingExample(false)}
          type="example"
        />
      )}

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
