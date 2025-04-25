import { useState } from "react";
import ArticleFavoriteCollections from "@/components/law/ArticleFavoriteCollections";
import ArticleNavigation from "@/components/law/ArticleNavigation";
import ArticleContent from "@/components/ui/article/ArticleContent";
import ArticleHeader from "@/components/ui/article/ArticleHeader";
import { ArticleExplanation } from "@/components/ui/article/ArticleExplanation";
import { ArticleCustomExplanation } from "@/components/ui/article/ArticleCustomExplanation";
import { ArticleExample } from "@/components/ui/article/ArticleExample";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  article?: {
    id: number;
    numero: string;
    conteudo: string;
    exemplo?: string;
    explicacao_tecnica?: string;
    explicacao_formal?: string;
    titulo?: string;
  };
  articleNumber?: string;
  content?: string;
  example?: string;
  lawName?: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
  onAddToComparison?: () => void;
  onStudyMode?: () => void;
  globalFontSize?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasHistory?: boolean;
}

const ArticleCard = ({
  article,
  articleNumber,
  content,
  example,
  lawName = "Lei não especificada",
  onExplainRequest,
  onAskQuestion,
  onAddToComparison,
  onStudyMode,
  globalFontSize,
  onPrevious,
  onNext,
  hasHistory
}: ArticleCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [fontSize, setFontSize] = useState(globalFontSize || 16);
  const [showExplanationMenu, setShowExplanationMenu] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<string | null>(null);
  const [showCustomExplanation, setShowCustomExplanation] = useState(false);
  const [explanationTitle, setExplanationTitle] = useState("");
  const [showExample, setShowExample] = useState(false);
  const { toast } = useToast();

  const numero = article?.numero || articleNumber;
  const conteudo = article?.conteudo || content;
  const exemplo = article?.exemplo || example;

  const handleFavorite = (collectionName: string) => {
    console.log(`Adding to collection: ${collectionName}`);
    setIsFavorited(true);
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    if (onExplainRequest) {
      onExplainRequest(type);
      return;
    }

    setShowExplanationMenu(false);
    let explanation = null;
    let title = "";

    if (type === 'technical') {
      explanation = article?.explicacao_tecnica;
      title = "Explicação Técnica";
    } else {
      explanation = article?.explicacao_formal;
      title = "Explicação Formal";
    }

    if (explanation) {
      setCustomExplanation(explanation);
      setExplanationTitle(title);
      setShowCustomExplanation(true);
    } else {
      toast({
        title: "Explicação não disponível",
        description: `Não há explicação ${type === 'technical' ? 'técnica' : 'formal'} disponível para este artigo.`,
        variant: "destructive",
      });
    }
  };

  const handleShowExample = () => {
    if (exemplo) {
      setShowExample(true);
    } else {
      toast({
        title: "Exemplo não disponível",
        description: "Não há exemplo disponível para este artigo.",
        variant: "destructive",
      });
    }
  };

  const handleIncreaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, 24));
  };

  const handleDecreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 12));
  };

  if (!numero || !conteudo) {
    console.error("ArticleCard: Missing required props numero or conteudo");
    return null;
  }

  return (
    <div className="card-article mb-4 hover:shadow-lg transition-all duration-300 animate-fade-in relative">
      <ArticleHeader
        articleNumber={numero}
        lawName={lawName}
        onCopy={() => console.log("Copy article")}
        onToggleHighlight={() => console.log("Toggle highlight")}
        showHighlightTools={false}
        isFavorite={isFavorited}
        onToggleFavorite={() => setIsFavorited(!isFavorited)}
      />

      <ArticleContent 
        content={conteudo} 
        articleNumber={numero}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
      />

      {showCustomExplanation && customExplanation && (
        <ArticleCustomExplanation
          title={explanationTitle}
          explanation={customExplanation}
          onNarrate={() => {}}
        />
      )}

      {showExample && exemplo && (
        <ArticleExample
          example={exemplo}
          onClose={() => setShowExample(false)}
          onNarrate={() => {}}
        />
      )}

      <ArticleExplanation
        isOpen={showExplanationMenu}
        onClose={() => setShowExplanationMenu(false)}
        onExplain={handleExplain}
        articleNumber={numero}
        content={conteudo}
      />

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {(article?.explicacao_tecnica || article?.explicacao_formal || onExplainRequest) && (
          <button
            onClick={() => setShowExplanationMenu(true)}
            className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Explicar
          </button>
        )}

        {exemplo && (
          <button
            onClick={handleShowExample}
            className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Ver Exemplo
          </button>
        )}

        {onAskQuestion && (
          <button
            onClick={onAskQuestion}
            className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Perguntar
          </button>
        )}

        {onAddToComparison && (
          <button
            onClick={onAddToComparison}
            className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Comparar
          </button>
        )}

        {onStudyMode && (
          <button
            onClick={onStudyMode}
            className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Estudar
          </button>
        )}
      </div>

      {(onPrevious || onNext) && (
        <ArticleNavigation
          currentArticleNumber={numero}
          onPrevious={onPrevious || (() => {})}
          onNext={onNext || (() => {})}
          hasHistory={hasHistory}
        />
      )}
    </div>
  );
};

export default ArticleCard;
