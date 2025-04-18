
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { BookmarkPlus, Highlighter, MessageSquareText, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "./drawer";
import { askAIQuestion } from "@/services/aiService";
import { Badge } from "./badge";
import { toast } from "@/hooks/use-toast";

interface ArticleNotesProps {
  isOpen: boolean;
  onClose: () => void;
  articleNumber: string;
  articleContent: string;
  lawName: string | undefined;
}

const ArticleNotes = ({
  isOpen,
  onClose,
  articleNumber,
  articleContent,
  lawName = "Lei não especificada"
}: ArticleNotesProps) => {
  const [notes, setNotes] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [studyPurpose, setStudyPurpose] = useState<string>("");
  const [showAiHelp, setShowAiHelp] = useState<boolean>(false);
  
  const storageKey = `article-notes-${articleNumber}-${lawName}`;

  useEffect(() => {
    // Load saved notes from localStorage
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setNotes(parsedData.notes || "");
      setTopics(parsedData.topics || []);
    }
  }, [storageKey]);

  const saveNotes = () => {
    const dataToSave = {
      notes,
      topics,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    toast({
      description: "Suas anotações foram salvas",
    });
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    const updatedTopics = [...topics];
    updatedTopics.splice(index, 1);
    setTopics(updatedTopics);
  };

  const handleAskAI = async () => {
    if (!studyPurpose.trim()) {
      toast({
        description: "Por favor, informe para que você está estudando este artigo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const question = `Estou estudando este artigo para ${studyPurpose}. Pode me ajudar a fazer uma anotação concisa e útil sobre ele?`;
      const response = await askAIQuestion(question, articleNumber, articleContent, lawName);
      setAiResponse(response);
    } catch (error) {
      console.error("Erro ao consultar IA:", error);
      toast({
        description: "Ocorreu um erro ao consultar a IA. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const useAISuggestion = () => {
    setNotes(aiResponse);
    setShowAiHelp(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-between">
            <span className="text-primary-300">Anotações - Art. {articleNumber}</span>
            <DrawerClose className="flex h-9 w-9 items-center justify-center text-muted-foreground">
              <X size={18} />
            </DrawerClose>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-16">
          <div className="flex flex-wrap gap-2 mb-3">
            {topics.map((topic, index) => (
              <Badge key={index} className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                {topic}
                <button 
                  onClick={() => removeTopic(index)} 
                  className="ml-2 text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
            
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                placeholder="Novo tópico..."
                className="px-2 py-1 text-sm border rounded-md bg-background"
              />
              <Button variant="ghost" size="sm" onClick={addTopic}>+</Button>
            </div>
          </div>
          
          <Textarea
            placeholder="Suas anotações sobre este artigo..."
            className="min-h-[200px] mb-4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <div className="flex gap-2 mb-6">
            <Button 
              onClick={saveNotes} 
              className="text-primary-foreground bg-primary/90 hover:bg-primary flex items-center gap-2"
            >
              <BookmarkPlus size={16} />
              Salvar anotações
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowAiHelp(!showAiHelp)}
              className="flex items-center gap-2 text-primary"
            >
              <MessageSquareText size={16} />
              Ajuda da IA
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-primary"
            >
              <Highlighter size={16} />
              Destacar no texto
            </Button>
          </div>
          
          {showAiHelp && (
            <Card className="mb-4 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-primary-300">Assistente Jurídico IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <label className="text-sm text-muted-foreground">
                    Para que você está estudando este artigo?
                  </label>
                  <Textarea
                    placeholder="Ex: para uma prova da OAB, para entender meus direitos..."
                    value={studyPurpose}
                    onChange={(e) => setStudyPurpose(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                {aiResponse && (
                  <div className="mt-4 p-3 bg-muted/40 rounded-md text-sm">
                    <p className="mb-2 font-medium text-primary-300">Sugestão da IA:</p>
                    <p className="whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {aiResponse ? (
                  <Button 
                    size="sm" 
                    onClick={useAISuggestion}
                    className="bg-primary/80 hover:bg-primary"
                  >
                    Usar esta sugestão
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleAskAI} 
                    disabled={loading}
                    className="bg-primary/80 hover:bg-primary"
                  >
                    {loading ? "Consultando IA..." : "Obter sugestão"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ArticleNotes;
