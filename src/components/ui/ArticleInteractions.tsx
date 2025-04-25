
import { useState, useRef } from "react";
import { MessageCircle, BookOpen, Bookmark, Volume2, MessageSquareMore, PenLine, BarChart2, Scale, GraduationCap, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string | { [key: string]: any };
  example?: string | { [key: string]: any };
  onExplain: (type: 'technical' | 'formal') => void;
  onAddComment: () => void;
  onStartNarration: (contentType: 'article') => void;
  onShowExample?: () => void; // New prop for showing examples
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
  hasCompareSelection = false
}: ArticleInteractionsProps) => {
  const [showExplanationOptions, setShowExplanationOptions] = useState(false);
  const navigate = useNavigate();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  const explainPopupVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="mt-6 flex justify-center pt-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div 
        className="flex items-center flex-wrap justify-center gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Narração */}
        <motion.button 
          className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
          onClick={() => onStartNarration('article')}
          variants={staggerItem}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          ref={(el) => (buttonRefs.current[0] = el)}
        >
          <Volume2 size={16} />
          <span className="text-xs">Narrar</span>
        </motion.button>
          
        {/* Explicação */}
        <div className="relative">
          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={() => setShowExplanationOptions(!showExplanationOptions)}
            variants={staggerItem}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            ref={(el) => (buttonRefs.current[1] = el)}
          >
            <MessageCircle size={16} />
            <span className="text-xs">Explicar</span>
          </motion.button>
          
          {showExplanationOptions && (
            <motion.div 
              className="absolute top-full left-0 mt-2 bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-2 z-50 min-w-[150px]"
              variants={explainPopupVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  onExplain('technical');
                  setShowExplanationOptions(false);
                }}
                whileHover={{ backgroundColor: "rgba(155, 135, 245, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen size={14} />
                <span>Técnica</span>
              </motion.button>
              
              <motion.button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  onExplain('formal');
                  setShowExplanationOptions(false);
                }}
                whileHover={{ backgroundColor: "rgba(155, 135, 245, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart2 size={14} />
                <span>Formal</span>
              </motion.button>
              
              <motion.button 
                className="w-full text-left px-3 py-2 rounded hover:bg-primary/10 text-gray-300 text-sm flex items-center gap-2 transition-colors"
                onClick={() => {
                  navigate(`/duvidas?article=${articleNumber}&content=${encodeURIComponent(typeof content === 'string' ? content : JSON.stringify(content))}`);
                  setShowExplanationOptions(false);
                }}
                whileHover={{ backgroundColor: "rgba(155, 135, 245, 0.2)" }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquareMore size={14} />
                <span>Personalizada</span>
              </motion.button>
            </motion.div>
          )}
        </div>
        
        {/* Exemplo Prático Button */}
        {onShowExample && (
          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={onShowExample}
            variants={staggerItem}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={16} />
            <span className="text-xs">Exemplo Prático</span>
          </motion.button>
        )}
          
        {/* Adicionar anotação */}
        <motion.button 
          className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
          onClick={onAddComment}
          variants={staggerItem}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          ref={(el) => (buttonRefs.current[2] = el)}
        >
          <PenLine size={16} />
          <span className="text-xs">Anotar</span>
        </motion.button>
        
        {/* Favorito */}
        <motion.button 
          className={`article-button shadow-button px-3 py-2 ${isFavorite ? 'bg-primary/30 text-primary-foreground' : 'bg-primary/10 text-primary'} text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30`}
          onClick={onToggleFavorite}
          variants={staggerItem}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: isFavorite ? 1.05 : 1 }}
          animate={{ 
            scale: isFavorite ? [1, 1.2, 1] : 1,
            transition: { duration: isFavorite ? 0.3 : 0 }
          }}
          ref={(el) => (buttonRefs.current[3] = el)}
        >
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
        </motion.button>

        {/* Comparar (with tooltip) */}
        {onCompare && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
                  onClick={onCompare}
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  ref={(el) => (buttonRefs.current[4] = el)}
                >
                  <Scale size={16} />
                  <span className="text-xs">Comparar</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent className="bg-background/90 backdrop-blur border border-border z-50">
                {hasCompareSelection 
                  ? "Comparando artigos..." 
                  : "Selecione outro artigo para comparar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Modo de estudo */}
        {onStudyMode && (
          <motion.button 
            className="article-button shadow-button px-3 py-2 bg-primary/10 text-primary text-sm font-medium flex items-center gap-1 rounded-full transition-all hover:bg-primary/30"
            onClick={onStudyMode}
            variants={staggerItem}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            ref={(el) => (buttonRefs.current[5] = el)}
          >
            <GraduationCap size={16} />
            <span className="text-xs">Estudar</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ArticleInteractions;
