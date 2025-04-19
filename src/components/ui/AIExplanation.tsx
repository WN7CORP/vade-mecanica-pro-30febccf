
import { useState } from "react";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { LightbulbIcon, BookOpen, MessagesSquare, ClipboardCheck, X } from "lucide-react";

interface AIExplanationProps {
  explanation: AIExplanationType | null;
  isLoading: boolean;
  articleNumber: string;
  lawName: string;
  onClose: () => void;
}

const AIExplanation = ({
  explanation,
  isLoading,
  articleNumber,
  lawName,
  onClose
}: AIExplanationProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'examples'>('summary');
  
  if (isLoading) {
    return (
      <div className="card-article animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <LightbulbIcon size={18} className="text-primary-300" />
            <h3 className="text-primary-100 font-heading">
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
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (!explanation) {
    return null;
  }
  
  return (
    <div className="card-article">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <LightbulbIcon size={18} className="text-primary-300" />
          <h3 className="text-primary-100 font-heading">
            Explicação IA - Art. {articleNumber}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Abas de navegação */}
      <div className="flex border-b border-gray-800/30 mb-4">
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === 'summary' 
              ? 'text-primary-300 border-b-2 border-primary-300' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          <BookOpen size={16} className="mr-1" />
          Resumo
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === 'detailed' 
              ? 'text-primary-300 border-b-2 border-primary-300' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('detailed')}
        >
          <MessagesSquare size={16} className="mr-1" />
          Detalhado
        </button>
        <button
          className={`px-3 py-2 text-sm font-medium flex items-center ${
            activeTab === 'examples' 
              ? 'text-primary-300 border-b-2 border-primary-300' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('examples')}
        >
          <ClipboardCheck size={16} className="mr-1" />
          Exemplos
        </button>
      </div>
      
      {/* Conteúdo da aba selecionada */}
      <div className="py-2">
        {activeTab === 'summary' && (
          <div className="animate-fade-in">
            <p className="mb-3 text-gray-300">{explanation.summary}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Fonte: {lawName}, Art. {articleNumber}
            </p>
          </div>
        )}
        
        {activeTab === 'detailed' && (
          <div className="animate-fade-in">
            <p className="mb-3 text-gray-300 whitespace-pre-line">{explanation.detailed}</p>
          </div>
        )}
        
        {activeTab === 'examples' && (
          <div className="animate-fade-in">
            <ul className="space-y-4">
              {explanation.examples.map((example, index) => (
                <li key={index} className="neomorph-sm p-3">
                  <h4 className="text-primary-100 font-medium mb-1">
                    Exemplo {index + 1}
                  </h4>
                  <p className="text-gray-300">{example}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Botão para exportar PDF */}
      <div className="mt-4 flex justify-end">
        <button className="shadow-button text-gray-300 hover:text-primary-200">
          Exportar explicação (PDF)
        </button>
      </div>
    </div>
  );
};

export default AIExplanation;
