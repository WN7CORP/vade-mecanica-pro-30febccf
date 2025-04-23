
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AdminMetrics {
  totalUsers: number;
  averageSessionTime: number;
  totalComments: number;
  totalLikes: number;
  activeBans: number;
  pendingReports: number;
  userActivity: { name: string; value: number }[];
  dailyLogins: { date: string; count: number }[];
}

const DEFAULT_METRICS: AdminMetrics = {
  totalUsers: 0,
  averageSessionTime: 0,
  totalComments: 0,
  totalLikes: 0,
  activeBans: 0,
  pendingReports: 0,
  userActivity: [],
  dailyLogins: []
};

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check admin status first to avoid unnecessary queries
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No active session");
        setIsLoading(false);
        return;
      }
      
      // 1. Total de usuários - usando contagem da tabela user_profiles
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("Erro ao buscar total de usuários:", usersError);
        // Continue anyway to get other metrics
      }
      
      // 2. Tempo médio de sessão
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('duration')
        .not('duration', 'is', null);
      
      if (sessionError) {
        console.error("Erro ao buscar tempo de sessão:", sessionError);
      }
      
      let averageSessionTime = 0;
      if (sessionData && sessionData.length > 0) {
        const total = sessionData.reduce((sum, session) => sum + (session.duration || 0), 0);
        averageSessionTime = Math.round(total / sessionData.length / 60); // Convertendo para minutos
      }
      
      // 3. Total de comentários
      const { count: totalComments, error: commentsError } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true });
      
      if (commentsError) {
        console.error("Erro ao buscar total de comentários:", commentsError);
      }
      
      // 4. Total de curtidas - buscando diretamente da tabela de métricas
      let totalLikes = 0;
      try {
        const { data: likesData, error: likesError } = await supabase
          .from('community_metrics')
          .select('metric_value')
          .eq('metric_name', 'curtidas_geral')
          .single();
        
        if (!likesError && likesData) {
          totalLikes = likesData.metric_value;
        } else {
          // Fallback: calcular diretamente
          const { data: postsLikes } = await supabase
            .from('community_posts')
            .select('likes');
            
          const { data: commentsLikes } = await supabase
            .from('community_comments')
            .select('likes');
            
          const postLikesSum = postsLikes?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;
          const commentLikesSum = commentsLikes?.reduce((sum, comment) => sum + (comment.likes || 0), 0) || 0;
          
          totalLikes = postLikesSum + commentLikesSum;
        }
      } catch (err) {
        console.error("Erro ao calcular total de curtidas:", err);
      }
      
      // 5. Banimentos ativos
      const { count: activeBans, error: bansError } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact', head: true })
        .or('expires_at.gt.now,expires_at.is.null');
      
      if (bansError) {
        console.error("Erro ao buscar banimentos ativos:", bansError);
      }
      
      // 6. Denúncias pendentes
      const { count: pendingReports, error: reportsError } = await supabase
        .from('comment_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (reportsError) {
        console.error("Erro ao buscar denúncias pendentes:", reportsError);
      }

      // 7. Dados para gráfico de distribuição de atividades
      let userActivity: { name: string; value: number }[] = [];
      try {
        const { data: activityData, error: activityError } = await supabase
          .from('user_statistics')
          .select('action_type');
        
        if (!activityError && activityData && activityData.length > 0) {
          // Processar dados manualmente para criar contagem por action_type
          const activityCounts: Record<string, number> = {};
          activityData.forEach(item => {
            activityCounts[item.action_type] = (activityCounts[item.action_type] || 0) + 1;
          });
          
          userActivity = Object.entries(activityCounts).map(([name, count]) => ({
            name,
            value: count
          }));
        }
      } catch (err) {
        console.error("Erro ao processar dados de atividade:", err);
        userActivity = [];
      }

      // 8. Logins diários para o gráfico de linha
      let dailyLogins: { date: string; count: number }[] = [];
      try {
        const { data: loginData, error: loginError } = await supabase
          .from('user_sessions')
          .select('login_time')
          .order('login_time', { ascending: false })
          .limit(100);
        
        if (!loginError && loginData && loginData.length > 0) {
          // Agrupar por dia
          const dailyLoginMap = new Map();
          
          loginData.forEach(session => {
            if (session.login_time) {
              const date = new Date(session.login_time).toISOString().split('T')[0];
              dailyLoginMap.set(date, (dailyLoginMap.get(date) || 0) + 1);
            }
          });
          
          // Últimos 7 dias
          dailyLogins = Array.from(dailyLoginMap.entries())
            .map(([date, count]) => ({ date, count: count as number }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);
        }
      } catch (err) {
        console.error("Erro ao processar dados de login:", err);
        dailyLogins = [];
      }

      // Registrar log da visualização das métricas
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'view_dashboard',
          details: { timestamp: new Date().toISOString() }
        });
      } catch (logError) {
        console.error("Erro ao registrar visualização:", logError);
        // Don't fail the entire operation if logging fails
      }

      setMetrics({
        totalUsers: totalUsers || 0,
        averageSessionTime,
        totalComments: totalComments || 0,
        totalLikes,
        activeBans: activeBans || 0,
        pendingReports: pendingReports || 0,
        userActivity,
        dailyLogins
      });
    } catch (error: any) {
      console.error("Erro ao carregar métricas:", error);
      setError(error?.message || "Erro ao carregar métricas");
      
      // Set default metrics to avoid UI breaking
      setMetrics(DEFAULT_METRICS);
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar todas as métricas do dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    isLoading,
    refreshing,
    error,
    handleRefresh: () => {
      setRefreshing(true);
      fetchMetrics();
    }
  };
}
