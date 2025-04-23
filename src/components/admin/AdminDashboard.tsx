
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, MessageSquare, ThumbsUp, UserX, Flag, RefreshCw, AlertCircle } from "lucide-react";
import { MetricsCard } from "./dashboard/MetricsCard";
import { LoginChart } from "./dashboard/LoginChart";
import { ActivityDistributionChart } from "./dashboard/ActivityDistributionChart";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { toast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const { metrics, isLoading, refreshing, handleRefresh, error } = useAdminMetrics();

  // Function to handle retry when metrics loading fails
  const handleRetry = () => {
    toast({
      title: "Tentando novamente",
      description: "Recarregando as métricas do dashboard.",
    });
    handleRefresh();
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
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-md mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={18} />
            <h3 className="font-medium">Erro ao carregar métricas</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Usuários Cadastrados"
          value={metrics?.totalUsers || 0}
          icon={Users}
          isLoading={isLoading}
        />
        <MetricsCard
          title="Tempo Médio de Sessão"
          value={`${metrics?.averageSessionTime || 0} min`}
          icon={Clock}
          isLoading={isLoading}
        />
        <MetricsCard
          title="Total de Comentários"
          value={metrics?.totalComments || 0}
          icon={MessageSquare}
          isLoading={isLoading}
        />
        <MetricsCard
          title="Total de Curtidas"
          value={metrics?.totalLikes || 0}
          icon={ThumbsUp}
          isLoading={isLoading}
        />
        <MetricsCard
          title="Usuários Banidos"
          value={metrics?.activeBans || 0}
          icon={UserX}
          isLoading={isLoading}
          iconColor="text-destructive"
        />
        <MetricsCard
          title="Denúncias Pendentes"
          value={metrics?.pendingReports || 0}
          icon={Flag}
          isLoading={isLoading}
          iconColor="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Logins por Dia</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <LoginChart 
              data={metrics?.dailyLogins || []} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Atividades</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ActivityDistributionChart 
              data={metrics?.userActivity || []} 
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
