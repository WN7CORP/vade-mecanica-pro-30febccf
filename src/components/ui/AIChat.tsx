import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, ArrowLeft, Clipboard, Image, Loader2 } from "lucide-react";
import { askAIQuestion } from "@/services/aiService";
import { useIsMobile } from "@/hooks/use-mobile";
import AIChatHeader from "./AIChatHeader";
import AIChatMessages from "./AIChatMessages";
import AIChatInput from "./AIChatInput";

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
  
  useEffect(() => {
    const contextMessage: Message = {
      id: 'context',
      type: 'ai',
      content: `Estou pronto para ajudar com suas dúvidas sobre o **Artigo ${articleNumber}** da **${lawName}**. Você também pode enviar uma imagem para eu analisar.`,
      timestamp: new Date()
    };
    
    setMessages([contextMessage]);
  }, [articleNumber, lawName]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
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
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
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
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderMarkdown = (text: string): React.ReactNode => {
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
      <AIChatHeader 
        articleNumber={articleNumber}
        lawName={lawName}
        onClose={onClose}
      />
      <AIChatMessages
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        copyToClipboard={copyToClipboard}
        formatTimestamp={formatTimestamp}
        renderMarkdown={renderMarkdown}
      />
      <AIChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleKeyDown={handleKeyDown}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedImage={selectedImage}
        imagePreviewUrl={imagePreviewUrl}
        handleImageUpload={handleImageUpload}
        clearSelectedImage={clearSelectedImage}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};

export default AIChat;
