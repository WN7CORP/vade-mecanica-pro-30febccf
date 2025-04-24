import { useState, useEffect, useMemo } from "react";
import FlashCard from "@/components/study/FlashCard";
import { PerformanceChart } from "@/components/study/PerformanceChart";
import { useFlashcardsProgress } from "@/hooks/useFlashcardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
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
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const { progress, updateProgress } = useFlashcardsProgress();
  const { preferences, updatePreferences, isLoading: preferencesLoading } = useThemePreferences();
  const { startSession, endSession } = useStudySession();
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [viewedCards, setViewedCards] = useState(0);
  const [correctCards, setCorrectCards] = useState(0);

  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('flashcards_pro').select('*');
        if (error) throw error;
        setFlashcards(data || []);
        
        if (data && data.length > 0) {
          const themes = Array.from(new Set(data.map(card => card.tema || '').filter(Boolean)));
          setAvailableThemes(themes);
        }
      } catch (error) {
        console.error("Erro ao buscar flashcards:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os flashcards.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setLoadingThemes(false);
      }
    };
    
    fetchFlashcards();
  }, []);

  useEffect(() => {
    const initSession = async () => {
      if (
        !currentSessionId && 
        flashcards.length > 0 && 
        preferences?.selected_themes && 
        preferences.selected_themes.length > 0
      ) {
        try {
          const session = await startSession.mutateAsync(preferences.selected_themes[0]);
          if (session?.id) {
            setCurrentSessionId(session.id);
          }
        } catch (error) {
          console.error("Failed to start study session:", error);
          toast({
            title: "Erro",
            description: "Não foi possível iniciar a sessão de estudo.",
            variant: "destructive"
          });
        }
      }
    };
    
    if (preferences && !preferencesLoading) {
      initSession();
    }
  }, [currentSessionId, flashcards.length, startSession, preferences, preferencesLoading]);

  useEffect(() => {
    return () => {
      if (currentSessionId && (viewedCards > 0 || correctCards > 0)) {
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
    if (!filteredFlashcards[currentIndex]) return;
    
    setViewedCards(prev => prev + 1);
    if (correct) setCorrectCards(prev => prev + 1);
    
    try {
      await updateProgress.mutateAsync({
        flashcardId: filteredFlashcards[currentIndex].id,
        correct,
        theme: filteredFlashcards[currentIndex].tema
      });
    } catch (error) {
      console.error("Error updating flashcard progress:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu progresso.",
        variant: "destructive"
      });
    }
  };

  const filteredFlashcards = useMemo(() => {
    if (!preferences?.selected_themes?.length) return [];
    
    return flashcards.filter(card => 
      preferences.selected_themes.includes(card.tema)
    );
  }, [flashcards, preferences?.selected_themes]);

  const orderedFlashcards = useMemo(() => {
    if (preferences?.order_mode === 'random') {
      return [...filteredFlashcards].sort(() => Math.random() - 0.5);
    }
    return filteredFlashcards;
  }, [filteredFlashcards, preferences?.order_mode]);

  const handleThemeSelect = async (themes: string[]) => {
    try {
      await updatePreferences.mutateAsync({ selected_themes: themes });
      setCurrentIndex(0);
      
      if (themes.length > 0 && !currentSessionId) {
        const session = await startSession.mutateAsync(themes[0]);
        if (session?.id) {
          setCurrentSessionId(session.id);
        }
      }
    } catch (error) {
      console.error("Error updating theme preferences:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas preferências de tema.",
        variant: "destructive"
      });
    }
  };

  const performanceData = useMemo(() => {
    if (!progress) return [];
    
    return availableThemes.map(theme => {
      const themeCards = flashcards.filter(card => card.tema === theme);
      const themeProgress = themeCards
        .map(card => progress.find(p => p.flashcard_id === card.id))
        .filter(Boolean);
      
      const correct = themeProgress.reduce((sum, p) => sum + (p?.correct_count || 0), 0);
      const total = themeProgress.reduce((sum, p) => sum + (p?.viewed_count || 0), 0);
      
      return { theme, correct, total: total || 0 };
    }).filter(item => item.total > 0);
  }, [flashcards, progress, availableThemes]);

  if (isLoading || preferencesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-[250px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

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
              {orderedFlashcards.length > 0 
                ? `${currentIndex + 1}/${orderedFlashcards.length} cartões`
                : "0/0 cartões"}
            </span>
          </div>
          <Progress value={orderedFlashcards.length > 0 
            ? (currentIndex + 1) / orderedFlashcards.length * 100 
            : 0} 
            className="h-1.5" 
          />
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Temas de estudo</label>
            {loadingThemes && <Skeleton className="h-4 w-4 rounded-full" />}
          </div>
          <ThemeSelector 
            themes={availableThemes}
            onThemeSelect={handleThemeSelect}
          />
        </div>
        
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
        <div className="text-center py-6 neomorph">
          <p className="text-gray-400">
            {preferences?.selected_themes?.length 
              ? "Nenhum flashcard disponível para os temas selecionados."
              : "Nenhum flashcard disponível. Selecione pelo menos um tema."}
          </p>
          {!preferences?.selected_themes?.length && (
            <Button
              variant="outline"
              className="mt-4 bg-primary/10 hover:bg-primary/20"
              onClick={() => {
                const scrollElement = document.querySelector('.space-y-1');
                if (scrollElement) {
                  scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              Selecionar temas
            </Button>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-primary-100 mb-3">
          Desempenho por Tema
        </h3>
        <div className="neomorph p-4">
          {performanceData.length > 0 ? (
            <PerformanceChart data={performanceData} />
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">
                Estude alguns flashcards para ver seu desempenho aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyContent;
