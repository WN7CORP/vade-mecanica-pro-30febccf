
import { ZoomIn, ZoomOut } from "lucide-react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
  example?: string;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber,
  example
}: ArticleContentProps) => {
  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      // For articles with numbers, align text left; otherwise center and make bold
      const shouldCenter = !articleNumber && i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.');
      const shouldBold = !articleNumber && line.trim().length > 0;
      
      return (
        <p 
          key={i} 
          className={`mb-4 whitespace-pre-wrap transition-all duration-200 ${
            shouldCenter ? "text-center" : "text-left"
          } ${shouldBold ? "font-semibold" : ""} ${!articleNumber && i === 0 ? "text-sm text-gray-400" : "text-white"}`}
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
      
      {example && (
        <div className="mt-6 p-4 bg-primary-50/10 border-l-4 border-primary-200 rounded">
          <h4 className="text-primary-300 mb-2 font-medium">Exemplo:</h4>
          <p className="text-gray-400 whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
            {example}
          </p>
        </div>
      )}
      
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
