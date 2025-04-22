
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ArticleContentProps {
  content: string;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  articleNumber?: string;
  example?: string;
  showExample?: boolean;
  onToggleExample?: () => void;
}

const ArticleContent = ({
  content,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  articleNumber,
  example,
  showExample = false,
  onToggleExample
}: ArticleContentProps) => {
  // Função para decidir estilo conforme o número
  let alignClass = "text-center";
  let textColor = "text-white";
  if (!articleNumber || articleNumber === "0" || articleNumber === "") {
    textColor = "";
  }
  if (articleNumber === "esquerda") {
    alignClass = "text-left";
    textColor = "";
  }

  const lineStyle = {
    fontSize: `${fontSize + 2}px`,
    color: (!articleNumber || articleNumber === "esquerda" || articleNumber === "0" || articleNumber === "")
      ? "#F4F4F5"
      : undefined
  };

  const renderContent = () => {
    return (
      <div className="w-full flex flex-col items-center" style={{ background: "transparent" }}>
        <div className="w-full">
          {
            content.split('\n').map((line, i) => (
              <p
                key={i}
                className={`mb-4 whitespace-pre-wrap font-bold transition-all duration-200 ${alignClass}`}
                style={lineStyle}
              >
                {line}
              </p>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="relative mt-8 mb-12 animate-fade-in">
      {renderContent()}

      {example && (
        <div className="mt-6 flex flex-col items-start">
          <button
            onClick={onToggleExample}
            className="mb-2 px-4 py-2 rounded bg-primary-950/50 text-primary-50 hover:bg-primary-900/70 font-medium transition"
            style={{ fontSize: `${fontSize - 1}px` }}
          >
            {showExample ? "Ocultar Exemplo" : "Exibir Exemplo"}
          </button>
          {showExample && (
            <div className="w-full p-4 bg-primary-50/10 border-l-4 border-primary-200 rounded animate-fade-in">
              <h4 className="text-primary-300 mb-2 font-medium">Exemplo:</h4>
              <p
                className="text-gray-400 whitespace-pre-wrap text-left"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: "normal"
                }}
              >
                {example}
              </p>
            </div>
          )}
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

