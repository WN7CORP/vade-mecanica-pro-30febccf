
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MetricItem {
  label: string;
  value: number;
  key: string;
}

const CommunityMetricsTable = () => {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('community_metrics')
          .select('metric_name, metric_value');
        
        if (error) {
          console.error("Error fetching community metrics:", error);
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
      } catch (err) {
        console.error("Error processing metrics data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
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
      <h3 className="font-semibold text-primary-300 mb-3">Métricas da Comunidade</h3>
      {isLoading ? (
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
