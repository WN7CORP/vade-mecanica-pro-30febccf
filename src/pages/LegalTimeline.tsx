
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineEntry {
  id: string;
  lawName: string;
  date: string;
  description: string;
  changeType: 'addition' | 'modification' | 'removal';
  articleNumber?: string;
}

const LegalTimeline = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from API or database
        setTimeout(() => {
          // Sample data
          const mockTimeline: TimelineEntry[] = [
            {
              id: '1',
              lawName: lawName || '',
              date: '2023-12-15',
              description: 'Alteração do artigo 15 para incluir novas diretrizes sobre responsabilidade civil.',
              changeType: 'modification',
              articleNumber: '15'
            },
            {
              id: '2',
              lawName: lawName || '',
              date: '2023-08-03',
              description: 'Adicionado novo artigo 23-A sobre procedimentos em casos de emergência.',
              changeType: 'addition',
              articleNumber: '23-A'
            },
            {
              id: '3',
              lawName: lawName || '',
              date: '2022-11-20',
              description: 'Revogação do artigo 8 que tratava de disposições transitórias.',
              changeType: 'removal',
              articleNumber: '8'
            },
            {
              id: '4',
              lawName: lawName || '',
              date: '2022-05-12',
              description: 'Alteração da redação do artigo 42 para clarificar as penalidades aplicáveis.',
              changeType: 'modification',
              articleNumber: '42'
            },
            {
              id: '5',
              lawName: lawName || '',
              date: '2021-09-28',
              description: 'Atualização geral da lei para adequação às normas internacionais.',
              changeType: 'modification'
            }
          ];
          
          setTimelineEntries(mockTimeline);
          
          // Extract unique years from the timeline
          const uniqueYears = [...new Set(mockTimeline.map(entry => 
            new Date(entry.date).getFullYear().toString()
          ))];
          
          setYears(uniqueYears.sort((a, b) => parseInt(b) - parseInt(a)));
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Erro ao buscar timeline:", error);
        setIsLoading(false);
      }
    };
    
    fetchTimeline();
  }, [lawName]);
  
  const filteredEntries = selectedYear === 'all' 
    ? timelineEntries 
    : timelineEntries.filter(entry => {
        const entryYear = new Date(entry.date).getFullYear().toString();
        return entryYear === selectedYear;
      });
  
  // Color based on change type
  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'addition':
        return 'bg-green-500/20 text-green-300';
      case 'modification':
        return 'bg-blue-500/20 text-blue-300';
      case 'removal':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };
  
  // Format change type label
  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'addition':
        return 'Adição';
      case 'modification':
        return 'Modificação';
      case 'removal':
        return 'Remoção';
      default:
        return 'Desconhecido';
    }
  };
  
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
            Histórico de Alterações
          </h1>
        </div>
        
        <div className="neomorph p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-heading text-primary-200">
              {lawName ? decodeURIComponent(lawName) : "Timeline Legislativo"}
            </h2>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-400 mr-2">Filtrar por ano:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="neomorph-sm bg-background text-primary-100 border-0 px-3 py-1 rounded"
              >
                <option value="all">Todos</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(index => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[100px]">Artigo</TableHead>
                  <TableHead className="w-[120px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length > 0 ? (
                  filteredEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {entry.articleNumber ? `Art. ${entry.articleNumber}` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getChangeTypeColor(entry.changeType)}`}>
                          {getChangeTypeLabel(entry.changeType)}
                        </span>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400">
                      Nenhuma alteração encontrada para o período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LegalTimeline;
