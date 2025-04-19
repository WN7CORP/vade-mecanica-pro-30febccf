
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
    <div className="mb-4 p-2 neomorph-sm flex justify-between items-center">
      <div className="flex space-x-2">
        {highlightColors.map((color) => (
          <button 
            key={color.name}
            onClick={() => onColorSelect(color.class)}
            className={`w-6 h-6 rounded-full ${color.class} ${
              selectedColor === color.class ? "ring-2 ring-white/50" : ""
            }`}
            aria-label={`Marcar com cor ${color.name}`}
          />
        ))}
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default HighlightTools;
