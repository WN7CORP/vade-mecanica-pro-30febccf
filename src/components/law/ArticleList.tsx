
import { useState } from "react";
import { Loader2 } from "lucide-react";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import VoiceNarration from "@/components/ui/VoiceNarration";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { Article } from "@/services/lawService";
import { ScrollArea } from "../ui/scroll-area";

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
  onStudyMode
}: ArticleListProps) => {
  const [isNarratingExplanation, setIsNarratingExplanation] = useState(false);
  const [narratingContent, setNarratingContent] = useState<{text: string, title: string}>({text: '', title: ''});

  const handleNarrateExplanation = (content: string, title: string) => {
    if (isNarratingExplanation && title === narratingContent.title) {
      // If already narrating this content, stop it
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
      <div className="text-center py-8 neomorph">
        <p className="text-gray-400">
          {searchTerm 
            ? `Nenhum artigo encontrado com o termo "${searchTerm}".`
            : "Nenhum artigo disponível para esta lei."}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div>
        {filteredArticles.map((article, index) => (
          <ArticleCard
            key={`${article.id}-${index}`}
            articleNumber={article.numero}
            content={article.conteudo}
            example={article.exemplo1}
            lawName={lawName ? decodeURIComponent(lawName) : ""}
            onExplainRequest={(type) => onExplainArticle(article, type)}
            onAskQuestion={() => onAskQuestion(article)}
            onAddToComparison={onAddToComparison ? () => onAddToComparison(article) : undefined}
            onStudyMode={onStudyMode}
          />
        ))}
        
        {/* Loading indicator for infinite scroll */}
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
    </ScrollArea>
  );
};

export default ArticleList;
