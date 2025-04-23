
import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, ArrowLeft, Clipboard, Image, Loader2 } from "lucide-react";
import { askAIQuestion } from "@/services/aiService";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIChatProps {
  articleNumber: string;
  articleContent: string;
  lawName: string;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const AIChat = ({
  articleNumber,
  articleContent,
  lawName,
  onClose
}: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isMobile = useIsMobile();
  
  // Mostrar o contexto como primeira mensagem da IA
  useEffect(() => {
    const contextMessage: Message = {
      id: 'context',
      type: 'ai',
      content: `Estou pronto para ajudar com suas dúvidas sobre o **Artigo ${articleNumber}** da **${lawName}**. Você também pode enviar uma imagem para eu analisar.`,
      timestamp: new Date()
    };
    
    setMessages([contextMessage]);
  }, [articleNumber, lawName]);
  
  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Bloquear o rolamento do documento quando o chat está aberto em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isMobile]);
  
  const generateMessageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Set focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;
    
    // Create user message object
    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      imageUrl: imagePreviewUrl || undefined
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue("");
    clearSelectedImage();
    setIsLoading(true);
    
    try {
      // In a real implementation, we would handle the image upload here
      // and send it to the backend along with the text
      const imageDescription = imagePreviewUrl 
        ? "Além disso, você enviou uma imagem que estou analisando."
        : "";
      
      const aiResponse = await askAIQuestion(
        `${userMessage.content} ${imageDescription}`,
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
      
      // Foco no input após enviar a mensagem
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
  
  // Renderizar markdown para HTML
  const renderMarkdown = (text: string): React.ReactNode => {
    // Simple markdown renderer for bold, italic, links, and code
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    const codeRegex = /`(.*?)`/g;
    
    let formattedText = text
      .replace(boldRegex, '<strong>$1</strong>')
      .replace(italicRegex, '<em>$1</em>')
      .replace(codeRegex, '<code>$1</code>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Cabeçalho do chat */}
      <div className="p-4 border-b border-gray-800/20 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="p-2 neomorph-sm mr-3"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} className="text-primary-300" />
          </button>
          
          <div>
            <h1 className="text-lg font-heading font-semibold text-primary-100">
              Dúvidas sobre o Artigo {articleNumber}
            </h1>
            <div className="text-sm text-gray-400">{lawName}</div>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="p-2 neomorph-sm"
          aria-label="Fechar"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      
      {/* Mensagens */}
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
                {message.type === 'ai' ? (
                  <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center mr-2">
                    <Bot size={14} className="text-primary-300" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-2 ml-2">
                    <User size={14} className="text-gray-300" />
                  </div>
                )}
                
                <div className="flex-1 text-white">
                  {message.type === 'ai' ? (
                    renderMarkdown(message.content)
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                      {message.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={message.imageUrl} 
                            alt="Imagem enviada"
                            className="rounded-md max-h-40 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
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
      
      {/* Image preview if there's an image selected */}
      {imagePreviewUrl && (
        <div className="p-2 border-t border-gray-800/20 bg-muted/30">
          <div className="relative inline-block">
            <img 
              src={imagePreviewUrl} 
              alt="Imagem selecionada"
              className="h-16 object-contain rounded"
            />
            <button 
              onClick={clearSelectedImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background text-white flex items-center justify-center"
              aria-label="Remover imagem"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
      
      {/* Input para mensagem */}
      <div className="p-3 border-t border-gray-800/20">
        <div className="relative neomorph">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida..."
            className="w-full bg-transparent py-3 px-4 pr-24 outline-none resize-none max-h-32 scrollbar-thin text-white"
            rows={1}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            
            <label 
              htmlFor="image-upload"
              className="cursor-pointer p-2 mr-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-primary-300"
              aria-label="Enviar imagem"
            >
              <Image size={18} />
            </label>
            
            <button
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && !selectedImage) || isLoading}
              className={`p-2 rounded-full ${
                (inputValue.trim() || selectedImage) && !isLoading
                  ? 'bg-primary-300/20 text-primary-300'
                  : 'bg-gray-800/20 text-gray-600'
              } transition-colors`}
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
