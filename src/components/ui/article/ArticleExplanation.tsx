
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, BookOpen, MessageSquareMore, BarChart2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ArticleExplanationProps {
  isOpen: boolean;
  onClose: () => void;
  onExplain: (type: 'technical' | 'formal') => void;
  articleNumber: string;
  content: string | { [key: string]: any };
}

export const ArticleExplanation = ({ 
  isOpen, 
  onClose, 
  onExplain,
  articleNumber,
  content 
}: ArticleExplanationProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-card border rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Tipo de Explicação</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10"
                  onClick={() => onExplain('technical')}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Técnica</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10"
                  onClick={() => onExplain('formal')}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Formal</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10"
                  onClick={() => {
                    const contentParam = encodeURIComponent(
                      typeof content === 'string' ? content : JSON.stringify(content)
                    );
                    navigate(`/duvidas?article=${articleNumber}&content=${contentParam}`);
                  }}
                >
                  <MessageSquareMore className="h-4 w-4" />
                  <span>Personalizada</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
