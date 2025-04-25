
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FlashCard from "@/components/study/FlashCard";
import { LawFlashcard } from "@/services/flashcardService";

const StudyMode = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const location = useLocation();
  const [flashcards, setFlashcards] = useState<LawFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      // Check if flashcards were passed from article generation
      const generatedFlashcards = location.state?.generatedFlashcards;
      
      if (generatedFlashcards) {
        setFlashcards(generatedFlashcards);
        setIsLoading(false);
        return;
      }

      // If no generated flashcards, fetch from database
      try {
        const { data, error } = await supabase
          .from('law_flashcards')
          .select('*')
          .eq('law_name', lawName);

        if (data) {
          setFlashcards(data as LawFlashcard[]);
        } else {
          console.error('Error fetching flashcards:', error);
        }
      } catch (error) {
        console.error('Fetch flashcards error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [lawName, location.state]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRate = () => {
    // Implement flashcard rating logic
  };

  if (isLoading) {
    return <div>Carregando flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div>Nenhum flashcard encontrado.</div>;
  }

  return (
    <div className="study-mode-container">
      <FlashCard 
        question={flashcards[currentIndex].question}
        answer={flashcards[currentIndex].answer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onRate={handleRate}
        hasNext={currentIndex < flashcards.length - 1}
        hasPrevious={currentIndex > 0}
      />
    </div>
  );
};

export default StudyMode;
