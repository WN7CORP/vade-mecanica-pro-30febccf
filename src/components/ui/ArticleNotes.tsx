
import { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { BookmarkPlus, Edit, Trash2, MessageSquareText, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "./drawer";
import { askAIQuestion } from "@/services/aiService";
import { Badge } from "./badge";
import { toast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "./alert";

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
  const aiHelpRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const { logUserActivity } = useUserActivity(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const storageKey = `article-notes-${articleNumber}-${lawName}`;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    // Load saved notes from localStorage
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setNotes(parsedData.notes || "");
        setTopics(parsedData.topics || []);
      }
    } catch (error) {
      console.error("Erro ao carregar anotações:", error);
    }
  }, [storageKey]);

  // Scroll para o topo quando o AI help for exibido
  useEffect(() => {
    if (showAiHelp && aiHelpRef.current) {
      setTimeout(() => {
        aiHelpRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [showAiHelp]);

  const saveNotes = () => {
    try {
      const dataToSave = {
        notes,
        topics,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      
      if (userId) {
        logUserActivity('note', lawName, articleNumber);
      }
      
      toast({
        description: isEditing ? "Suas anotações foram atualizadas" : "Suas anotações foram salvas",
      });
      
      if (isEditing) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao salvar anotações:", error);
      toast({
        description: "Erro ao salvar anotações. Tente novamente.",
        variant: "destructive"
      });
    }
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
  
  const handleDeleteNotes = () => {
    if (confirmDelete) {
      try {
        localStorage.removeItem(storageKey);
        setNotes("");
        setTopics([]);
        setConfirmDelete(false);
        toast({
          description: "Suas anotações foram excluídas"
        });
      } catch (error) {
        console.error("Erro ao excluir anotações:", error);
        toast({
          description: "Erro ao excluir anotações. Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] overflow-y-auto animate-slide-in">
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-between">
            <span className="text-primary-300">Anotações - Art. {articleNumber}</span>
            <DrawerClose className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:scale-105 transition-all">
              <X size={18} />
            </DrawerClose>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-16">
          {confirmDelete && (
            <Alert className="mb-4 border-red-500/50 bg-red-500/10 animate-fade-in">
              <AlertTitle className="text-red-500">Confirmar exclusão</AlertTitle>
              <AlertDescription className="text-gray-300">
                Tem certeza que deseja excluir esta anotação? Esta ação não pode ser desfeita.
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteNotes}
                    className="animate-pulse"
                  >
                    Sim, excluir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {showAiHelp && (
            <Card className="mb-4 border-primary/20 animate-fade-in z-50" ref={aiHelpRef} style={{ position: 'relative', zIndex: 50 }}>
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
                  <div className="mt-4 p-3 bg-muted/40 rounded-md text-sm animate-fade-in">
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
                    className="bg-primary/80 hover:bg-primary transition-all hover:scale-105 active:scale-95"
                  >
                    Usar esta sugestão
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleAskAI} 
                    disabled={loading}
                    className="bg-primary/80 hover:bg-primary transition-all hover:scale-105 active:scale-95"
                  >
                    {loading ? "Consultando IA..." : "Obter sugestão"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 mb-3 animate-slide-in">
            {topics.map((topic, index) => (
              <Badge 
                key={index} 
                className="bg-primary/20 text-primary-foreground hover:bg-primary/30 transition-colors animate-fade-in"
              >
                {topic}
                <button 
                  onClick={() => removeTopic(index)} 
                  className="ml-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
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
                className="px-2 py-1 text-sm border rounded-md bg-background transition-all focus:ring-1 focus:ring-primary-300"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addTopic} 
                className="hover:bg-primary/10 hover:text-primary-300 transition-all hover:scale-110 active:scale-95"
              >
                +
              </Button>
            </div>
          </div>
          
          <Textarea
            placeholder="Suas anotações sobre este artigo..."
            className="min-h-[200px] mb-4 transition-all focus:ring-1 focus:ring-primary-300"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!isEditing && notes.length > 0}
          />
          
          <div className="flex flex-wrap gap-2 mb-6">
            {!isEditing && notes.length > 0 ? (
              <>
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="text-primary-foreground bg-primary/90 hover:bg-primary flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Edit size={16} />
                  Editar anotações
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDeleteNotes}
                  className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </>
            ) : (
              <Button 
                onClick={saveNotes} 
                className="text-primary-foreground bg-primary/90 hover:bg-primary flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <BookmarkPlus size={16} />
                {isEditing ? "Salvar alterações" : "Salvar anotações"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowAiHelp(!showAiHelp)}
              className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageSquareText size={16} />
              Ajuda da IA
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ArticleNotes;
