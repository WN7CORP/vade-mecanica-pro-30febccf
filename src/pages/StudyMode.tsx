import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FlashCard from "@/components/study/FlashCard";
import { ArrowLeft, Book, Timer, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserActivity } from "@/hooks/useUserActivity";
import { useStudyTimer } from "@/contexts/StudyTimerContext";

interface FlashCardData {
  id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  lawName: string;
}

const StudyMode = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<FlashCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const { studyTimeMinutes } = useStudyTimer();
  const { logUserActivity } = useUserActivity(userId);
  
  // Timer for study session
  
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);
  
  // Fetch flashcards
  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would fetch from an API or database
        // For now, we'll generate sample flashcards based on the law name
        
        // This would be replaced with actual API call in production
        setTimeout(() => {
          const sampleFlashcards: FlashCardData[] = [
            {
              id: 1,
              question: `O que é considerado um direito fundamental segundo o ${lawName}?`,
              answer: "Os direitos fundamentais são aqueles inerentes à pessoa humana, essenciais para garantir a dignidade, liberdade, igualdade e outros valores básicos.",
              difficulty: "easy",
              category: "Teoria Geral",
              lawName: lawName || ""
            },
            {
              id: 2,
              question: `Quais são os princípios básicos estabelecidos pelo ${lawName}?`,
              answer: "Os princípios básicos incluem legalidade, impessoalidade, moralidade, publicidade e eficiência, entre outros específicos para cada área do direito.",
              difficulty: "medium",
              category: "Princípios",
              lawName: lawName || ""
            },
            {
              id: 3,
              question: `Como são regulamentadas as sanções no ${lawName}?`,
              answer: "As sanções são regulamentadas de forma a garantir a proporcionalidade entre a infração cometida e a punição aplicada, respeitando o devido processo legal.",
              difficulty: "hard",
              category: "Sanções",
              lawName: lawName || ""
            },
            {
              id: 4,
              question: "Qual a diferença entre normas cogentes e normas dispositivas?",
              answer: "Normas cogentes são imperativas e não podem ser afastadas pela vontade das partes. Normas dispositivas podem ser afastadas pela vontade das partes.",
              difficulty: "medium",
              category: "Teoria Geral",
              lawName: lawName || ""
            },
            {
              id: 5,
              question: "O que é um princípio interpretativo no contexto jurídico?",
              answer: "Princípios interpretativos são diretrizes que orientam a aplicação e interpretação das normas jurídicas, auxiliando na resolução de conflitos normativos.",
              difficulty: "hard",
              category: "Interpretação",
              lawName: lawName || ""
            }
          ];
          
          setFlashcards(sampleFlashcards);
          setIsLoading(false);
          
          if (userId) {
            logUserActivity('study_session_start', lawName || '', '');
          }
        }, 1500); // Simulate API delay
      } catch (error) {
        console.error("Erro ao buscar flashcards:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os flashcards. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchFlashcards();
    
    return () => {
      if (userId && lawName) {
        logUserActivity('study_session_end', lawName, '');
      }
    };
  }, [lawName, userId, logUserActivity]);
  
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
  
  const handleRate = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setIncorrectAnswers(incorrectAnswers + 1);
    }
    
    if (userId && lawName) {
      logUserActivity(
        correct ? 'flashcard_correct' : 'flashcard_incorrect', 
        lawName, 
        flashcards[currentIndex]?.id.toString() || ''
      );
    }
  };
  
  const totalAnswered = correctAnswers + incorrectAnswers;
  const progress = flashcards.length > 0 ? Math.round((totalAnswered / flashcards.length) * 100) : 0;
  
  return (
    <div 
      style={{ background: '#131620' }} 
      className="flex flex-col min-h-screen px-[9px]"
    >
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-20 pb-10">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => navigate(lawName ? `/lei/${lawName}` : "/leis")}
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar para a lei
          </Button>
          
          <h1 className="text-xl font-heading font-semibold text-primary-300">
            Modo de Estudo
          </h1>
        </div>
        
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
                {totalAnswered}/{flashcards.length} cartões
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            <div className="text-center">
              <div className="text-green-400 font-semibold">{correctAnswers}</div>
              <div className="text-xs text-gray-400">Acertos</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">{incorrectAnswers}</div>
              <div className="text-xs text-gray-400">Erros</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-semibold">
                {totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400">Taxa de Acerto</div>
            </div>
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
                question={flashcards[currentIndex].question}
                answer={flashcards[currentIndex].answer}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onRate={handleRate}
                hasNext={currentIndex < flashcards.length - 1}
                hasPrevious={currentIndex > 0}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhum flashcard disponível para esta lei.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="statistics">
            <div className="neomorph p-6">
              <h3 className="text-lg font-semibold text-primary-100 mb-4 flex items-center">
                <Award className="mr-2" size={20} />
                Seu desempenho
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="neomorph-sm p-4 text-center">
                    <div className="text-2xl font-bold text-primary-200">
                      {studyTimeMinutes}
                    </div>
                    <div className="text-sm text-gray-400">Minutos estudados</div>
                  </div>
                  
                  <div className="neomorph-sm p-4 text-center">
                    <div className="text-2xl font-bold text-primary-200">
                      {totalAnswered}
                    </div>
                    <div className="text-sm text-gray-400">Cartões respondidos</div>
                  </div>
                  
                  <div className="neomorph-sm p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {correctAnswers}
                    </div>
                    <div className="text-sm text-gray-400">Acertos</div>
                  </div>
                  
                  <div className="neomorph-sm p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {incorrectAnswers}
                    </div>
                    <div className="text-sm text-gray-400">Erros</div>
                  </div>
                </div>
                
                <div className="neomorph-sm p-4">
                  <div className="mb-2 text-sm text-gray-400">Distribuição de dificuldade</div>
                  <div className="h-6 w-full bg-muted rounded-full overflow-hidden">
                    <div className="flex h-full">
                      <div className="bg-green-500 h-full" style={{ width: '40%' }}></div>
                      <div className="bg-yellow-500 h-full" style={{ width: '35%' }}></div>
                      <div className="bg-red-500 h-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Fácil (40%)</span>
                    <span>Médio (35%)</span>
                    <span>Difícil (25%)</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyMode;
