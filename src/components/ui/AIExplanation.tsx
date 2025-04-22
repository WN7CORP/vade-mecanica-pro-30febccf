
import { useState } from "react";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { BookOpen, MessagesSquare, ClipboardCheck, X, Volume2 } from "lucide-react";

interface AIExplanationProps {
  explanation: AIExplanationType | null;
  isLoading: boolean;
  articleNumber: string;
  lawName: string;
  onClose: () => void;
  onNarrateExplanation?: (content: string, title: string) => void;
  technicalExplanation?: string;
  formalExplanation?: string;
}

const AIExplanation = ({
  explanation,
  isLoading,
  articleNumber,
  lawName,
  onClose,
  onNarrateExplanation,
  technicalExplanation,
  formalExplanation,
}: AIExplanationProps) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'formal' | 'examples'>('technical');

  if (isLoading) {
    return (
      <div className="card-article animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-primary-300">
              <BookOpen size={18} />
            </span>
            <h3 className="text-primary-100 font-heading animate-pulse">
              Gerando explicação...
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 neomorph-sm text-gray-400"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  // Explicação técnica e formal customizadas, se vierem de props
  const technical = technicalExplanation || explanation.summary || "";
  const formal = formalExplanation || explanation.detailed || "";

  return (
    <div className="card-article">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary-300" />
          <h3 className="text-primary-100 font-heading">Explicação IA - Art. {articleNumber}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex border-b border-gray-800/30 mb-4">
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === "technical"
              ? "text-primary-300 border-b-2 border-primary-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("technical")}
        >
          <BookOpen size={16} className="mr-1" />
          Técnica
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === "formal"
              ? "text-primary-300 border-b-2 border-primary-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("formal")}
        >
          <MessagesSquare size={16} className="mr-1" />
          Formal
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === "examples"
              ? "text-primary-300 border-b-2 border-primary-300"
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("examples")}
        >
          <ClipboardCheck size={16} className="mr-1" />
          Exemplos
        </button>
      </div>

      {/* Conteúdo da aba selecionada */}
      <div className="py-2">
        {activeTab === "technical" && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-2">
              <h4 className="text-primary-200 font-medium">Explicação Técnica</h4>
              {onNarrateExplanation && (
                <button
                  onClick={() => onNarrateExplanation(technical, "Explicação técnica do artigo")}
                  className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-300"
                  aria-label="Narrar técnica"
                  title="Narrar técnica"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
            <p className="mb-3 text-white whitespace-pre-line">{technical}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Fonte: {lawName}, Art. {articleNumber}
            </p>
          </div>
        )}

        {activeTab === "formal" && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-2">
              <h4 className="text-primary-200 font-medium">Explicação Formal</h4>
              {onNarrateExplanation && (
                <button
                  onClick={() => onNarrateExplanation(formal, "Explicação formal do artigo")}
                  className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-300"
                  aria-label="Narrar formal"
                  title="Narrar formal"
                >
                  <Volume2 size={16} />
                </button>
              )}
            </div>
            <p className="mb-3 text-white whitespace-pre-line">{formal}</p>
          </div>
        )}

        {activeTab === "examples" && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-2">
              <h4 className="text-primary-200 font-medium">Exemplos Práticos</h4>
            </div>
            <ul className="space-y-4">
              {explanation.examples.map((example, index) => (
                <li key={index} className="neomorph-sm p-3">
                  <h4 className="text-primary-100 font-medium mb-1">
                    Exemplo {index + 1}
                  </h4>
                  <p className="text-white">{example}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplanation;
