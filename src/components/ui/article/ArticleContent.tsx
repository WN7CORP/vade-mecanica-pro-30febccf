
import { ZoomIn, ZoomOut, ChevronUp } from "lucide-react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onScrollToTop: () => void;
  articleNumber?: string;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onScrollToTop,
  articleNumber
}: ArticleContentProps) => {
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

  return (
    <div className="relative">
      {renderContent()}
      
      <div className="absolute left-0 bottom-0 flex flex-col space-y-2">
        <button 
          onClick={onIncreaseFontSize}
          className="p-2 neomorph-sm text-gray-300 hover:text-primary-300"
          aria-label="Aumentar fonte"
        >
          <ZoomIn size={18} />
        </button>
        
        <button 
          onClick={onDecreaseFontSize}
          className="p-2 neomorph-sm text-gray-300 hover:text-primary-300"
          aria-label="Diminuir fonte"
        >
          <ZoomOut size={18} />
        </button>
      </div>
      
      <button 
        onClick={onScrollToTop}
        className="absolute right-0 top-0 p-2 neomorph-sm text-gray-300 hover:text-primary-300"
        aria-label="Voltar ao topo"
      >
        <ChevronUp size={18} />
      </button>
    </div>
  );
};

export default ArticleContent;
