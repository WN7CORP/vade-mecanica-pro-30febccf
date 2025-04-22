import { ZoomIn, ZoomOut } from "lucide-react";

interface ArticleContentProps {
  content?: string;       // título do conteúdo (coluna “Conteúdo”)
  article?: string;       // texto do artigo (coluna “Artigos”)
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string; // número do artigo (ex: “1º”)
  example?: string;
}

// Helper: renderiza texto multilinha com preservação de quebras
function renderMultilineText(text: string, fontSize: number) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p
          key={i}
          className="mb-4 whitespace-pre-wrap text-left text-white transition-all duration-200"
          style={{ fontSize: `${fontSize}px`, fontWeight: "normal" }}
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
      {/* 1) Conteúdo: antes do artigo, centralizado, em negrito, sem card */}
      {content && (
        <div className="mb-4 w-full text-center">
          <span
            className="block font-bold text-white"
            style={{ fontSize: `${fontSize + 4}px` }}
          >
            {content}
          </span>
        </div>
      )}

      {/* 2) Número do artigo (opcional), alinhado à esquerda */}
      {articleNumber && (
        <div className="mb-2 text-left">
          <span
            className="font-semibold text-white"
            style={{ fontSize: `${fontSize}px` }}
          >
            {`Art. ${articleNumber}`}
          </span>
        </div>
      )}

      {/* 3) Texto do artigo: multilinha, alinhado à esquerda, fontSize exato */}
      {article ? (
        renderMultilineText(article, fontSize)
      ) : (
        <p className="mb-4 text-gray-400">Conteúdo não disponível</p>
      )}

      {/* exemplo (mantive seu bloco de exemplo) */}
      {example && (
        <div className="mt-6 p-4 border-l-4 border-primary-200 rounded">
          <h4 className="text-primary-300 mb-2 font-medium">Exemplo:</h4>
          <p
            className="whitespace-pre-wrap"
            style={{ fontSize: `${fontSize}px`, color: "#ccc" }}
          >
            {example}
          </p>
        </div>
      )}

      {/* controles de zoom de fonte */}
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
