import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FlashCard from "@/components/study/FlashCard";
import { PerformanceChart } from "@/components/study/PerformanceChart";
import { useFlashcardsProgress } from "@/hooks/useFlashcardsProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useStudyTimer } from "@/contexts/StudyTimerContext";
import { Book, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { lawName } = useParams<{ lawName: string }>();
  const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { studyTimeMinutes } = useStudyTimer();
  const { progress, updateProgress } = useFlashcardsProgress();

  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('flashcards_pro')
          .select('*');

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
  }, [] as { theme: string; correct: number; total: number }[]);

  return (
    <div style={{ background: '#131620' }} className="flex flex-col min-h-screen px-[9px]">
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-20 pb-10">
        <div className="neomorph p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-primary-200">
              <Book className="mr-2" size={18} />
              <span>{lawName ? decodeURIComponent(lawName) : "Estudo Geral"}</span>
            </div>
            
            <div className="flex items-center text-gray-400">
              <Timer className="mr-2" size={18} />
              <span>{studyTimeMinutes} {studyTimeMinutes === 1 ? "minuto" : "minutos"}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className="text-primary-100">
                {currentIndex + 1}/{flashcards.length} cartões
              </span>
            </div>
            <Progress value={(currentIndex + 1) / flashcards.length * 100} className="h-2" />
          </div>
        </div>
        
        <Tabs defaultValue="flashcards" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="flashcards" className="w-full">Flashcards</TabsTrigger>
            <TabsTrigger value="statistics" className="w-full">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flashcards">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ) : flashcards.length > 0 ? (
              <FlashCard
                question={flashcards[currentIndex].pergunta}
                answer={flashcards[currentIndex].resposta}
                explanation={flashcards[currentIndex].explicacao}
                relatedArticles={flashcards[currentIndex].artigos}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onRate={handleRate}
                hasNext={currentIndex < flashcards.length - 1}
                hasPrevious={currentIndex > 0}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhum flashcard disponível.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="statistics">
            <div className="neomorph p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-4">
                Desempenho por Tema
              </h3>
              <PerformanceChart data={performanceData} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyMode;
