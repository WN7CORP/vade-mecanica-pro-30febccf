
import { ArrowLeft, X } from "lucide-react";

interface AIChatHeaderProps {
  articleNumber: string;
  lawName: string;
  onClose: () => void;
}

const AIChatHeader = ({ articleNumber, lawName, onClose }: AIChatHeaderProps) => (
  <div className="p-4 border-b border-gray-800/20 flex items-center justify-between">
    <div className="flex items-center">
      <button 
        onClick={onClose}
        className="p-2 neomorph-sm mr-3"
        aria-label="Voltar"
      >
        <ArrowLeft size={18} className="text-primary-300" />
      </button>
      <div>
        <h1 className="text-lg font-heading font-semibold text-primary-100">
          Dúvidas sobre o Artigo {articleNumber}
        </h1>
        <div className="text-sm text-gray-400">{lawName}</div>
      </div>
    </div>
    <button 
      onClick={onClose}
      className="p-2 neomorph-sm"
      aria-label="Fechar"
    >
      <X size={18} className="text-gray-400" />
    </button>
  </div>
);

export default AIChatHeader;
