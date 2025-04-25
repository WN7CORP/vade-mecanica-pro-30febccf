
import { useState } from "react";
import { AIExplanation as AIExplanationType } from "@/services/aiService";
import { LightbulbIcon, BookOpen, MessagesSquare, ClipboardCheck, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIExplanationProps {
  explanation: AIExplanationType | null;
  isLoading: boolean;
  articleNumber: string;
  lawName: string;
  onClose: () => void;
  onNarrateExplanation?: (content: string, title: string) => void;
}

const AIExplanation = ({
  explanation,
  isLoading,
  articleNumber,
  lawName,
  onClose,
  onNarrateExplanation
}: AIExplanationProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'examples'>('summary');
  const isMobile = useIsMobile();
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren" 
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3,
        when: "afterChildren" 
      }
    }
  };
  
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        duration: 0.5 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.3 }
    }
  };
  
  if (isLoading) {
    return (
      <motion.div 
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9998]"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        <motion.div 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-auto p-4 z-[9999]"
          variants={containerVariants}
        >
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
                className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300 hover:scale-110 transition-all duration-200"
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
        </motion.div>
      </motion.div>
    );
  }
  
  if (!explanation) {
    return null;
  }
  
  const handleNarrate = (content: string, title: string) => {
    if (onNarrateExplanation) {
      onNarrateExplanation(content, title);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9998]"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        <motion.div 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-auto p-4 z-[9999]"
          variants={containerVariants}
        >
          <div className="card-article">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <motion.div 
                  initial={{ rotate: 0 }} 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <LightbulbIcon size={18} className="text-primary-300" />
                </motion.div>
                <h3 className="text-primary-100 font-heading">
                  Explicação IA - Art. {articleNumber}
                </h3>
              </div>
              <motion.button 
                onClick={onClose}
                className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300"
                aria-label="Fechar"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>
            
            <div className="flex border-b border-gray-800/30 mb-4">
              <motion.button
                className={`px-3 py-2 text-sm font-medium flex items-center ${
                  activeTab === 'summary' 
                    ? 'text-primary-300 border-b-2 border-primary-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('summary')}
                whileHover={activeTab !== 'summary' ? { y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen size={16} className="mr-1" />
                <span>Resumo</span>
              </motion.button>
              <motion.button
                className={`px-3 py-2 text-sm font-medium flex items-center ${
                  activeTab === 'detailed' 
                    ? 'text-primary-300 border-b-2 border-primary-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('detailed')}
                whileHover={activeTab !== 'detailed' ? { y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <MessagesSquare size={16} className="mr-1" />
                <span>Detalhado</span>
              </motion.button>
              <motion.button
                className={`px-3 py-2 text-sm font-medium flex items-center ${
                  activeTab === 'examples' 
                    ? 'text-primary-300 border-b-2 border-primary-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('examples')}
                whileHover={activeTab !== 'examples' ? { y: -2 } : {}}
                whileTap={{ scale: 0.95 }}
              >
                <ClipboardCheck size={16} className="mr-1" />
                <span>Exemplos</span>
              </motion.button>
            </div>
            
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'summary' && (
                  <motion.div 
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="animate-fade-in"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-primary-200 font-medium">Resumo</h4>
                      {onNarrateExplanation && (
                        <motion.button 
                          onClick={() => handleNarrate(explanation.summary, "Resumo do artigo")}
                          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-300"
                          aria-label="Narrar resumo"
                          title="Narrar resumo"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Volume2 size={16} />
                        </motion.button>
                      )}
                    </div>
                    <p className="mb-3 text-white">{explanation.summary}</p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Fonte: {lawName}, Art. {articleNumber}
                    </p>
                  </motion.div>
                )}
                
                {activeTab === 'detailed' && (
                  <motion.div 
                    key="detailed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="animate-fade-in"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-primary-200 font-medium">Explicação Detalhada</h4>
                      {onNarrateExplanation && (
                        <motion.button 
                          onClick={() => handleNarrate(explanation.detailed, "Explicação detalhada do artigo")}
                          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-300"
                          aria-label="Narrar explicação detalhada"
                          title="Narrar explicação detalhada"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Volume2 size={16} />
                        </motion.button>
                      )}
                    </div>
                    <p className="mb-3 text-white whitespace-pre-line">{explanation.detailed}</p>
                  </motion.div>
                )}
                
                {activeTab === 'examples' && (
                  <motion.div 
                    key="examples"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="animate-fade-in"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="text-primary-200 font-medium">Exemplos Práticos</h4>
                      {onNarrateExplanation && (
                        <motion.button 
                          onClick={() => handleNarrate(explanation.examples.join(". Próximo exemplo. "), "Exemplos práticos")}
                          className="p-1.5 neomorph-sm text-gray-400 hover:text-primary-300"
                          aria-label="Narrar exemplos"
                          title="Narrar exemplos"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Volume2 size={16} />
                        </motion.button>
                      )}
                    </div>
                    <ul className="space-y-4">
                      {explanation.examples.map((example, index) => (
                        <motion.li 
                          key={index} 
                          className="neomorph-sm p-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="text-primary-100 font-medium mb-1">
                            Exemplo {index + 1}
                          </h4>
                          <p className="text-white">{example}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIExplanation;
