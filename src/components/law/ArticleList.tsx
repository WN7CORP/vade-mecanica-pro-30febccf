
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import VoiceNarration from "@/components/ui/VoiceNarration";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { Article } from "@/services/lawService";

interface ArticleListProps {
  isLoading: boolean;
  searchTerm: string;
  filteredArticles: Article[];
  lawName: string | undefined;
  showExplanation: boolean;
  explanation: AIExplanationType | null;
  loadingExplanation: boolean;
  selectedArticle: Article | null;
  showChat: boolean;
  loadingRef?: React.RefObject<HTMLDivElement>;
  hasMore?: boolean;
  onExplainArticle: (article: Article, type: 'technical' | 'formal') => void;
  onAskQuestion: (article: Article) => void;
  onCloseChat: () => void;
  onCloseExplanation: () => void;
  onAddToComparison?: (article: Article) => void;
  onStudyMode?: () => void;
  globalFontSize?: number;
  highlightedArticleNumber?: string | null;
  highlightedRef?: React.RefObject<HTMLDivElement>;
  lawCategory?: 'codigo' | 'estatuto' | 'outros';
}

const ArticleList = ({
  isLoading,
  searchTerm,
  filteredArticles,
  lawName,
  showExplanation,
  explanation,
  loadingExplanation,
  selectedArticle,
  showChat,
  loadingRef,
  hasMore,
  onExplainArticle,
  onAskQuestion,
  onCloseChat,
  onCloseExplanation,
  onAddToComparison,
  onStudyMode,
  globalFontSize,
  highlightedArticleNumber,
  highlightedRef,
  lawCategory
}: ArticleListProps) => {
  const [isNarratingExplanation, setIsNarratingExplanation] = useState(false);
  const [narratingContent, setNarratingContent] = useState<{text: string, title: string}>({text: '', title: ''});

  const handleNarrateExplanation = (content: string, title: string) => {
    if (isNarratingExplanation && title === narratingContent.title) {
      setIsNarratingExplanation(false);
      return;
    }
    
    setNarratingContent({
      text: content,
      title: title
    });
    setIsNarratingExplanation(true);
  };

  if (filteredArticles.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 neomorph animate-fade-in">
        <p className="text-gray-400">
          {searchTerm 
            ? `Nenhum artigo encontrado com o termo "${searchTerm}".`
            : "Nenhum artigo disponível para esta lei."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {filteredArticles.map((article, index) => {
        const isHighlighted = highlightedArticleNumber && article.numero === highlightedArticleNumber;
        
        return (
          <div 
            key={`${article.id}-${index}`}
            id={`article-${article.numero}`}
            ref={isHighlighted ? highlightedRef : undefined}
            className={`
              transition-all duration-500 
              ${isHighlighted ? 'scale-[1.02] ring-4 ring-primary/40 shadow-lg' : ''}
            `}
          >
            <ArticleCard
              articleNumber={article.numero}
              content={article.conteudo}
              example={article.exemplo1}
              lawName={lawName ? decodeURIComponent(lawName) : ""}
              onExplainRequest={(type) => onExplainArticle(article, type)}
              onAskQuestion={() => onAskQuestion(article)}
              onAddToComparison={onAddToComparison ? () => onAddToComparison(article) : undefined}
              onStudyMode={onStudyMode}
              globalFontSize={globalFontSize}
            />
          </div>
        );
      })}
      
      {(hasMore || isLoading) && (
        <div
          ref={loadingRef}
          className="flex justify-center items-center py-6"
        >
          <Loader2 className="h-8 w-8 text-primary-300 animate-spin" />
        </div>
      )}
      
      {showExplanation && selectedArticle && (
        <AIExplanation
          explanation={explanation}
          isLoading={loadingExplanation}
          articleNumber={selectedArticle.numero}
          lawName={lawName ? decodeURIComponent(lawName) : ""}
          onClose={onCloseExplanation}
          onNarrateExplanation={handleNarrateExplanation}
        />
      )}
      
      {showChat && selectedArticle && lawName && (
        <AIChat
          articleNumber={selectedArticle.numero}
          articleContent={selectedArticle.conteudo}
          lawName={decodeURIComponent(lawName)}
          onClose={onCloseChat}
        />
      )}
      
      <VoiceNarration
        text={narratingContent.text}
        title={narratingContent.title}
        isActive={isNarratingExplanation}
        onComplete={() => setIsNarratingExplanation(false)}
        onStop={() => setIsNarratingExplanation(false)}
      />
    </div>
  );
};

export default ArticleList;
