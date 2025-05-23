
import { useState } from "react";
import { type Article } from "@/services/lawService";
import ArticleFavoriteCollections from "./ArticleFavoriteCollections";
import ArticleNavigation from "./ArticleNavigation";
import ArticleContent from "@/components/ui/article/ArticleContent";
import ArticleHeader from "@/components/ui/article/ArticleHeader";
import { ArticleExplanation } from "@/components/ui/article/ArticleExplanation";

interface ArticleCardProps {
  article: Article;
  onPrevious?: () => void;
  onNext?: () => void;
  hasHistory?: boolean;
}

const ArticleCard = ({
  article,
  onPrevious,
  onNext,
  hasHistory
}: ArticleCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showExplanationMenu, setShowExplanationMenu] = useState(false);

  const handleFavorite = (collectionName: string) => {
    console.log(`Adding to collection: ${collectionName}`);
    setIsFavorited(true);
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    // Access the database explanations directly from the article object
    const explanation = type === 'technical' ? 
      article["explicacao tecnica"] : 
      article["explicacao formal"];
    
    console.log(`Showing ${type} explanation:`, explanation);
  };

  const handleIncreaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  const handleDecreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
  };

  return (
    <div className="card-article mb-4 hover:shadow-lg transition-all duration-300 animate-fade-in relative">
      <ArticleHeader
        articleNumber={article.numero}
        lawName={"Lei não especificada"}
        onCopy={() => console.log("Copy article")}
        onToggleHighlight={() => console.log("Toggle highlight")}
        showHighlightTools={false}
        isFavorite={isFavorited}
        onToggleFavorite={() => setIsFavorited(!isFavorited)}
      />

      <ArticleContent 
        content={article.conteudo} 
        articleNumber={article.numero}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
      />

      <ArticleExplanation
        isOpen={showExplanationMenu}
        onClose={() => setShowExplanationMenu(false)}
        onExplain={handleExplain}
        articleNumber={article.numero}
        content={article.conteudo}
      />

      {(onPrevious || onNext) && (
        <ArticleNavigation
          currentArticleNumber={article.numero}
          onPrevious={onPrevious || (() => {})}
          onNext={onNext || (() => {})}
          hasHistory={hasHistory}
        />
      )}
    </div>
  );
};

export default ArticleCard;
