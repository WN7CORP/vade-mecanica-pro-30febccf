
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  BarChart3,
  UserX,
  Flag,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Componente de gráfico de barras
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

interface AdminMetrics {
  totalUsers: number;
  averageSessionTime: number;
  totalComments: number;
  totalLikes: number;
  activeBans: number;
  pendingReports: number;
  userActivity: { name: string; value: number }[];
  dailyLogins: { date: string; count: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const AdminDashboard = () => {
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visão Geral</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isLoading || refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Usuários */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-primary opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.totalUsers}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tempo Médio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio de Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-primary opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.averageSessionTime} min</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total de Comentários */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Comentários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <MessageSquare className="h-8 w-8 text-primary opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.totalComments}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total de Curtidas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Curtidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ThumbsUp className="h-8 w-8 text-primary opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.totalLikes}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Usuários Banidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Banidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <UserX className="h-8 w-8 text-destructive opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.activeBans}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Denúncias Pendentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Denúncias Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Flag className="h-8 w-8 text-warning opacity-80" />
              {isLoading ? (
                <Skeleton className="h-12 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.pendingReports}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gráfico de login por dia */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Logins por Dia</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={metrics?.dailyLogins}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Logins"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de distribuição de atividades */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Atividades</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.userActivity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {metrics?.userActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
