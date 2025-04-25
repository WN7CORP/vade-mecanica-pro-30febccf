
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Volume2, PenLine, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { generateFlashcardsForArticle } from "@/services/flashcardService";
import { toast } from "@/hooks/use-toast";

interface ArticleInteractionsProps {
  articleNumber: string;
  content: string | { [key: string]: any };
  example?: string | { [key: string]: any };
  onAddComment: () => void;
  onStartNarration: () => void;
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
  onAddComment,
  onStartNarration,
  onShowExample,
  isFavorite,
  onToggleFavorite,
  onCompare,
  onStudyMode,
  hasCompareSelection,
}: ArticleInteractionsProps) => {
  const navigate = useNavigate();
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const handleStudyMode = async () => {
    // Ensure content is a string
    const safeContent = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);

    setIsGeneratingFlashcards(true);
    
    try {
      const flashcards = await generateFlashcardsForArticle(
        "Constituição Federal", 
        articleNumber, 
        safeContent
      );

      if (flashcards.length > 0) {
        // Navigate to study mode with generated flashcards
        navigate(`/study/${encodeURIComponent("Constituição Federal")}`, {
          state: { generatedFlashcards: flashcards }
        });
      } else {
        toast({
          title: "Erro ao gerar flashcards",
          description: "Não foi possível criar flashcards para este artigo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Flashcard generation error:', error);
      toast({
        title: "Erro ao gerar flashcards",
        description: "Ocorreu um erro ao tentar criar flashcards.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFlashcards(false);
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
        <button 
          onClick={() => onStartNarration()} 
          className="article-button bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
        >
          <Volume2 size={16} />
          <span className="text-xs">Narrar</span>
        </button>

        <button 
          onClick={handleStudyMode} 
          disabled={isGeneratingFlashcards}
          className={`article-button ${
            isGeneratingFlashcards 
              ? 'bg-primary/20 text-primary/50 cursor-not-allowed' 
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          } flex items-center gap-1`}
        >
          <BookOpen size={16} />
          <span className="text-xs">
            {isGeneratingFlashcards ? 'Gerando...' : 'Estudar'}
          </span>
        </button>

        {onShowExample && (
          <button 
            onClick={onShowExample} 
            className="article-button bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            <FileText size={16} />
            <span className="text-xs">Exemplo</span>
          </button>
        )}

        <button 
          onClick={onAddComment} 
          className="article-button bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
        >
          <PenLine size={16} />
          <span className="text-xs">Anotar</span>
        </button>

        <button 
          onClick={onToggleFavorite} 
          className={`article-button ${
            isFavorite 
              ? 'bg-primary/30 text-primary-foreground' 
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          } flex items-center gap-1`}
        >
          <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} />
          <span className="text-xs">{isFavorite ? "Favoritado" : "Favoritar"}</span>
        </button>

        {onCompare && (
          <button 
            onClick={onCompare} 
            className="article-button bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"
          >
            <BookOpen size={16} />
            <span className="text-xs">Comparar</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ArticleInteractions;
