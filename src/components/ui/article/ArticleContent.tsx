
import { ZoomIn, ZoomOut, ChevronUp } from "lucide-react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
  onScrollToTop?: () => void;
  example?: string;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber,
  onScrollToTop,
  example
}: ArticleContentProps) => {
  const renderContent = () => {
    return content.split('\n').map((line, i) => {
      // Check if the line contains article number for alignment
      const hasArticleNumber = line.trim().startsWith('Art.') || line.trim().match(/^\d+\.?/);
      const isParagraph = line.trim().startsWith('§');
      const isHeader = !articleNumber && i === 0;
      
      // Determine text alignment and style
      const textAlignment = hasArticleNumber || isParagraph ? "text-left law-article-numbered" : "text-center law-article-unnumbered";
      const textStyle = isHeader ? "text-sm text-gray-400" : "";
      const fontWeight = !hasArticleNumber && !isParagraph && !isHeader ? "font-bold" : "";
      
      return (
        <p 
          key={i} 
          className={`law-article-paragraph whitespace-pre-wrap transition-all duration-200 ${
            textAlignment
          } ${textStyle} ${fontWeight}`}
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
          <p className="law-example whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
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
      
      {onScrollToTop && (
        <button
          onClick={onScrollToTop}
          className="fixed bottom-20 right-4 p-3 neomorph-sm text-primary-300 z-10 hover:scale-105 transition-all animate-fade-in"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
};

export default ArticleContent;
