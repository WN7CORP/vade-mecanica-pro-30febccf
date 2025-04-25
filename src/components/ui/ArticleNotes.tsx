import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { BookmarkPlus, Edit, Trash2, MessageSquareText, X, Italic, Bold, List } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "./drawer";
import { askAIQuestion } from "@/services/aiService";
import { Badge } from "./badge";
import { toast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { debounce } from "lodash";

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
  const [preview, setPreview] = useState(false);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  
  const storageKey = `article-notes-${articleNumber}-${lawName}`;

  const debouncedSave = useRef(
    debounce((content: string, topicsList: string[]) => {
      try {
        const dataToSave = {
          notes: content,
          topics: topicsList,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        
        if (userId) {
          logUserActivity('note', lawName, articleNumber);
        }
      } catch (error) {
        console.error("Erro ao salvar anotações:", error);
      }
    }, 800)
  ).current;

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

  useEffect(() => {
    if (isEditing && notes) {
      debouncedSave(notes, topics);
    }
  }, [notes, topics, isEditing, debouncedSave]);

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

    debouncedSave(notes, updatedTopics);
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
      const question = `Estou estudando este artigo para ${studyPurpose}. Pode me ajudar a fazer uma anotação concisa e útil sobre ele? Formate a resposta em markdown para facilitar a leitura.`;
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
    setIsEditing(true);
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

  const handleTextFormat = (format: 'bold' | 'italic' | 'list') => {
    if (!notesInputRef.current) return;
    
    const textarea = notesInputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let cursorAdjustment = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorAdjustment = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorAdjustment = 1;
        break;
      case 'list':
        formattedText = selectedText
          .split('\n')
          .map(line => line.trim() ? `- ${line}` : line)
          .join('\n');
        break;
    }
    
    const newText = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setNotes(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorAdjustment, 
        start + formattedText.length - cursorAdjustment
      );
    }, 0);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] overflow-y-auto animate-slide-in bg-gradient-to-b from-[#12141D] to-[#1A1F2C]">
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
            <Card className="mb-4 border-primary/20 animate-fade-in z-50 bg-[#1A1F2C]/80 shadow-lg" 
                  ref={aiHelpRef} 
                  style={{ position: 'relative', zIndex: 50 }}>
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
                    className="mt-2 bg-[#12141D]/80 border-[#403E43]"
                  />
                </div>
                
                {aiResponse && (
                  <div className="mt-4 p-3 bg-muted/40 rounded-md text-sm animate-fade-in">
                    <p className="mb-2 font-medium text-primary-300">Sugestão da IA:</p>
                    <div className="whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
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
                className="px-2 py-1 text-sm border rounded-md bg-[#12141D]/80 border-[#403E43] transition-all focus:ring-1 focus:ring-primary-300"
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
          
          {isEditing || !notes ? (
            <div className="mb-2">
              {isEditing && (
                <div className="flex items-center gap-2 mb-2 p-1 rounded-md bg-[#12141D]/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextFormat('bold')}
                    className="h-8 px-2 hover:bg-primary/10 text-gray-300"
                  >
                    <Bold size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextFormat('italic')}
                    className="h-8 px-2 hover:bg-primary/10 text-gray-300"
                  >
                    <Italic size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextFormat('list')}
                    className="h-8 px-2 hover:bg-primary/10 text-gray-300"
                  >
                    <List size={16} />
                  </Button>
                  <div className="flex-1"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreview(!preview)}
                    className={`h-8 px-2 ${preview ? 'bg-primary/20 text-primary' : 'text-gray-300'}`}
                  >
                    Prévia
                  </Button>
                </div>
              )}
              
              {preview ? (
                <div className="min-h-[200px] p-3 border rounded-md border-[#403E43] bg-[#12141D]/80 mb-4 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{notes}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  ref={notesInputRef}
                  placeholder="Suas anotações sobre este artigo..."
                  className="min-h-[200px] mb-4 transition-all focus:ring-1 focus:ring-primary-300 bg-[#12141D]/80 border-[#403E43]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              )}
            </div>
          ) : (
            <div className="min-h-[200px] p-3 border rounded-md border-[#403E43] bg-[#12141D]/80 mb-4 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          )}
          
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
