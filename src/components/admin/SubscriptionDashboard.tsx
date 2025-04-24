
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, CreditCard, Users, TrendingUp } from "lucide-react";

interface SubscriptionMetrics {
  total_subscribers: number;
  monthly_recurring_revenue: number;
  active_plans: {
    plan_name: string;
    count: number;
  }[];
  monthly_growth: {
    month: string;
    new_subscribers: number;
    churned_subscribers: number;
  }[];
  revenue_by_month: {
    month: string;
    revenue: number;
  }[];
}

export default function SubscriptionDashboard() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  useEffect(() => {
    const fetchSubscriptionMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Get total subscribers
        const { data: subscribersData, error: subscribersError } = await supabase
          .from("user_subscriptions")
          .select("id, plan_id, created_at, subscription_plans(name)")
          .eq("status", "active");
          
        if (subscribersError) throw subscribersError;
        
        // Calculate MRR
        const { data: plansData, error: plansError } = await supabase
          .from("user_subscriptions")
          .select(`
            subscription_plans(
              name,
              price,
              interval
            )
          `)
          .eq("status", "active");
        
        if (plansError) throw plansError;
        
        // Calculate MRR (Monthly Recurring Revenue)
        let mrr = 0;
        plansData.forEach(sub => {
          if (sub.subscription_plans) {
            const price = Number(sub.subscription_plans.price);
            // Adjust for annual plans (divide by 12)
            if (sub.subscription_plans.interval === 'ano') {
              mrr += price / 12;
            } else {
              mrr += price;
            }
          }
        });
        
        // Group by plan
        const planCounts: Record<string, number> = {};
        subscribersData.forEach(sub => {
          const planName = sub.subscription_plans?.name || 'Unknown';
          planCounts[planName] = (planCounts[planName] || 0) + 1;
        });
        
        const activePlans = Object.entries(planCounts).map(([plan_name, count]) => ({
          plan_name,
          count
        }));
        
        // Get subscribers by month for last 6 months
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from("user_subscriptions")
          .select("created_at, end_date")
          .gte("created_at", sixMonthsAgo.toISOString());
          
        if (monthlyError) throw monthlyError;
        
        // Organize data by month
        const monthlyGrowthMap: Record<string, {new_subscribers: number, churned_subscribers: number}> = {};
        const revenueByMonthMap: Record<string, number> = {};
        
        // Initialize with last 6 months
        for (let i = 0; i < 6; i++) {
          const monthDate = new Date();
          monthDate.setMonth(today.getMonth() - i);
          const monthKey = monthDate.toISOString().substring(0, 7); // YYYY-MM format
          
          monthlyGrowthMap[monthKey] = {
            new_subscribers: 0,
            churned_subscribers: 0
          };
          
          revenueByMonthMap[monthKey] = 0;
        }
        
        // Fill in actual data
        monthlyData.forEach(sub => {
          const createdMonth = new Date(sub.created_at).toISOString().substring(0, 7);
          if (monthlyGrowthMap[createdMonth]) {
            monthlyGrowthMap[createdMonth].new_subscribers++;
          }
          
          if (sub.end_date) {
            const endMonth = new Date(sub.end_date).toISOString().substring(0, 7);
            if (monthlyGrowthMap[endMonth]) {
              monthlyGrowthMap[endMonth].churned_subscribers++;
            }
          }
        });
        
        // Convert maps to arrays for charts
        const monthlyGrowth = Object.entries(monthlyGrowthMap).map(([month, data]) => ({
          month: formatMonthLabel(month),
          new_subscribers: data.new_subscribers,
          churned_subscribers: data.churned_subscribers
        })).reverse();
        
        // Calculate approximate revenue by month (simplified)
        // In a real app, this would be more accurate using actual payment data
        const averagePlanPrice = mrr / subscribersData.length || 0;
        
        const revenueByMonth = monthlyGrowth.map(item => ({
          month: item.month,
          revenue: (item.new_subscribers * averagePlanPrice) 
        }));
        
        setMetrics({
          total_subscribers: subscribersData.length,
          monthly_recurring_revenue: mrr,
          active_plans,
          monthly_growth: monthlyGrowth,
          revenue_by_month: revenueByMonth
        });
        
      } catch (error) {
        console.error("Error fetching subscription metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionMetrics();
    
    // Refresh metrics every minute
    const intervalId = setInterval(fetchSubscriptionMetrics, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  function formatMonthLabel(dateStr: string) {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('pt-BR', { month: 'short' }) + '/' + date.getFullYear().toString().substring(2);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestão de Assinaturas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinantes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metrics?.total_subscribers || 0}
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.monthly_recurring_revenue || 0)}
              </div>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metrics?.monthly_growth?.[0]?.new_subscribers || 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">assinantes</span>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.monthly_recurring_revenue && metrics.total_subscribers ?
                  metrics.monthly_recurring_revenue / metrics.total_subscribers : 0)}
              </div>
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Assinantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics?.monthly_growth || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} assinantes`, '']} />
                  <Bar dataKey="new_subscribers" name="Novos Assinantes" fill="#4ade80" />
                  <Bar dataKey="churned_subscribers" name="Cancelamentos" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              {metrics?.active_plans && metrics.active_plans.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.active_plans}
                      dataKey="count"
                      nameKey="plan_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {metrics.active_plans.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} assinantes`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Sem dados suficientes</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics?.revenue_by_month || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Receita']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Receita" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
