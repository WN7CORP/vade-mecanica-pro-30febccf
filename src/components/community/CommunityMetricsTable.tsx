
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricItem {
  label: string;
  value: number;
  key: string;
}

const CommunityMetricsTable = () => {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('community_metrics')
        .select('metric_name, metric_value');
      
      if (error) {
        console.error("Error fetching community metrics:", error);
        setError(error.message);
        return;
      }
      
      if (data) {
        const formattedMetrics = data.map(item => ({
          key: item.metric_name,
          label: formatMetricName(item.metric_name),
          value: item.metric_value
        }));
        
        // Sort by label
        formattedMetrics.sort((a, b) => a.label.localeCompare(b.label));
        setMetrics(formattedMetrics);
      }
    } catch (err: any) {
      console.error("Error processing metrics data:", err);
      setError(err?.message || "Erro ao carregar métricas");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMetrics();
  }, []);
  
  // Format metric names for display
  const formatMetricName = (name: string): string => {
    const formatMap: Record<string, string> = {
      'artigos_publicados': 'Artigos Publicados',
      'discussoes_abertas': 'Discussões Abertas',
      'comentarios_totais': 'Comentários Totais',
      'respostas_thread': 'Respostas em Thread',
      'usuarios_ativos': 'Usuários Ativos',
      'curtidas_geral': 'Curtidas Geral',
      'melhores_dicas': 'Melhores Dicas Destacadas',
      'badges_emitidos': 'Badges Emitidos',
      'posts_moderados': 'Posts Moderados'
    };
    
    return formatMap[name] || name.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Fallback metrics in case database query fails
  const FALLBACK_METRICS = [
    { key: 'artigos_publicados', label: 'Artigos Publicados', value: 0 },
    { key: 'discussoes_abertas', label: 'Discussões Abertas', value: 0 },
    { key: 'comentarios_totais', label: 'Comentários Totais', value: 0 },
    { key: 'curtidas_geral', label: 'Curtidas Geral', value: 0 },
    { key: 'usuarios_ativos', label: 'Usuários Ativos', value: 0 }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : FALLBACK_METRICS;

  return (
    <div className="bg-gray-900/40 rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-primary-300">Métricas da Comunidade</h3>
        {error && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchMetrics} 
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Recarregar
          </Button>
        )}
      </div>
      
      {error ? (
        <div className="text-red-400 text-xs mb-2">
          <p>Erro ao carregar métricas: {error}</p>
        </div>
      ) : isLoading ? (
        <div className="py-4 flex justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary-300 rounded-full border-t-transparent"></div>
        </div>
      ) : (
        <table className="min-w-full text-left text-xs text-gray-200">
          <tbody>
            {displayMetrics.map((m) => (
              <tr key={m.key} className="border-b border-gray-800 last:border-0">
                <td className="py-1 pr-8">{m.label}</td>
                <td className="py-1 font-bold text-primary-200">{m.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommunityMetricsTable;
