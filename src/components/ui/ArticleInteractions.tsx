
import { Button } from "./button";
import { BookOpen, MessageSquare, Copy, Volume2, BookmarkPlus, School } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string;
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: () => void;
}

const ArticleInteractions = ({
  articleNumber,
  content,
  onExplain,
  onAddComment,
  onStartNarration,
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
    <div className="flex flex-wrap gap-2 mt-6">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExplainOptions(!showExplainOptions)}
          className="flex items-center gap-2 bg-primary/10 text-primary-300 hover:text-primary hover:bg-primary/20 font-medium"
        >
          <BookOpen size={16} />
          Explicar
        </Button>
        
        {showExplainOptions && (
          <div className="absolute bottom-full mb-2 left-0 z-10 w-48 neomorph p-2 rounded-md bg-background/95 backdrop-blur">
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-1 justify-start text-primary-300"
              onClick={() => {
                onExplain('technical');
                setShowExplainOptions(false);
              }}
            >
              <School size={16} className="mr-2" />
              Explicação Técnica
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary-300"
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
        className="flex items-center gap-2 bg-primary/10 text-primary-300 hover:text-primary hover:bg-primary/20 font-medium"
      >
        <MessageSquare size={16} />
        Comentar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyArticle}
        className="flex items-center gap-2 bg-primary/10 text-primary-300 hover:text-primary hover:bg-primary/20 font-medium"
      >
        <Copy size={16} />
        Copiar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onStartNarration}
        className="flex items-center gap-2 bg-primary/10 text-primary-300 hover:text-primary hover:bg-primary/20 font-medium"
      >
        <Volume2 size={16} />
        Narrar
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-primary/10 text-primary-300 hover:text-primary hover:bg-primary/20 font-medium"
      >
        <BookmarkPlus size={16} />
        Favoritar
      </Button>
    </div>
  );
};

export default ArticleInteractions;
