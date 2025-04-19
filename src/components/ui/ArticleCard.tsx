
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
  
  // Load favorite status from localStorage on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoritedArticles') || '{}');
    setIsFavorite(!!favorites[`${lawName}-${articleNumber}`]);
  }, [lawName, articleNumber]);
  
  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };
  
  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
    
    // Handle text selection
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      document.execCommand('hiliteColor', false, colorClass);
    }
  };
  
  const toggleFavorite = () => {
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    // Save to localStorage
    const favorites = JSON.parse(localStorage.getItem('favoritedArticles') || '{}');
    const key = `${lawName}-${articleNumber}`;
    
    if (newStatus) {
      favorites[key] = { 
        articleNumber, 
        content, 
        example, 
        lawName,
        timestamp: new Date().toISOString()
      };
    } else {
      delete favorites[key];
    }
    
    localStorage.setItem('favoritedArticles', JSON.stringify(favorites));
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    if (onExplainRequest) {
      onExplainRequest(type);
    }
  };

  const handleComment = () => {
    setShowNotes(true);
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
    } else if (contentType === 'example' && example) {
      setReadingContent({
        text: example,
        title: 'Exemplo'
      });
    }
    
    setIsReading(true);
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
        fontSize={fontSize}
        onIncreaseFontSize={() => setFontSize(prev => Math.min(prev + 2, 24))}
        onDecreaseFontSize={() => setFontSize(prev => Math.max(prev - 2, 14))}
        articleNumber={articleNumber}
      />
      
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
