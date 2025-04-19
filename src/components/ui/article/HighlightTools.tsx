
import { X } from "lucide-react";

interface HighlightToolsProps {
  selectedColor: string | null;
  onColorSelect: (colorClass: string) => void;
  onClose: () => void;
}

const HighlightTools = ({
  selectedColor,
  onColorSelect,
  onClose
}: HighlightToolsProps) => {
  const highlightColors = [
    { name: "purple", class: "highlight-purple" },
    { name: "yellow", class: "highlight-yellow" },
    { name: "green", class: "highlight-green" },
    { name: "red", class: "highlight-red" }
  ];

  return (
    <div className="mb-4 p-3 neomorph-sm flex justify-between items-center bg-muted/80 backdrop-blur-sm">
      <div className="flex space-x-3">
        {highlightColors.map((color) => (
          <button 
            key={color.name}
            onClick={() => onColorSelect(color.class)}
            className={`w-7 h-7 rounded-full ${color.class} hover:scale-110 transition-transform ${
              selectedColor === color.class ? "ring-2 ring-white/50 scale-110" : ""
            }`}
            aria-label={`Marcar com cor ${color.name}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 mx-2">Selecione o texto para destacar</p>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-300"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default HighlightTools;
