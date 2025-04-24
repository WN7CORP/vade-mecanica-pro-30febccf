
import { ZoomIn, ZoomOut } from "lucide-react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
  example?: string;
  centerContent?: boolean;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber,
  centerContent = false
}: ArticleContentProps) => {
  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      // A line should be treated as a header if:
      // 1. It's the first line and there's no article number (title)
      // 2. It starts with § or Art.
      const isHeader = !articleNumber && (i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.'));
      
      if (centerContent) {
        return (
          <p 
            key={i} 
            className="mb-4 whitespace-pre-wrap transition-all duration-300 text-center text-white animate-fade-in" 
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 'normal',
              opacity: '1',
              transform: 'translateY(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease'
            }}
          >
            {line}
          </p>
        );
      }
      
      return (
        <p 
          key={i} 
          className={`mb-4 whitespace-pre-wrap transition-all duration-300 text-left ${isHeader ? "text-sm text-gray-400" : "text-white"} animate-fade-in`} 
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 'normal',
            opacity: '1',
            transform: 'translateY(0)',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
          }}
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
          className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Aumentar fonte"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={onDecreaseFontSize}
          className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Diminuir fonte"
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default ArticleContent;
