
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserActivity } from "@/hooks/useUserActivity";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, Bookmark, Volume2, MessageSquareMore, PenLine, BarChart2, Scale, GraduationCap, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArticleActionsProps {
  articleNumber: string;
  content: string | { [key: string]: any };
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: (contentType: 'article') => void;
  onShowExample?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCompare?: () => void;
  onStudyMode?: () => void;
  userId?: string;
  lawName: string;
  hasCompareSelection?: boolean;
}

export const ArticleActions = ({
  articleNumber,
  content,
  onExplain,
  onAddComment,
  onStartNarration,
  onShowExample,
  isFavorite,
  onToggleFavorite,
  onCompare,
  onStudyMode,
  userId,
  lawName,
  hasCompareSelection = false
}: ArticleActionsProps) => {
  const [showExplanationOptions, setShowExplanationOptions] = useState(false);
  const navigate = useNavigate();
  const { logUserActivity } = useUserActivity(userId);

  const handleExplain = (type: 'technical' | 'formal') => {
    onExplain(type);
    setShowExplanationOptions(false);
    if (userId) {
      logUserActivity('explain', lawName, articleNumber);
    }
  };

  return (
    <motion.div 
      className="mt-6 flex justify-center pt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartNarration('article')}
          className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
        >
          <Volume2 size={16} />
          <span className="text-xs">Narrar</span>
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplanationOptions(!showExplanationOptions)}
            className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            <MessageCircle size={16} />
            <span className="text-xs">Explicar</span>
          </Button>

          {showExplanationOptions && (
            <motion.div 
              className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-2 z-50 min-w-[150px]"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => handleExplain('technical')}
              >
                <BookOpen size={14} />
                <span className="text-xs">Técnica</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => handleExplain('formal')}
              >
                <BarChart2 size={14} />
                <span className="text-xs">Formal</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate(`/duvidas?article=${articleNumber}&content=${encodeURIComponent(typeof content === 'string' ? content : JSON.stringify(content))}`);
                  setShowExplanationOptions(false);
                }}
              >
                <MessageSquareMore size={14} />
                <span className="text-xs">Personalizada</span>
              </Button>
            </motion.div>
          )}
        </div>

        {onShowExample && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowExample}
            className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            <FileText size={16} />
            <span className="text-xs">Exemplo Prático</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onAddComment}
          className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
        >
          <PenLine size={16} />
          <span className="text-xs">Anotar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFavorite}
          className={`${isFavorite ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'} hover:bg-primary/20 flex items-center gap-1`}
        >
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
        </Button>

        {onCompare && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCompare}
                  className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
                >
                  <Scale size={16} />
                  <span className="text-xs">Comparar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background/90 backdrop-blur border border-border z-50">
                {hasCompareSelection 
                  ? "Comparando artigos..." 
                  : "Selecione outro artigo para comparar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onStudyMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onStudyMode}
            className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            <GraduationCap size={16} />
            <span className="text-xs">Estudar</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
};
