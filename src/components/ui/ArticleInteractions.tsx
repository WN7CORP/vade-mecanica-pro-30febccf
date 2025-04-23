
import { Button } from "./button";
import { BookOpen, Bookmark, Copy, Volume2, ScrollText } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string;
  example?: string;
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: (content: 'article' | 'example' | 'explanation') => void;
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
  isFavorite = false,
  onToggleFavorite
}: ArticleInteractionsProps) => {
  const [showExplainOptions, setShowExplainOptions] = useState(false);

  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      description: "Artigo copiado com sucesso!",
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-6 animate-fade-in">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExplainOptions(!showExplainOptions)}
          className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <BookOpen size={16} />
          Explicar
        </Button>
        
        {showExplainOptions && (
          <div className="absolute bottom-full mb-2 left-0 z-10 w-48 neomorph p-2 rounded-md bg-background/95 backdrop-blur animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-1 justify-start text-primary hover:text-primary-foreground hover:bg-primary/30"
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
              className="w-full justify-start text-primary hover:text-primary-foreground hover:bg-primary/30"
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

      <Button
        variant="outline"
        size="sm"
        onClick={onAddComment}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        <ScrollText size={16} />
        Anotações
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyArticle}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        <Copy size={16} />
        Copiar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onStartNarration('article')}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        <Volume2 size={16} />
        Narrar Artigo
      </Button>

      {onToggleFavorite && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFavorite}
          className={`flex items-center gap-2 ${
            isFavorite 
              ? "bg-primary text-primary-foreground" 
              : "bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary"
          } font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95`}
        >
          <Bookmark size={16} className={isFavorite ? "fill-current" : ""} />
          {isFavorite ? "Favoritado" : "Favoritar"}
        </Button>
      )}
    </div>
  );
};

export default ArticleInteractions;
