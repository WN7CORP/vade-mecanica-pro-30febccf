
import { useState } from "react";
import { type Article } from "@/services/lawService";
import ArticleFavoriteCollections from "./ArticleFavoriteCollections";
import ArticleNavigation from "./ArticleNavigation";
import ArticleContent from "@/components/ui/article/ArticleContent";
import ArticleHeader from "@/components/ui/article/ArticleHeader";

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

  const handleFavorite = (collectionName: string) => {
    console.log(`Adding to collection: ${collectionName}`);
    setIsFavorited(true);
  };

  return (
    <div className="card-article mb-4 hover:shadow-lg transition-all duration-300 animate-fade-in relative">
      <ArticleHeader
        articleNumber={article.numero}
        content={article.conteudo}
        rightSlot={
          <ArticleFavoriteCollections
            article={article}
            onFavorite={handleFavorite}
            isFavorited={isFavorited}
          />
        }
      />

      <ArticleContent 
        content={article.conteudo} 
        articleNumber={article.numero}
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
