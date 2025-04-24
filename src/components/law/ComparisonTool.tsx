
import { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Copy, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/services/lawService";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonToolProps {
  articles: Article[];
  lawName: string | undefined;
  onClose: () => void;
}

const ComparisonTool = ({ articles, lawName, onClose }: ComparisonToolProps) => {
  const [expandedView, setExpandedView] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const { logUserActivity } = useUserActivity(userId);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [differences, setDifferences] = useState<string[]>([]);
  const [showDifferences, setShowDifferences] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, []);

  // Find differences between articles
  useEffect(() => {
    if (articles.length === 2) {
      const content1 = typeof articles[0].conteudo === 'string' 
        ? articles[0].conteudo 
        : JSON.stringify(articles[0].conteudo);
      
      const content2 = typeof articles[1].conteudo === 'string' 
        ? articles[1].conteudo 
        : JSON.stringify(articles[1].conteudo);
      
      // Simple difference detection (can be improved)
      const words1 = content1.split(/\s+/);
      const words2 = content2.split(/\s+/);
      
      const foundDifferences = [];
      
      if (words1.length !== words2.length) {
        foundDifferences.push(`Diferença no tamanho do texto: ${words1.length} vs ${words2.length} palavras.`);
      }
      
      // Find unique words in each text
      const uniqueWords1 = words1.filter(word => !words2.includes(word));
      const uniqueWords2 = words2.filter(word => !words1.includes(word));
      
      if (uniqueWords1.length > 0) {
        foundDifferences.push(`Palavras únicas no primeiro artigo: ${uniqueWords1.slice(0, 5).join(', ')}${uniqueWords1.length > 5 ? '...' : ''}`);
      }
      
      if (uniqueWords2.length > 0) {
        foundDifferences.push(`Palavras únicas no segundo artigo: ${uniqueWords2.slice(0, 5).join(', ')}${uniqueWords2.length > 5 ? '...' : ''}`);
      }
      
      setDifferences(foundDifferences);
    }
  }, [articles]);

  const handleCopy = () => {
    const comparisonText = articles.map(article => 
      `Art. ${article.numero}\n${typeof article.conteudo === 'string' ? article.conteudo : JSON.stringify(article.conteudo)}\n\n`
    ).join('\n---\n\n');
    
    navigator.clipboard.writeText(comparisonText)
      .then(() => {
        toast({
          description: "Comparação copiada para a área de transferência",
        });
        
        if (userId && lawName) {
          logUserActivity('copy_comparison', lawName, articles.map(a => a.numero).join(','));
        }
      })
      .catch(err => {
        console.error("Erro ao copiar:", err);
        toast({
          description: "Erro ao copiar conteúdo",
          variant: "destructive"
        });
      });
  };

  const formatContent = (content: string | { [key: string]: any }): string => {
    if (typeof content === 'string') {
      return content;
    } else {
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        return "Conteúdo não disponível";
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const highlightText = (text: string, index: number) => {
    if (activeHighlight === index) {
      // If this article is active for highlighting, style the text
      return (
        <div className="relative">
          <div className="absolute -left-2 top-0 h-full w-1 bg-primary-300 rounded-full"></div>
          <div className="text-primary-200">{text}</div>
        </div>
      );
    }
    return text;
  };

  const containerClasses = expandedView 
    ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 overflow-auto" 
    : "relative w-full";

  return (
    <AnimatePresence>
      <motion.div 
        className={containerClasses}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="neomorph p-4 mb-6"
          variants={itemVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-primary-200">
              Comparação de Artigos
            </h2>
            <div className="flex items-center gap-2">
              {differences.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDifferences(!showDifferences)}
                  className="text-primary-100"
                >
                  {showDifferences ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  <span className="ml-1 text-xs">Diferenças</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedView(!expandedView)}
                className="text-primary-100"
              >
                {expandedView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-primary-100"
              >
                <Copy size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {showDifferences && differences.length > 0 && (
              <motion.div 
                className="mb-4 p-3 bg-primary-900/20 border border-primary-800/30 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-sm font-medium text-primary-200 mb-2">Diferenças encontradas:</h3>
                <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                  {differences.map((diff, idx) => (
                    <li key={idx}>{diff}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article, index) => (
              <motion.div 
                key={article.id} 
                className={`neomorph-sm p-4 transition-all duration-300 ${activeHighlight === index ? 'ring-1 ring-primary-300' : ''}`}
                variants={itemVariants}
                onMouseEnter={() => setActiveHighlight(index)}
                onMouseLeave={() => setActiveHighlight(null)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary-100 font-medium">
                    Art. {article.numero}
                  </h3>
                  {articles.length === 2 && (
                    <div className="text-xs text-gray-400 flex items-center">
                      {index === 0 ? (
                        <ArrowRight size={12} className="ml-1 text-primary-200" />
                      ) : (
                        <ArrowLeft size={12} className="mr-1 text-primary-200" />
                      )}
                    </div>
                  )}
                </div>
                <div className="text-gray-300 whitespace-pre-wrap text-sm">
                  {highlightText(formatContent(article.conteudo), index)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonTool;
