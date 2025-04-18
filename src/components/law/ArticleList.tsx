
import { Loader2 } from "lucide-react";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import PDFExporter from "@/components/ui/PDFExporter";
import { AIExplanation as AIExplanationType } from "@/services/aiService";

interface Article {
  article: string;
  content: string;
}

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
          articleNumber={article.article}
          content={article.content}
          lawName={lawName ? decodeURIComponent(lawName) : ""}
          onExplainRequest={(type) => onExplainArticle(article, type)}
          onAskQuestion={() => onAskQuestion(article)}
        />
      ))}
      
      {showExplanation && selectedArticle && (
        <AIExplanation
          explanation={explanation}
          isLoading={loadingExplanation}
          articleNumber={selectedArticle.article}
          lawName={lawName ? decodeURIComponent(lawName) : ""}
          onClose={onCloseExplanation}
        />
      )}
      
      {showChat && selectedArticle && lawName && (
        <AIChat
          articleNumber={selectedArticle.article}
          articleContent={selectedArticle.content}
          lawName={decodeURIComponent(lawName)}
          onClose={onCloseChat}
        />
      )}
      
      {showExplanation && !loadingExplanation && selectedArticle && explanation && (
        <div className="mt-4 flex justify-end">
          <PDFExporter
            articleNumber={selectedArticle.article}
            articleContent={selectedArticle.content}
            lawName={lawName ? decodeURIComponent(lawName) : ""}
            explanation={explanation}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleList;
