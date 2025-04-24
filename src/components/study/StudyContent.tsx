
import { useState, useEffect, useMemo } from "react";
import FlashCard from "@/components/study/FlashCard";
import { PerformanceChart } from "@/components/study/PerformanceChart";
import { useFlashcardsProgress } from "@/hooks/useFlashcardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Book } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemePreferences } from "@/hooks/useThemePreferences";
import { useStudySession } from "@/hooks/useStudySession";
import { ThemeSelector } from "@/components/study/ThemeSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FlashCardData {
  id: string;
  pergunta: string;
  resposta: string;
  explicacao?: string;
  tema: string;
  artigos: string;
  area: string;
}

interface StudyContentProps {
  lawName?: string;
  studyTimeMinutes?: number;
}

const StudyContent = ({ lawName, studyTimeMinutes = 0 }: StudyContentProps) => {
  const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { progress, updateProgress } = useFlashcardsProgress();
  const { preferences, updatePreferences } = useThemePreferences();
  const { startSession, endSession } = useStudySession();
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [viewedCards, setViewedCards] = useState(0);
  const [correctCards, setCorrectCards] = useState(0);

  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('flashcards_pro').select('*');
        if (error) throw error;
        setFlashcards(data);
      } catch (error) {
        console.error("Erro ao buscar flashcards:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os flashcards.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  // Initialize session when starting study
  useEffect(() => {
    const initSession = async () => {
      if (!currentSessionId && flashcards.length > 0) {
        const session = await startSession.mutateAsync(preferences?.selected_themes[0]);
        setCurrentSessionId(session.id);
      }
    };
    initSession();
  }, [currentSessionId, flashcards.length, startSession, preferences?.selected_themes]);

  // End session when component unmounts or all cards are done
  useEffect(() => {
    return () => {
      if (currentSessionId) {
        endSession.mutate({
          sessionId: currentSessionId,
          flashcardsViewed: viewedCards,
          flashcardsCorrect: correctCards
        });
      }
    };
  }, [currentSessionId, viewedCards, correctCards, endSession]);

  const handleNext = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRate = async (correct: boolean) => {
    setViewedCards(prev => prev + 1);
    if (correct) setCorrectCards(prev => prev + 1);
    
    if (filteredFlashcards[currentIndex]) {
      await updateProgress.mutateAsync({
        flashcardId: filteredFlashcards[currentIndex].id,
        correct,
        theme: filteredFlashcards[currentIndex].tema
      });
    }
  };

  // Filter flashcards by selected themes
  const filteredFlashcards = useMemo(() => {
    if (!preferences?.selected_themes.length) return flashcards;
    return flashcards.filter(card => preferences.selected_themes.includes(card.tema));
  }, [flashcards, preferences?.selected_themes]);

  // Order flashcards based on preference
  const orderedFlashcards = useMemo(() => {
    if (preferences?.order_mode === 'random') {
      return [...filteredFlashcards].sort(() => Math.random() - 0.5);
    }
    return filteredFlashcards;
  }, [filteredFlashcards, preferences?.order_mode]);

  const uniqueThemes = useMemo(() => 
    Array.from(new Set(flashcards.map(card => card.tema)))
  , [flashcards]);

  // Calculate performance data for the chart
  const performanceData = flashcards.reduce((acc, card) => {
    const cardProgress = progress?.find(p => p.flashcard_id === card.id);
    if (cardProgress) {
      const themeData = acc.find(d => d.theme === card.tema);
      if (themeData) {
        themeData.correct += cardProgress.correct_count;
        themeData.total += cardProgress.viewed_count;
      } else {
        acc.push({
          theme: card.tema,
          correct: cardProgress.correct_count,
          total: cardProgress.viewed_count
        });
      }
    }
    return acc;
  }, [] as {
    theme: string;
    correct: number;
    total: number;
  }[]);

  return (
    <div className="space-y-4">
      <div className="neomorph p-3 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-primary-200">
            <Book className="mr-2" size={16} />
            <span className="text-sm">{lawName ? decodeURIComponent(lawName) : "Estudo Geral"}</span>
          </div>
          
          {studyTimeMinutes > 0 && (
            <div className="flex items-center text-gray-400">
              <span className="text-sm">{studyTimeMinutes} {studyTimeMinutes === 1 ? "minuto" : "minutos"}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1 mt-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Progresso</span>
            <span className="text-primary-100">
              {currentIndex + 1}/{orderedFlashcards.length} cartões
            </span>
          </div>
          <Progress value={(currentIndex + 1) / Math.max(orderedFlashcards.length, 1) * 100} className="h-1.5" />
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <ThemeSelector 
          themes={uniqueThemes}
          onThemeSelect={(themes) => 
            updatePreferences.mutate({ selected_themes: themes })
          }
        />
        
        <div className="flex items-center space-x-2">
          <Switch
            id="order-mode"
            checked={preferences?.order_mode === 'random'}
            onCheckedChange={(checked) =>
              updatePreferences.mutate({ 
                order_mode: checked ? 'random' : 'sequential' 
              })
            }
          />
          <Label htmlFor="order-mode">Ordem aleatória</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[250px] w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ) : orderedFlashcards.length > 0 ? (
        <div className="mb-8">
          <FlashCard
            question={orderedFlashcards[currentIndex]?.pergunta || ""}
            answer={orderedFlashcards[currentIndex]?.resposta || ""}
            explanation={orderedFlashcards[currentIndex]?.explicacao}
            relatedArticles={orderedFlashcards[currentIndex]?.artigos}
            theme={orderedFlashcards[currentIndex]?.tema}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onRate={handleRate}
            hasNext={currentIndex < orderedFlashcards.length - 1}
            hasPrevious={currentIndex > 0}
          />
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">
            {preferences?.selected_themes.length 
              ? "Nenhum flashcard disponível para os temas selecionados."
              : "Nenhum flashcard disponível. Selecione pelo menos um tema."}
          </p>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-primary-100 mb-3">
          Desempenho por Tema
        </h3>
        <div className="neomorph p-4">
          <PerformanceChart data={performanceData} />
        </div>
      </div>
    </div>
  );
};

export default StudyContent;
