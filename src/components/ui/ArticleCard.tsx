
import { useState } from "react";
import { 
  Copy, 
  FileText, 
  Bookmark,
  BookOpen,
  Download,
  Volume2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  PenLine,
  ChevronUp,
  Pause,
  X,
  Check
} from "lucide-react";
import VoiceNarration from "./VoiceNarration";
import ArticleInteractions from "./ArticleInteractions";
import { toast } from "@/hooks/use-toast";

interface ArticleCardProps {
  articleNumber: string;
  content: string;
  lawName: string;
  onExplainRequest?: (type: 'technical' | 'formal') => void;
  onAskQuestion?: () => void;
}

const ArticleCard = ({
  articleNumber,
  content,
  lawName,
  onExplainRequest,
  onAskQuestion
}: ArticleCardProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [isReading, setIsReading] = useState(false);
  const [hasHighlights, setHasHighlights] = useState(false);
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  const highlightColors = [
    { name: "purple", class: "highlight-purple" },
    { name: "yellow", class: "highlight-yellow" },
    { name: "green", class: "highlight-green" },
    { name: "red", class: "highlight-red" }
  ];
  
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
    }
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 14) {
      setFontSize(fontSize - 2);
    }
  };
  
  const copyArticle = () => {
    const textToCopy = `Art. ${articleNumber}. ${content}`;
    navigator.clipboard.writeText(textToCopy);
    
    // Mostrar toast de sucesso
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };
  
  const startReading = () => {
    setIsReading(true);
  };
  
  const stopReading = () => {
    setIsReading(false);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  const toggleHighlightTools = () => {
    setShowHighlightTools(!showHighlightTools);
  };
  
  const handleColorSelect = (colorClass: string) => {
    setSelectedColor(colorClass);
    
    // Em uma implementação completa, aqui seria adicionada a lógica
    // para aplicar a cor selecionada ao texto selecionado pelo usuário
  };
  
  // Renderiza o conteúdo mantendo quebras de linha
  const renderContent = () => {
    return content.split('\n').map((line, i) => (
      <p 
        key={i} 
        className={`mb-2 whitespace-pre-wrap transition-all duration-200 ${
          !articleNumber && i === 0 ? "text-sm text-center text-gray-400" : ""
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {line}
      </p>
    ));
  };

  const handleExplain = (type: 'technical' | 'formal') => {
    if (onExplainRequest) {
      onExplainRequest(type);
    }
  };

  const handleComment = () => {
    if (onAskQuestion) {
      onAskQuestion();
    }
  };

  return (
    <div className="card-article mb-6">
      {/* Toast de cópia bem-sucedida */}
      {showCopyToast && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center animate-fade-in">
          <div className="bg-primary-300/90 text-gray-900 px-4 py-2 rounded-md flex items-center">
            <Check size={16} className="mr-2" />
            Texto copiado com sucesso!
          </div>
        </div>
      )}
      
      {/* Cabeçalho do card */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-primary-300 text-lg font-heading font-semibold">
            {articleNumber ? `Art. ${articleNumber}` : lawName}
          </h3>
          <p className="text-xs text-muted-foreground">{lawName}</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={copyArticle}
            className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
            aria-label="Copiar artigo"
          >
            <Copy size={16} />
          </button>
          
          <button 
            onClick={toggleHighlightTools}
            className={`p-1.5 neomorph-sm ${showHighlightTools ? "text-primary-300" : "text-gray-400 hover:text-primary-200"}`}
            aria-label="Marcador de texto"
          >
            <PenLine size={16} />
          </button>
          
          <button 
            onClick={() => onExplainRequest && onExplainRequest('technical')}
            className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-200"
            aria-label="Explicar artigo"
          >
            <BookOpen size={16} />
          </button>
        </div>
      </div>
      
      {/* Ferramentas de marcação */}
      {showHighlightTools && (
        <div className="mb-4 p-2 neomorph-sm flex justify-between items-center">
          <div className="flex space-x-2">
            {highlightColors.map((color) => (
              <button 
                key={color.name}
                onClick={() => handleColorSelect(color.class)}
                className={`w-6 h-6 rounded-full ${color.class} ${
                  selectedColor === color.class ? "ring-2 ring-white/50" : ""
                }`}
                aria-label={`Marcar com cor ${color.name}`}
              />
            ))}
          </div>
          <button 
            onClick={() => setShowHighlightTools(false)}
            className="text-gray-400"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Conteúdo do artigo */}
      <div className="relative">
        {renderContent()}
        
        {/* Botão flutuante de aumentar fonte */}
        <div className="absolute left-0 bottom-0 flex flex-col space-y-2">
          <button 
            onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
            className="p-2 neomorph-sm text-gray-300 hover:text-primary-300"
            aria-label="Aumentar fonte"
          >
            <ZoomIn size={18} />
          </button>
          
          <button 
            onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
            className="p-2 neomorph-sm text-gray-300 hover:text-primary-300"
            aria-label="Diminuir fonte"
          >
            <ZoomOut size={18} />
          </button>
        </div>
        
        {/* Botão flutuante de volta ao topo */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute right-0 top-0 p-2 neomorph-sm text-gray-300 hover:text-primary-300"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={18} />
        </button>
      </div>
      
      {/* Article interactions */}
      <ArticleInteractions 
        articleNumber={articleNumber}
        content={content}
        onExplain={handleExplain}
        onAddComment={handleComment}
        onStartNarration={startReading}
      />
      
      {/* Voice narration component */}
      <VoiceNarration
        text={content}
        isActive={isReading}
        onComplete={() => setIsReading(false)}
        onStop={() => setIsReading(false)}
      />
    </div>
  );
};

export default ArticleCard;
