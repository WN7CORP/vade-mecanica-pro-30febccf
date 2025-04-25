
import { useState, useEffect } from 'react';
import { Clock, Calendar, ArrowLeftRight, ChevronRight, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Version {
  id: string;
  lawName: string;
  date: string;
  description: string;
  content: string;
}

interface LegislativeHistoryProps {
  lawName: string;
  articleNumber?: string;
}

export function LegislativeHistory({ lawName, articleNumber }: LegislativeHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  
  useEffect(() => {
    // Simular carregamento das versões (substituir pela API real)
    setLoading(true);
    setTimeout(() => {
      // Dados de exemplo - substituir por dados reais da API
      const mockVersions: Version[] = [
        {
          id: 'v2023',
          lawName,
          date: '2023-08-15',
          description: 'Versão atual',
          content: articleNumber ? 'Conteúdo atual do artigo...' : 'Conteúdo atual da lei...'
        },
        {
          id: 'v2020',
          lawName,
          date: '2020-03-20',
          description: 'Reforma legal de março/2020',
          content: articleNumber ? 'Conteúdo anterior do artigo...' : 'Conteúdo anterior da lei...'
        },
        {
          id: 'v2015',
          lawName,
          date: '2015-11-05',
          description: 'Alteração legislativa de 2015',
          content: articleNumber ? 'Conteúdo de 2015 do artigo...' : 'Conteúdo de 2015 da lei...'
        },
        {
          id: 'v2010',
          lawName,
          date: '2010-01-10',
          description: 'Versão original',
          content: articleNumber ? 'Conteúdo original do artigo...' : 'Conteúdo original da lei...'
        }
      ];
      
      setVersions(mockVersions);
      setSelectedVersions([mockVersions[0].id, mockVersions[1].id]);
      setLoading(false);
    }, 1000);
  }, [lawName, articleNumber]);
  
  const handleSelectVersion = (index: number, versionId: string) => {
    const newSelectedVersions = [...selectedVersions];
    newSelectedVersions[index] = versionId;
    setSelectedVersions(newSelectedVersions);
  };
  
  const getVersionById = (versionId: string) => {
    return versions.find(v => v.id === versionId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'timeline' | 'compare')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Linha do Tempo</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Comparar Versões</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-6 mt-2">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {versions.map((version, i) => (
              <div key={version.id} className="flex mb-8 relative">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10
                  ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}>
                  <Calendar className="h-4 w-4" />
                </div>
                
                <div className="ml-6 flex-1">
                  <div className="flex items-center mb-1">
                    <time className="text-sm font-medium">
                      {new Date(version.date).toLocaleDateString('pt-BR')}
                    </time>
                    {i === 0 && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-base font-medium">{version.description}</h4>
                  
                  <div className="mt-2 p-4 bg-muted/30 rounded-md border">
                    <p className="text-sm whitespace-pre-wrap line-clamp-3">
                      {version.content}
                    </p>
                    
                    <button className="flex items-center text-xs text-primary mt-2 hover:underline">
                      <span>Ver completo</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="compare" className="mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                value={selectedVersions[0]}
                onValueChange={(value) => handleSelectVersion(0, value)}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      {new Date(version.date).toLocaleDateString('pt-BR')} - {version.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="p-4 bg-muted/30 rounded-md border min-h-[300px]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">
                    {getVersionById(selectedVersions[0])?.description}
                  </h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {getVersionById(selectedVersions[0])?.content}
                </p>
              </div>
            </div>
            
            <div>
              <Select
                value={selectedVersions[1]}
                onValueChange={(value) => handleSelectVersion(1, value)}
              >
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      {new Date(version.date).toLocaleDateString('pt-BR')} - {version.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="p-4 bg-muted/30 rounded-md border min-h-[300px]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-medium">
                    {getVersionById(selectedVersions[1])?.description}
                  </h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {getVersionById(selectedVersions[1])?.content}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
