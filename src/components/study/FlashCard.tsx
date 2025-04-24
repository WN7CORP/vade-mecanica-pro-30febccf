
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FlipHorizontal, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface FlashCardProps {
  question: string;
  answer: string;
  explanation?: string;
  relatedArticles?: string;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (correct: boolean) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const FlashCard = ({ 
  question, 
  answer, 
  explanation,
  relatedArticles,
  onNext, 
  onPrevious, 
  onRate,
  hasNext,
  hasPrevious
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this with the animation duration
  };

  const handleRate = (correct: boolean) => {
    onRate(correct);
    setHasRated(true);
  };

  const handleNext = () => {
    onNext();
    setIsFlipped(false);
    setHasRated(false);
  };

  const handlePrevious = () => {
    onPrevious();
    setIsFlipped(false);
    setHasRated(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="perspective"
      >
        <motion.div 
          className={`neomorph p-6 transition-all duration-500 min-h-[300px] flex flex-col ${
            isFlipped ? 'bg-primary-900/20' : ''
          }`}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence initial={false} mode="wait">
            {!isFlipped ? (
              <motion.div 
                key="question"
                className="flex flex-col justify-between flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">Questão</h3>
                  <p className="text-white">{question}</p>
                </div>

                {relatedArticles && (
                  <div className="mt-4 text-sm text-gray-400">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <BookOpen className="h-4 w-4" />
                          Artigos Relacionados
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        {relatedArticles}
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="answer"
                className="flex flex-col justify-between flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ 
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-4">Resposta</h3>
                  <p className="text-white">{answer}</p>

                  {explanation && (
                    <div className="mt-4">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Ver Explicação
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          {explanation}
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  )}
                </div>
                
                {!hasRated && (
                  <motion.div 
                    className="mt-4 flex justify-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <Button 
                      variant="outline" 
                      className="bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
                      onClick={() => handleRate(false)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Errei
                      </motion.div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200 transition-all duration-300"
                      onClick={() => handleRate(true)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Acertei
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex justify-between items-center mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
        >
          <motion.div
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </motion.div>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleFlip}
          className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
        >
          <motion.div
            whileHover={{ rotateY: 180, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <FlipHorizontal className="mr-2 h-4 w-4" />
            {isFlipped ? "Ver pergunta" : "Ver resposta"}
          </motion.div>
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
        >
          <motion.div
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};

export default FlashCard;
