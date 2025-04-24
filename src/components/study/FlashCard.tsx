
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlipHorizontal, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";

interface FlashCardProps {
  question: string;
  answer: string;
  onNext: () => void;
  onPrevious: () => void;
  onRate: (correct: boolean) => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const FlashCard = ({ 
  question, 
  answer, 
  onNext, 
  onPrevious, 
  onRate,
  hasNext,
  hasPrevious
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
      <div 
        className={`neomorph p-6 transition-all duration-500 min-h-[300px] flex flex-col ${
          isFlipped ? 'bg-primary-900/20' : ''
        }`}
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className={`flex flex-col justify-between flex-1 ${
            isFlipped ? 'opacity-0 absolute' : 'opacity-100'
          }`}
          style={{
            transition: 'opacity 0.15s ease-in-out',
            backfaceVisibility: 'hidden'
          }}
        >
          <div>
            <h3 className="text-lg font-semibold text-primary-100 mb-4">Questão</h3>
            <p className="text-white">{question}</p>
          </div>
        </div>
        
        <div 
          className={`flex flex-col justify-between flex-1 ${
            isFlipped ? 'opacity-100' : 'opacity-0 absolute'
          }`}
          style={{
            transition: 'opacity 0.15s ease-in-out',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden'
          }}
        >
          <div>
            <h3 className="text-lg font-semibold text-primary-100 mb-4">Resposta</h3>
            <p className="text-white">{answer}</p>
          </div>
          
          {!hasRated && (
            <div className="mt-4 flex justify-center gap-4">
              <Button 
                variant="outline" 
                className="bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200"
                onClick={() => handleRate(false)}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Errei
              </Button>
              <Button 
                variant="outline" 
                className="bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200"
                onClick={() => handleRate(true)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Acertei
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button
          variant="outline"
          onClick={handleFlip}
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          <FlipHorizontal className="mr-2 h-4 w-4" />
          {isFlipped ? "Ver pergunta" : "Ver resposta"}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!hasNext}
          className="bg-primary/10 text-primary hover:bg-primary/20"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FlashCard;
