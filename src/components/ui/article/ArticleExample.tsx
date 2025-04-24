
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ArticleExampleProps {
  example: string;
  onClose: () => void;
  onNarrate: () => void;
}

export const ArticleExample = ({ example, onClose, onNarrate }: ArticleExampleProps) => {
  return (
    <div className="flex flex-col items-center mt-4 animate-fade-in">
      <div className="px-4 py-2 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-400 text-left whitespace-pre-wrap w-full max-w-xl">
        {example}
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onNarrate}
          className="bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          Narrar Exemplo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};
