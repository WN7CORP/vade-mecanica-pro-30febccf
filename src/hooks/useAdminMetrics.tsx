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

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    
    try {
      // 1. Total de usuários
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // 2. Tempo médio de sessão
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('duration')
        .not('duration', 'is', null);
      
      if (sessionError) throw sessionError;
      
      let averageSessionTime = 0;
      if (sessionData && sessionData.length > 0) {
        const total = sessionData.reduce((sum, session) => sum + (session.duration || 0), 0);
        averageSessionTime = Math.round(total / sessionData.length / 60); // Convertendo para minutos
      }
      
      // 3. Total de comentários
      const { count: totalComments, error: commentsError } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true });
      
      if (commentsError) throw commentsError;
      
      // 4. Total de curtidas
      const { data: likesData, error: likesError } = await supabase
        .from('community_metrics')
        .select('metric_value')
        .eq('metric_name', 'curtidas_geral')
        .single();
      
      // Se não encontrar a métrica, assume zero
      const totalLikes = likesData?.metric_value || 0;
      
      // 5. Banimentos ativos
      const { count: activeBans, error: bansError } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact', head: true })
        .or('expires_at.gt.now,expires_at.is.null');
      
      if (bansError) throw bansError;
      
      // 6. Denúncias pendentes
      const { count: pendingReports, error: reportsError } = await supabase
        .from('comment_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (reportsError) throw reportsError;

      // 7. Dados para gráfico de distribuição de atividades
      // Fix: Usando agregação manual em vez do método group
      const { data: activityData, error: activityError } = await supabase
        .from('user_statistics')
        .select('action_type');
      
      if (activityError) throw activityError;
      
      // Processar dados manualmente para criar contagem por action_type
      const activityCounts: Record<string, number> = {};
      activityData?.forEach(item => {
        activityCounts[item.action_type] = (activityCounts[item.action_type] || 0) + 1;
      });
      
      const userActivity = Object.entries(activityCounts).map(([name, count]) => ({
        name,
        value: count
      }));

      // 8. Logins diários para o gráfico de linha
      const { data: loginData, error: loginError } = await supabase
        .from('user_sessions')
        .select('login_time')
        .order('login_time', { ascending: false })
        .limit(100);
      
      if (loginError) throw loginError;
      
      // Agrupar por dia
      const dailyLoginMap = new Map();
      
      loginData?.forEach(session => {
        const date = new Date(session.login_time).toISOString().split('T')[0];
        dailyLoginMap.set(date, (dailyLoginMap.get(date) || 0) + 1);
      });
      
      // Ultimos 7 dias
      const dailyLogins = Array.from(dailyLoginMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7);

      // Registrar log da visualização das métricas
      await supabase.rpc('log_admin_action', {
        action_type: 'view_dashboard',
        details: { timestamp: new Date().toISOString() }
      });

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
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas do dashboard",
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
    handleRefresh: () => {
      setRefreshing(true);
      fetchMetrics();
    }
  };
}
