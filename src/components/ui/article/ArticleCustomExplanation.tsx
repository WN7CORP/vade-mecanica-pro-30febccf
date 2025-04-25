
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface ArticleCustomExplanationProps {
  title: string;
  explanation: string;
  onNarrate: () => void;
}

export const ArticleCustomExplanation = ({ title, explanation, onNarrate }: ArticleCustomExplanationProps) => {
  return (
    <div className="flex flex-col mt-4 animate-fade-in">
      <div className="px-4 py-3 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-300 text-left whitespace-pre-wrap w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-primary-200 font-medium">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNarrate}
            className="h-8 w-8 p-0 text-gray-400 hover:text-primary hover:bg-background/20"
          >
            <Volume2 size={16} />
          </Button>
        </div>
        {explanation}
      </div>
    </div>
  );
};
