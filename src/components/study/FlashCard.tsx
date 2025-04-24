import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, BookOpen, HelpCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toast } from "@/hooks/use-toast";

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
  hasPrevious,
  theme
}: FlashCardProps & { theme?: string }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const handleRate = (correct: boolean) => {
    onRate(correct);
    setHasRated(true);
    toast({
      title: correct ? "Resposta correta!" : "Resposta incorreta",
      description: correct ? "Continue assim!" : "Continue estudando!",
      variant: correct ? "default" : "destructive"
    });
  };

  const handleNext = () => {
    onNext();
    setShowExplanation(false);
    setHasRated(false);
  };

  const handlePrevious = () => {
    onPrevious();
    setShowExplanation(false);
    setHasRated(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
        <div className="neomorph p-5 min-h-[250px] flex flex-col">
          {theme && (
            <div className="mb-4 text-sm text-primary-300 font-medium">
              Tema: {theme}
            </div>
          )}
          
          <div className="flex flex-col justify-between flex-1 space-y-4">
            <div className="py-0 my-0 mx-0 px-0">
              <h3 className="text-md font-semibold text-primary-100 mb-2">Questão</h3>
              <p className="text-white mb-4" style={{ fontSize: `${fontSize}px` }}>{question}</p>
              
              <div className="h-px w-full bg-gray-700/30 my-3"></div>
              
              <h3 className="text-md font-semibold text-primary-100 mb-2">Resposta</h3>
              <p className="text-white" style={{ fontSize: `${fontSize}px` }}>{answer}</p>
            </div>

            {!showExplanation && explanation && <Button variant="outline" onClick={() => setShowExplanation(true)} className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-2 mt-4">
                <Info className="h-4 w-4" />
                Ver Explicação
              </Button>}

            {showExplanation && explanation && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-md bg-primary-900/20 border border-primary-500/20">
                <h4 className="text-sm font-medium text-primary-300 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Explicação
                </h4>
                <p className="text-gray-200" style={{ fontSize: `${fontSize}px` }}>{explanation}</p>
                <Button variant="ghost" size="sm" onClick={() => setShowExplanation(false)} className="mt-2">
                  Fechar
                </Button>
              </motion.div>}

            {relatedArticles && <div className="mt-4 text-sm text-gray-400">
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
              </div>}
            
            {!hasRated && <motion.div className="flex justify-center gap-4 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                <div className="flex items-center justify-center w-full gap-3">
                  <span className="text-sm text-gray-400">Como foi seu desempenho?</span>
                  <Button variant="outline" className="bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200" onClick={() => handleRate(false)}>
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Errei
                  </Button>
                  <Button variant="outline" className="bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200" onClick={() => handleRate(true)}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Acertei
                  </Button>
                </div>
              </motion.div>}

            <div className="flex items-center justify-center gap-4 mt-4">
              <Button size="sm" onClick={() => setFontSize(prev => Math.max(prev - 1, 12))} className="px-2" variant="ghost">
                A-
              </Button>
              <span className="text-xs text-gray-400">Tamanho da fonte</span>
              <Button size="sm" onClick={() => setFontSize(prev => Math.min(prev + 1, 24))} className="px-2" variant="ghost">
                A+
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="flex justify-between items-center mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <Button variant="outline" onClick={handlePrevious} disabled={!hasPrevious} className="bg-primary/10 text-primary hover:bg-primary/20">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button variant="outline" onClick={handleNext} disabled={!hasNext} className="bg-primary/10 text-primary hover:bg-primary/20">
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default FlashCard;
