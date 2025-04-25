
import { useState } from "react";
import { MessageCircle, BookOpen, Bookmark, Volume2, PenLine, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArticleExplanation } from "./article/ArticleExplanation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string | { [key: string]: any };
  example?: string | { [key: string]: any };
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
  hasCompareSelection,
}: ArticleInteractionsProps) => {
  const [showExplanationMenu, setShowExplanationMenu] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const hasExample = example && example !== "" && example !== "{}" && example !== "null";

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const handleCompare = () => {
    if (onCompare) {
      if (!hasCompareSelection) {
        setShowCompareDialog(true);
      } else {
        onCompare();
      }
    }
  };

  return (
    <>
      <motion.div 
        className="mt-6 flex justify-center pt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center flex-wrap justify-center gap-2">
          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={() => onStartNarration('article')}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Volume2 size={16} />
            <span className="text-xs">Narrar</span>
          </motion.button>

          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={() => setShowExplanationMenu(true)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <MessageCircle size={16} />
            <span className="text-xs">Explicar</span>
          </motion.button>

          {hasExample && (
            <motion.button 
              className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
              onClick={onShowExample}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FileText size={16} />
              <span className="text-xs">Exemplo Prático</span>
            </motion.button>
          )}

          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={onAddComment}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <PenLine size={16} />
            <span className="text-xs">Anotar</span>
          </motion.button>

          <motion.button 
            className={`article-button shadow-button px-3 py-2 ${
              isFavorite ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'
            } text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30`}
            onClick={onToggleFavorite}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
            <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
          </motion.button>
          
          {onCompare && (
            <motion.button 
              className={`article-button shadow-button px-3 py-2 ${
                hasCompareSelection ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'
              } text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30`}
              onClick={handleCompare}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <BookOpen size={16} />
              <span className="text-xs">Comparar</span>
            </motion.button>
          )}
          
          {onStudyMode && (
            <motion.button 
              className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
              onClick={onStudyMode}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <BookOpen size={16} />
              <span className="text-xs">Estudar</span>
            </motion.button>
          )}
        </div>

        <ArticleExplanation
          isOpen={showExplanationMenu}
          onClose={() => setShowExplanationMenu(false)}
          onExplain={onExplain}
          articleNumber={articleNumber}
          content={content}
        />

        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="bg-card border rounded-lg shadow-xl max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-primary">Comparar Artigos</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-300">
                Selecione outro artigo para comparar com o artigo {articleNumber}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Navegue até outro artigo e clique em "Comparar" novamente para iniciar a comparação.
              </p>
            </div>
            <div className="flex justify-end">
              <motion.button 
                className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-md"
                onClick={() => setShowCompareDialog(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                OK, entendi
              </motion.button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};

export default ArticleInteractions;
