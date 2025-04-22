
import { Loader2 } from "lucide-react";
import ArticleCard from "@/components/ui/ArticleCard";
import AIExplanation from "@/components/ui/AIExplanation";
import AIChat from "@/components/ui/AIChat";
import PDFExporter from "@/components/ui/PDFExporter";
import VoiceNarration from "@/components/ui/VoiceNarration";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { Article } from "@/services/lawService";
import { useState } from "react";

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
  const [isNarratingExamples, setIsNarratingExamples] = useState(false);

  const handleNarrateExplanation = () => {
    if (!explanation) return;
    setIsNarratingExamples(false);
    setIsNarratingExplanation(true);
  };

  const handleNarrateExamples = () => {
    if (!explanation || !explanation.examples.length) return;
    setIsNarratingExplanation(false);
    setIsNarratingExamples(true);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
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
      <button
        onClick={handleScrollToTop}
        className="fixed bottom-20 right-4 p-3 neomorph-sm text-primary-300 z-10 hover:scale-105 transition-all animate-fade-in"
        aria-label="Voltar ao topo"
      >
        <Loader2 size={20} />
      </button>

      {filteredArticles.map((article, index) => (
        <ArticleCard
          key={index}
          articleNumber={article.numero}
          content={article.conteudo}
          example={article.exemplo}
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
          onNarrateExamples={handleNarrateExamples}
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
      
      {showExplanation && !loadingExplanation && selectedArticle && explanation && (
        <div className="mt-4 flex justify-end">
          <PDFExporter
            articleNumber={selectedArticle.numero}
            articleContent={selectedArticle.conteudo}
            lawName={lawName ? decodeURIComponent(lawName) : ""}
            explanation={explanation}
            example={selectedArticle.exemplo}
          />
        </div>
      )}

      {/* Narration components for explanation */}
      {explanation && isNarratingExplanation && (
        <VoiceNarration
          text={explanation.detailed}
          isActive={isNarratingExplanation}
          onComplete={() => setIsNarratingExplanation(false)}
          onStop={() => setIsNarratingExplanation(false)}
          type="explanation"
        />
      )}

      {/* Narration components for examples */}
      {explanation && explanation.examples.length > 0 && isNarratingExamples && (
        <VoiceNarration
          text={explanation.examples.join('\n\n')}
          isActive={isNarratingExamples}
          onComplete={() => setIsNarratingExamples(false)}
          onStop={() => setIsNarratingExamples(false)}
          type="example"
        />
      )}
    </div>
  );
};

export default ArticleList;
