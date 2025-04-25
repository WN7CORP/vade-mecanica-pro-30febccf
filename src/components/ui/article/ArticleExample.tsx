
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Volume2, X } from "lucide-react";

interface ArticleExampleProps {
  example: string;
  onClose: () => void;
  onNarrate: () => void;
}

export const ArticleExample = ({ example, onClose, onNarrate }: ArticleExampleProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center mt-4"
      initial={{ opacity: 0, height: 0, y: -20 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div 
        className="px-4 py-2 bg-primary-50/10 border-l-4 border-primary-200 rounded text-gray-400 text-left whitespace-pre-wrap w-full max-w-xl"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {example}
      </motion.div>
      <motion.div 
        className="flex gap-2 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onNarrate}
          className="bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
        >
          <Volume2 size={16} className="mr-2 group-hover:animate-pulse" />
          Narrar Exemplo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <X size={16} className="mr-2" />
          Fechar
        </Button>
      </motion.div>
    </motion.div>
  );
};
