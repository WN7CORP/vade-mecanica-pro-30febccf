
import { Copy, PenLine, BookOpen, Volume2, Bookmark, BookmarkCheck } from "lucide-react";

interface ArticleHeaderProps {
  articleNumber: string;
  lawName: string;
  onCopy: () => void;
  onToggleHighlight: () => void;
  onExplainRequest: (type: 'technical' | 'formal') => void;
  onNarrate: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  showHighlightTools: boolean;
}

const ArticleHeader = ({
  articleNumber,
  lawName,
  onCopy,
  onToggleHighlight,
  onExplainRequest,
  onNarrate,
  onToggleFavorite,
  isFavorite = false,
  showHighlightTools
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
          onClick={onNarrate}
          className="p-1.5 neomorph-sm text-primary-300 hover:text-primary-200"
          aria-label="Narrar artigo"
        >
          <Volume2 size={16} />
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
        
        <button 
          onClick={onCopy}
          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
          aria-label="Copiar artigo"
        >
          <Copy size={16} />
        </button>
        
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isFavorite ? (
              <BookmarkCheck size={16} className="fill-primary-300 text-primary-300" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleHeader;
