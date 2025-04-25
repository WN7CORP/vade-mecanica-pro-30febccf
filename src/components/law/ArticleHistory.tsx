
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface HistoryItem {
  law_name: string;
  article_number: string;
  created_at: string;
}

const ArticleHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('user_statistics')
        .select('law_name, article_number, created_at')
        .eq('action_type', 'view')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setHistory(data);
      }
    };

    fetchHistory();
  }, []);

  const navigateToArticle = (lawName: string, articleNumber: string) => {
    navigate(`/lei/${encodeURIComponent(lawName)}?artigo=${articleNumber}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary mb-4">
        <Clock size={20} />
        <h2 className="text-lg font-medium">Histórico de Artigos</h2>
      </div>

      <ScrollArea className="h-[70vh]">
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => navigateToArticle(item.law_name, item.article_number)}
                className="w-full p-3 text-left rounded-lg bg-card hover:bg-primary/10 transition-colors"
              >
                <div className="font-medium">Art. {item.article_number}</div>
                <div className="text-sm text-muted-foreground">{item.law_name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Nenhum artigo visualizado recentemente
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ArticleHistory;
