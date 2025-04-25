
import { useState, useEffect } from 'react';
import { BookOpen, Check, Clock, Timer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  numero: string;
  conteudo: string;
}

interface StudyProgress {
  articleId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  timeSpent: number; // em segundos
  lastStudied: string;
  difficulty: 'easy' | 'medium' | 'hard';
  notes?: string;
}

interface StudyProgressMarkersProps {
  lawName: string;
  articles: Article[];
  onArticleClick?: (articleId: string) => void;
}

export function StudyProgressMarkers({ 
  lawName, 
  articles,
  onArticleClick
}: StudyProgressMarkersProps) {
  const [progress, setProgress] = useState<Record<string, StudyProgress>>({});
  const [isTracking, setIsTracking] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    totalTimeSpent: 0
  });
  
  // Carregar progresso de estudo do localStorage ao inicializar
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(`studyProgress-${lawName}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        // Inicializar progresso para todos os artigos
        const initialProgress: Record<string, StudyProgress> = {};
        articles.forEach(article => {
          initialProgress[article.id] = {
            articleId: article.id,
            status: 'not-started',
            timeSpent: 0,
            lastStudied: '',
            difficulty: 'medium'
          };
        });
        setProgress(initialProgress);
        localStorage.setItem(`studyProgress-${lawName}`, JSON.stringify(initialProgress));
      }
    } catch (error) {
      console.error("Erro ao carregar progresso de estudo:", error);
    }
  }, [lawName, articles]);
  
  // Atualizar estatísticas quando o progresso mudar
  useEffect(() => {
    const stats = {
      completed: 0,
      inProgress: 0, 
      notStarted: 0,
      totalTimeSpent: 0
    };
    
    Object.values(progress).forEach(p => {
      if (p.status === 'completed') stats.completed++;
      else if (p.status === 'in-progress') stats.inProgress++;
      else stats.notStarted++;
      
      stats.totalTimeSpent += p.timeSpent;
    });
    
    setStats(stats);
  }, [progress]);
  
  // Gerenciar o timer quando estiver rastreando
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && currentArticle) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentArticle]);
  
  const startTracking = (articleId: string) => {
    setCurrentArticle(articleId);
    setIsTracking(true);
    setTimer(0);
    
    // Atualizar status do artigo para "em progresso"
    updateArticleProgress(articleId, {
      status: 'in-progress',
      lastStudied: new Date().toISOString()
    });
    
    toast({
      title: "Estudo iniciado",
      description: `Acompanhando tempo de estudo para o Artigo ${articles.find(a => a.id === articleId)?.numero || articleId}`,
    });
  };
  
  const stopTracking = () => {
    if (currentArticle) {
      updateArticleProgress(currentArticle, {
        timeSpent: (progress[currentArticle]?.timeSpent || 0) + timer
      });
    }
    
    setIsTracking(false);
    setCurrentArticle(null);
    setTimer(0);
  };
  
  const completeArticle = (articleId: string) => {
    if (isTracking && currentArticle === articleId) {
      stopTracking();
    }
    
    updateArticleProgress(articleId, {
      status: 'completed',
      lastStudied: new Date().toISOString()
    });
    
    toast({
      title: "Artigo Concluído",
      description: `Artigo ${articles.find(a => a.id === articleId)?.numero || articleId} marcado como estudado.`,
      variant: "default"
    });
  };
  
  const updateArticleProgress = (articleId: string, updates: Partial<StudyProgress>) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        [articleId]: {
          ...(prev[articleId] || {
            articleId,
            status: 'not-started',
            timeSpent: 0,
            lastStudied: '',
            difficulty: 'medium'
          }),
          ...updates
        }
      };
      
      // Salvar no localStorage
      localStorage.setItem(`studyProgress-${lawName}`, JSON.stringify(updated));
      return updated;
    });
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };
  
  const getStatusColor = (status: 'not-started' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-amber-500';
      default: return 'bg-gray-300';
    }
  };
  
  const getProgressPercentage = () => {
    const total = Object.keys(progress).length;
    if (total === 0) return 0;
    return Math.round((stats.completed / total) * 100);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-4 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-2">Progresso de Estudo</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Concluído: {getProgressPercentage()}%</span>
            <span>
              {stats.completed}/{Object.keys(progress).length} artigos
            </span>
          </div>
          
          <Progress value={getProgressPercentage()} className="h-2" />
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Check className="h-3 w-3" /> {stats.completed} concluídos
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {stats.inProgress} em progresso
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Tempo total: {formatTime(stats.totalTimeSpent)}
            </Badge>
          </div>
        </div>
      </div>
      
      {isTracking && currentArticle && (
        <div className="p-4 rounded-lg border bg-primary/10 animate-pulse shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary animate-spin-slow" />
              <div>
                <h4 className="font-medium">
                  Estudando: Artigo {articles.find(a => a.id === currentArticle)?.numero}
                </h4>
                <p className="text-sm text-muted-foreground">Tempo: {formatTime(timer)}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={stopTracking}>
                Pausar
              </Button>
              <Button size="sm" onClick={() => completeArticle(currentArticle)}>
                Concluir
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-base font-medium mb-1">Artigos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {articles.map(article => {
            const articleProgress = progress[article.id] || {
              status: 'not-started',
              timeSpent: 0,
              lastStudied: '',
              difficulty: 'medium'
            };
            
            return (
              <div 
                key={article.id} 
                className="flex items-center p-2 border rounded-md hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => onArticleClick?.(article.id)}
              >
                <div 
                  className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(articleProgress.status)}`}
                />
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <span className="font-medium">Art. {article.numero}</span>
                    <span className="text-xs text-muted-foreground">
                      {articleProgress.timeSpent > 0 ? formatTime(articleProgress.timeSpent) : ''}
                    </span>
                  </div>
                  
                  {articleProgress.lastStudied && (
                    <p className="text-xs text-muted-foreground">
                      {articleProgress.status === 'completed' ? 'Concluído' : 'Estudado'} em: {
                        new Date(articleProgress.lastStudied).toLocaleDateString('pt-BR')
                      }
                    </p>
                  )}
                </div>
                
                <div className="ml-2 space-x-1">
                  {articleProgress.status !== 'completed' && (
                    <>
                      {isTracking && currentArticle === article.id ? (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {
                          e.stopPropagation();
                          stopTracking();
                        }}>
                          <Timer className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {
                          e.stopPropagation();
                          startTracking(article.id);
                        }}>
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => {
                        e.stopPropagation();
                        completeArticle(article.id);
                      }}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
