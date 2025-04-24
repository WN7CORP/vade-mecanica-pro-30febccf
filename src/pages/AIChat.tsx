import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Send, User, Bot, ArrowLeft, Clipboard } from "lucide-react";
import { askAIQuestion } from "@/services/aiService";
import { RequireSubscription } from "@/components/guards/RequireSubscription";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [searchParams] = useSearchParams();
  const lawName = searchParams.get("law") || "";
  const articleNumber = searchParams.get("article") || "";
  const articleContent = searchParams.get("content") || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (lawName && articleNumber && articleContent) {
      const contextMessage: Message = {
        id: 'context',
        type: 'ai',
        content: `Estou pronto para ajudar com suas dúvidas sobre o **Artigo ${articleNumber}** da **${lawName}**.`,
        timestamp: new Date()
      };
      
      setMessages([contextMessage]);
    }
  }, [lawName, articleNumber, articleContent]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const generateMessageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const aiResponse = await askAIQuestion(
        userMessage.content,
        articleNumber,
        articleContent,
        lawName
      );
      
      const aiMessage: Message = {
        id: generateMessageId(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Erro ao processar pergunta:", error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        type: 'ai',
        content: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Adicionar feedback de cópia aqui (toast)
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <RequireSubscription>
      <div className="flex flex-col min-h-screen pb-16 pt-20">
        <Header />
        
        <main className="flex-1 flex flex-col max-w-screen-md mx-auto w-full">
          <div className="p-4 border-b border-gray-800/20">
            <div className="flex items-center">
              <Bot size={18} className="text-primary-300 mr-2" />
              <h1 className="text-lg font-heading font-semibold text-primary-100">
                Assistente Jurídico
              </h1>
            </div>
            
            {lawName && articleNumber && (
              <div className="mt-1 text-sm text-gray-400">
                Contexto: {lawName}, Artigo {articleNumber}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] relative group ${
                    message.type === 'user'
                      ? 'bg-accent/20 rounded-2xl rounded-tr-sm ml-12'
                      : 'neomorph-sm mr-12'
                  } p-3 pb-5`}
                >
                  <div className="flex items-start mb-1">
                    {message.type === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center mr-2">
                        <Bot size={14} className="text-primary-300" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-gray-300">
                        {message.content}
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-1 right-2 text-gray-500 text-xs">
                    {formatTimestamp(message.timestamp)}
                  </div>
                  
                  {message.type === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-300"
                      aria-label="Copiar mensagem"
                    >
                      <Clipboard size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="neomorph-sm p-4 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-800/20">
            <div className="relative neomorph">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida..."
                className="w-full bg-transparent py-3 px-4 pr-12 outline-none resize-none max-h-32 scrollbar-thin text-gray-300"
                rows={1}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-full ${
                  inputValue.trim() && !isLoading
                    ? 'bg-primary-300/20 text-primary-300'
                    : 'bg-gray-800/20 text-gray-600'
                } transition-colors`}
                aria-label="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </RequireSubscription>
  );
};

export default AIChat;
