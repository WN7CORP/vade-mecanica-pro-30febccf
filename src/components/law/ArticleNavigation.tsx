
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ArticleNavigationProps {
  currentArticleNumber: string;
  onPrevious: () => void;
  onNext: () => void;
  hasHistory?: boolean;
}

const ArticleNavigation = ({
  currentArticleNumber,
  onPrevious,
  onNext,
  hasHistory
}: ArticleNavigationProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-20 right-4 flex flex-col items-end space-y-2 z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="text-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-xs font-medium px-2">
          Art. {currentArticleNumber}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="text-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {hasHistory && (
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="bg-background/95 backdrop-blur"
          >
            <History className="h-4 w-4" />
          </Button>

          {showHistory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-full right-0 mb-2 w-48 bg-background/95 backdrop-blur border rounded-lg shadow-lg"
            >
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => navigate(-1)}
                >
                  Artigo Anterior
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleNavigation;
