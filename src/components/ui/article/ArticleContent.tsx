
interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
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
      const isHeader = !articleNumber && (i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.'));
      
      if (centerContent) {
        return (
          <p 
            key={i} 
            className="mb-3 whitespace-pre-wrap transition-all duration-300 text-center text-white animate-fade-in" 
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
          className={`mb-3 whitespace-pre-wrap transition-all duration-300 text-left ${isHeader ? "text-sm text-gray-400" : "text-white"} animate-fade-in`} 
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
    <div className="relative mt-6 mb-6 animate-fade-in">
      {renderContent()}
    </div>
  );
};

export default ArticleContent;
