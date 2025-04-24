import React, { useState, useEffect, useMemo } from "react";
import FlashCard from "@/components/study/FlashCard";
import { useFlashcardsProgress } from "@/hooks/useFlashcardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useThemePreferences } from "@/hooks/useThemePreferences";
import { useStudySession } from "@/hooks/useStudySession";
import { StudyProgress } from "./StudyProgress";
import { StudySettings } from "./StudySettings";
import { StudyPerformanceView } from "./StudyPerformanceView";

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
      <StudyProgress
        lawName={lawName}
        studyTimeMinutes={studyTimeMinutes}
        currentIndex={currentIndex}
        totalCards={orderedFlashcards.length}
      />
      
      <StudySettings
        themes={availableThemes}
        onThemeSelect={handleThemeSelect}
        loadingThemes={loadingThemes}
      />

      {orderedFlashcards.length > 0 && (
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
      )}
      
      <StudyPerformanceView performanceData={performanceData} />
    </div>
  );
};

export default StudyContent;
