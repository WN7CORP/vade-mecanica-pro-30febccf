
import { useState } from "react";
import { MessageCircle, BookOpen, Bookmark, Volume2, MessageSquareMore, PenLine, BarChart2, Scale, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string | { [key: string]: any };
  example?: string | { [key: string]: any };
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: (contentType: 'article') => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCompare?: () => void;
  onStudyMode?: () => void;
}

const ArticleInteractions = ({
  articleNumber,
  content,
  onExplain,
  onAddComment,
  onStartNarration,
  isFavorite,
  onToggleFavorite,
  onCompare,
  onStudyMode
}: ArticleInteractionsProps) => {
  const [showExplanationOptions, setShowExplanationOptions] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div className="mt-6 flex justify-center pt-3 animate-fade-in">
      <div className="flex items-center flex-wrap justify-center space-x-2 space-y-2">
        
        {/* Narração */}
        <button 
          className="shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95"
          onClick={() => onStartNarration('article')}
        >
          <Volume2 size={16} />
          <span className="text-xs">Narrar</span>
        </button>
          
        {/* Explicação */}
        <div className="relative">
          <button 
            className="shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95"
            onClick={() => setShowExplanationOptions(!showExplanationOptions)}
          >
            <MessageCircle size={16} />
            <span className="text-xs">Explicar</span>
          </button>
          
          {showExplanationOptions && (
            <div className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-2 z-20 animate-fade-in-fast min-w-[150px]">
              <button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  onExplain('technical');
                  setShowExplanationOptions(false);
                }}
              >
                <BookOpen size={14} />
                <span>Técnica</span>
              </button>
              
              <button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  onExplain('formal');
                  setShowExplanationOptions(false);
                }}
              >
                <BarChart2 size={14} />
                <span>Formal</span>
              </button>
              
              <button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  navigate(`/duvidas?article=${articleNumber}&content=${encodeURIComponent(typeof content === 'string' ? content : JSON.stringify(content))}`);
                  setShowExplanationOptions(false);
                }}
              >
                <MessageSquareMore size={14} />
                <span>Personalizada</span>
              </button>
            </div>
          )}
        </div>
          
        {/* Adicionar anotação */}
        <button 
          className="shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95"
          onClick={onAddComment}
        >
          <PenLine size={16} />
          <span className="text-xs">Anotar</span>
        </button>
        
        {/* Favorito */}
        <button 
          className={`shadow-button px-3 py-2 ${isFavorite ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'} text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95`}
          onClick={onToggleFavorite}
        >
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
        </button>

        {/* Comparar (novo) */}
        {onCompare && (
          <button 
            className="shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95"
            onClick={onCompare}
          >
            <Scale size={16} />
            <span className="text-xs">Comparar</span>
          </button>
        )}

        {/* Modo de estudo (novo) */}
        {onStudyMode && (
          <button 
            className="shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30 active:scale-95"
            onClick={onStudyMode}
          >
            <GraduationCap size={16} />
            <span className="text-xs">Estudar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleInteractions;
