
import { Button } from "./button";
import { BookOpen, Bookmark, Copy, Volume2, ScrollText, FileDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import PDFExporter from "./PDFExporter";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string;
  example?: string;
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: () => void;
  onNarrateExample?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const ArticleInteractions = ({
  articleNumber,
  content,
  example,
  onExplain,
  onAddComment,
  onStartNarration,
  onNarrateExample,
  isFavorite = false,
  onToggleFavorite
}: ArticleInteractionsProps) => {
  const [showExplainOptions, setShowExplainOptions] = useState(false);
  const [showNarrationOptions, setShowNarrationOptions] = useState(false);

  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      description: "Artigo copiado com sucesso!",
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-6">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExplainOptions(!showExplainOptions)}
          className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300"
        >
          <BookOpen size={16} />
          Explicar
        </Button>
        
        {showExplainOptions && (
          <div className="absolute bottom-full mb-2 left-0 z-10 w-48 neomorph p-2 rounded-md bg-background/95 backdrop-blur animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-1 justify-start text-primary hover:text-primary-foreground"
              onClick={() => {
                onExplain('technical');
                setShowExplainOptions(false);
              }}
            >
              <BookOpen size={16} className="mr-2" />
              Explicação Técnica
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary hover:text-primary-foreground"
              onClick={() => {
                onExplain('formal');
                setShowExplainOptions(false);
              }}
            >
              <BookOpen size={16} className="mr-2" />
              Explicação Formal
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNarrationOptions(!showNarrationOptions)}
          className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300"
        >
          <Sparkles size={16} />
          Narrar
        </Button>
        
        {showNarrationOptions && (
          <div className="absolute bottom-full mb-2 left-0 z-10 w-48 neomorph p-2 rounded-md bg-background/95 backdrop-blur animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-1 justify-start text-primary hover:text-primary-foreground"
              onClick={() => {
                onStartNarration();
                setShowNarrationOptions(false);
              }}
            >
              <Volume2 size={16} className="mr-2" />
              Narrar Artigo
            </Button>
            
            {example && onNarrateExample && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-primary hover:text-primary-foreground"
                onClick={() => {
                  onNarrateExample();
                  setShowNarrationOptions(false);
                }}
              >
                <Volume2 size={16} className="mr-2" />
                Narrar Exemplo
              </Button>
            )}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAddComment}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300"
      >
        <ScrollText size={16} />
        Anotações
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyArticle}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300"
      >
        <Copy size={16} />
        Copiar
      </Button>

      <PDFExporter
        articleNumber={articleNumber}
        articleContent={content}
        lawName="Lei"
        example={example}
      />

      {onToggleFavorite && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFavorite}
          className={`flex items-center gap-2 ${
            isFavorite 
              ? "bg-primary text-primary-foreground" 
              : "bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary"
          } font-medium transition-all duration-300`}
        >
          <Bookmark size={16} className={isFavorite ? "fill-current" : ""} />
          {isFavorite ? "Favoritado" : "Favoritar"}
        </Button>
      )}
    </div>
  );
};

export default ArticleInteractions;
