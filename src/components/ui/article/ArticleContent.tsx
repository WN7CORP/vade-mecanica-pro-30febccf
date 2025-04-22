import { ZoomIn, ZoomOut } from "lucide-react";

interface ArticleContentProps {
  content?: string;  // "conteúdo"
  article?: string;  // "artigo"
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
  example?: string;
}

// Helper: render multi-line text with preserved spacing
function renderMultilineText(text: string, fontSize: number) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p
          key={i}
          className={`mb-4 whitespace-pre-wrap text-left text-white transition-all duration-200`}
          style={{ fontSize: `${fontSize + 2}px`, fontWeight: "normal" }}
        >
          {line}
        </p>
      ))}
    </>
  );
}

const ArticleContent = ({
  content,
  article,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber,
  example
}: ArticleContentProps) => {
  return (
    <div className="relative mt-8 mb-12 animate-fade-in">
      {/* Conteúdo section: centered, bold, before Artigo, no extra background */}
      {content && (
        <div className="mb-2 w-full text-center">
          <span
            className="block font-bold text-white"
            style={{ fontSize: `${fontSize + 4}px` }}
          >
            {content}
          </span>
        </div>
      )}

      {/* Artigo: left-aligned, normal font, keep line breaks */}
      {article
        ? renderMultilineText(article, fontSize)
        : (
          <p className="mb-4 text-gray-400">Conteúdo não disponível</p>
        )
      }

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
