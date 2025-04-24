import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FlashCard from "@/components/study/FlashCard";
import { PerformanceChart } from "@/components/study/PerformanceChart";
import { useFlashcardsProgress } from "@/hooks/useFlashcardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useStudyTimer } from "@/contexts/StudyTimerContext";
import { Book, Timer, ArrowUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
const StudyMode = () => {
  const {
    lawName
  } = useParams<{
    lawName: string;
  }>();
  const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const {
    studyTimeMinutes
  } = useStudyTimer();
  const {
    progress,
    updateProgress
  } = useFlashcardsProgress();
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from('flashcards_pro').select('*');
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
  const handleRate = async (correct: boolean) => {
    if (flashcards[currentIndex]) {
      await updateProgress.mutateAsync({
        flashcardId: flashcards[currentIndex].id,
        correct
      });
    }
  };

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

  const { preferences, updatePreferences } = useThemePreferences();
  const { startSession, endSession } = useStudySession();
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [viewedCards, setViewedCards] = useState(0);
  const [correctCards, setCorrectCards] = useState(0);

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

  const handleRate2 = async (correct: boolean) => {
    setViewedCards(prev => prev + 1);
    if (correct) setCorrectCards(prev => prev + 1);
    await handleRate(correct);
  };

  const uniqueThemes = useMemo(() => 
    Array.from(new Set(flashcards.map(card => card.tema)))
  , [flashcards]);

  return <div style={{
    background: '#131620'
  }} className="flex flex-col min-h-screen md:px-4 px-0">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-16 pb-6">
        <div className="neomorph p-3 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-primary-200">
              <Book className="mr-2" size={16} />
              <span className="text-sm">{lawName ? decodeURIComponent(lawName) : "Estudo Geral"}</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <Timer className="mr-2" size={16} />
              <span className="text-sm">{studyTimeMinutes} {studyTimeMinutes === 1 ? "minuto" : "minutos"}</span>
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progresso</span>
              <span className="text-primary-100">
                {currentIndex + 1}/{flashcards.length} cartões
              </span>
            </div>
            <Progress value={(currentIndex + 1) / flashcards.length * 100} className="h-1.5" />
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

        <Tabs defaultValue="flashcards" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="flashcards" className="w-full">Flashcards</TabsTrigger>
            <TabsTrigger value="statistics" className="w-full">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flashcards">
            {isLoading ? <div className="space-y-3">
                <Skeleton className="h-[250px] w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div> : orderedFlashcards.length > 0 ? <FlashCard
                question={orderedFlashcards[currentIndex].pergunta}
                answer={orderedFlashcards[currentIndex].resposta}
                explanation={orderedFlashcards[currentIndex].explicacao}
                relatedArticles={orderedFlashcards[currentIndex].artigos}
                theme={orderedFlashcards[currentIndex].tema}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onRate={handleRate2}
                hasNext={currentIndex < orderedFlashcards.length - 1}
                hasPrevious={currentIndex > 0}
              /> : <div className="text-center py-6">
                <p className="text-gray-400">Nenhum flashcard disponível.</p>
              </div>}
          </TabsContent>
          
          <TabsContent value="statistics">
            <div className="neomorph p-4">
              <h3 className="text-lg font-semibold text-primary-100 mb-3">
                Desempenho por Tema
              </h3>
              <PerformanceChart data={performanceData} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {showScrollTop && <Button variant="outline" size="icon" onClick={scrollToTop} className="fixed bottom-20 right-4 z-50 bg-primary/20 text-primary hover:bg-primary/30 rounded-full shadow-lg">
          <ArrowUp className="h-4 w-4" />
        </Button>}
      
      <Footer />
    </div>;
};
export default StudyMode;
