
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
  onExplainArticle: (article: Article, type: 'technical' | 'formal') => void;
  onAskQuestion: (article: Article) => void;
  onCloseChat: () => void;
  onCloseExplanation: () => void;
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
  onExplainArticle,
  onAskQuestion,
  onCloseChat,
  onCloseExplanation
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-primary-300 animate-spin" />
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-8 neomorph">
        <p className="text-gray-400">
          Nenhum artigo encontrado com o termo "{searchTerm}".
        </p>
      </div>
    );
  }

  return (
    <div>
      {filteredArticles.map((article, index) => (
        <ArticleCard
          key={index}
          articleNumber={article.numero}
          content={article.conteudo}
          example={article.exemplo1}
          lawName={lawName ? decodeURIComponent(lawName) : ""}
          onExplainRequest={(type) => onExplainArticle(article, type)}
          onAskQuestion={() => onAskQuestion(article)}
        />
      ))}
      
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
