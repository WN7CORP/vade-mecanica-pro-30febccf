import { useState } from "react";
import { MessageCircle, BookOpen, Bookmark, Volume2, PenLine, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArticleExplanation } from "./article/ArticleExplanation";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string | {
    [key: string]: any;
  };
  example?: string | {
    [key: string]: any;
  };
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: (contentType: 'article') => void;
  onShowExample?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCompare?: () => void;
  onStudyMode?: () => void;
  hasCompareSelection?: boolean;
}

const ArticleInteractions = ({
  articleNumber,
  content,
  example,
  onExplain,
  onAddComment,
  onStartNarration,
  onShowExample,
  isFavorite,
  onToggleFavorite,
  onCompare,
  onStudyMode,
  hasCompareSelection
}: ArticleInteractionsProps) => {
  const [showExplanationMenu, setShowExplanationMenu] = useState(false);
  const isMobile = useIsMobile();
  const hasExample = example && example !== "" && example !== "{}" && example !== "null";

  const buttonVariants = {
    initial: {
      scale: 1
    },
    hover: {
      scale: 1.05
    },
    tap: {
      scale: 0.95
    }
  };

  return <motion.div className="mt-6 flex justify-center pt-3" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex items-center flex-wrap justify-center gap-2">
        <motion.button className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30" onClick={() => onStartNarration('article')} variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Volume2 size={16} />
          <span className="text-xs">Narrar</span>
        </motion.button>

        {hasExample && <motion.button className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30" onClick={onShowExample} variants={buttonVariants} whileHover="hover" whileTap="tap">
            <FileText size={16} />
            <span className="text-xs">Exemplo Prático</span>
          </motion.button>}

        <motion.button className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30" onClick={onAddComment} variants={buttonVariants} whileHover="hover" whileTap="tap">
          <PenLine size={16} />
          <span className="text-xs">Anotar</span>
        </motion.button>

        <motion.button className={`article-button shadow-button px-3 py-2 ${isFavorite ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'} text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30`} onClick={onToggleFavorite} variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
        </motion.button>
        
        {onCompare && <motion.button className={`article-button shadow-button px-3 py-2 ${hasCompareSelection ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'} text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30`} onClick={onCompare} variants={buttonVariants} whileHover="hover" whileTap="tap">
            <BookOpen size={16} />
            <span className="text-xs">Comparar</span>
          </motion.button>}
        
        {onStudyMode && (
          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={onStudyMode}
            variants={buttonVariants}
            whileHover="hover" 
            whileTap="tap"
          >
            <BookOpen size={16} />
            <span className="text-xs">Modo Estudo</span>
          </motion.button>
        )}
      </div>

      <ArticleExplanation isOpen={showExplanationMenu} onClose={() => setShowExplanationMenu(false)} onExplain={onExplain} articleNumber={articleNumber} content={content} />
    </motion.div>;
};

export default ArticleInteractions;
