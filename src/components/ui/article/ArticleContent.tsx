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
      const shouldShowAsHeader = !articleNumber && (i === 0 || line.trim().startsWith('§') || line.trim().startsWith('Art.'));
      if (centerContent) {
        return <p key={i} className="mb-4 whitespace-pre-wrap transition-all duration-200 text-center text-white" style={{
          fontSize: `${fontSize}px`,
          fontWeight: 'normal'
        }}>
            {line}
          </p>;
      }
      return <p key={i} className={`mb-4 whitespace-pre-wrap transition-all duration-200 text-left ${shouldShowAsHeader ? "text-sm text-gray-400" : "text-white"}`} style={{
        fontSize: `${fontSize}px`,
        fontWeight: 'normal'
      }}>
          {line}
        </p>;
    });
  };
  return <div className="relative mt-8 mb-12 animate-fade-in">
      {renderContent()}
      
      <div className="fixed left-4 bottom-24 flex flex-col space-y-2 z-10">
        
        
      </div>
    </div>;
};
export default ArticleContent;