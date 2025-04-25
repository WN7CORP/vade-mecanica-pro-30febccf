
import { formatTextWithMarkdown } from '@/utils/textExpansion';

interface ArticleContentProps {
  content: string | { [key: string]: any };
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
  // Extract text content from either string or object
  const getTextContent = (data: string | { [key: string]: any }): string => {
    if (typeof data === 'string') return data;
    
    // Try to extract content from common field names
    if (data.artigo) return data.artigo;
    if (data.conteudo) return data.conteudo;
    if (data.content) return data.content;
    
    // Fallback to JSON string
    return JSON.stringify(data);
  };
  
  // Get the content text
  const contentText = getTextContent(content);
  
  const renderContent = () => {
    return contentText.split('\n').map((line, i) => {
      const isHeader = !articleNumber && (i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.'));
      
      // Format the text with markdown for bold sections
      const formattedLine = formatTextWithMarkdown(line);
      
      // Convert markdown to HTML with color style
      const htmlContent = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #C7A6FF">$1</strong>');
      
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
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
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
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
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
