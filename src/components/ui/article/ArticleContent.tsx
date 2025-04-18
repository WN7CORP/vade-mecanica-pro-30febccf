
import { ZoomIn, ZoomOut } from "lucide-react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber
}: ArticleContentProps) => {
  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      // Check if the line contains any content for centereing
      const shouldCenter = !articleNumber && i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.');
      
      return (
        <p 
          key={i} 
          className={`mb-2 whitespace-pre-wrap transition-all duration-200 ${
            shouldCenter ? "text-center" : ""
          } ${!articleNumber && i === 0 ? "text-sm text-gray-400" : ""}`}
          style={{ fontSize: `${fontSize + 2}px` }}
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="relative mt-8 mb-12 animate-fade-in">
      {renderContent()}
      
      <div className="fixed left-4 bottom-24 flex flex-col space-y-2 z-10">
        <button 
          onClick={onIncreaseFontSize}
          className="p-2 neomorph-sm text-primary-300 hover:text-primary hover:scale-105 transition-all"
          aria-label="Aumentar fonte"
        >
          <ZoomIn size={18} />
        </button>
        
        <button 
          onClick={onDecreaseFontSize}
          className="p-2 neomorph-sm text-primary-300 hover:text-primary hover:scale-105 transition-all"
          aria-label="Diminuir fonte"
        >
          <ZoomOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default ArticleContent;
