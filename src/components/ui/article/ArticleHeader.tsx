
import { Copy, PenLine, BookOpen, Bookmark } from "lucide-react";

interface ArticleHeaderProps {
  articleNumber: string;
  lawName: string;
  onCopy: () => void;
  onToggleHighlight: () => void;
  onExplainRequest: (type: 'technical' | 'formal') => void;
  showHighlightTools: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const ArticleHeader = ({
  articleNumber,
  lawName,
  onCopy,
  onToggleHighlight,
  onExplainRequest,
  showHighlightTools,
  isFavorite = false,
  onToggleFavorite
}: ArticleHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-primary-300 text-lg font-heading font-semibold">
          {articleNumber ? `Art. ${articleNumber}` : lawName}
        </h3>
        <p className="text-xs text-muted-foreground">{lawName}</p>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={onCopy}
          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
          aria-label="Copiar artigo"
        >
          <Copy size={16} />
        </button>
        
        <button 
          onClick={onToggleHighlight}
          className={`p-1.5 neomorph-sm ${showHighlightTools ? "text-primary-300" : "text-gray-400 hover:text-primary-200"}`}
          aria-label="Marcador de texto"
        >
          <PenLine size={16} />
        </button>
        
        <button 
          onClick={() => onExplainRequest('technical')}
          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
          aria-label="Explicar artigo"
        >
          <BookOpen size={16} />
        </button>
        
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className={`p-1.5 neomorph-sm ${isFavorite ? "text-primary-300" : "text-gray-400 hover:text-primary-200"}`}
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Bookmark size={16} className={isFavorite ? "fill-current" : ""} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleHeader;
