
import { useState } from "react";
import { X, Maximize2, Minimize2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/services/lawService";

interface ComparisonToolProps {
  articles: Article[];
  lawName: string | undefined;
  onClose: () => void;
}

const ComparisonTool = ({ articles, lawName, onClose }: ComparisonToolProps) => {
  const [expandedView, setExpandedView] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const { logUserActivity } = useUserActivity(userId);

  // Check authentication
  useState(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  });

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

  const containerClasses = expandedView 
    ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" 
    : "relative w-full animate-fade-in";

  return (
    <div className={containerClasses}>
      <div className="neomorph p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-heading font-semibold text-primary-200">
            Comparação de Artigos
          </h2>
          <div className="flex items-center gap-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map(article => (
            <div key={article.id} className="neomorph-sm p-4">
              <h3 className="text-primary-100 font-medium mb-2">
                Art. {article.numero}
              </h3>
              <div className="text-gray-300 whitespace-pre-wrap text-sm">
                {formatContent(article.conteudo)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;
