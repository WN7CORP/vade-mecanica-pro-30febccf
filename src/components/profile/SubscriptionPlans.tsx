
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/subscription/PricingCard";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_popular?: boolean;
}

interface SubscriptionStatus {
  active: boolean;
  subscription_tier?: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSubscription = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Erro ao verificar assinatura");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from("subscription_plans")
          .select("*");

        if (plansError) throw plansError;

        // Parse features for each plan
        const formattedPlans = plansData?.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || "",
          price: Number(plan.price),
          interval: plan.interval,
          features: Array.isArray(plan.features) ? plan.features : 
                   typeof plan.features === 'string' ? JSON.parse(plan.features) : [],
          is_popular: Boolean(plan.is_popular) || false
        })) || [];

        setPlans(formattedPlans);

        // Check subscription status
        await checkSubscription();

      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast.error("Erro ao carregar informações de assinatura");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up polling to check subscription status periodically
    const intervalId = setInterval(() => {
      checkSubscription();
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Data não disponível';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Planos de Assinatura</h2>
        <p className="text-muted-foreground">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      {subscriptionStatus?.active && (
        <Alert className="mb-8 bg-green-50 border-green-200 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 flex items-center justify-between">
            <div>
              <p className="font-medium">Você tem uma assinatura ativa</p>
              <p className="text-sm">
                Próxima cobrança em: {formatDate(subscriptionStatus.current_period_end || 0)}
                {subscriptionStatus.cancel_at_period_end && " (Cancelamento agendado)"}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 flex items-center gap-1"
              onClick={checkSubscription}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-center gap-6 py-4">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            planId={plan.id}
            name={plan.name}
            description={plan.description}
            price={Number(plan.price)}
            interval={plan.interval}
            features={plan.features || []}
            isCurrentPlan={subscriptionStatus?.subscription_tier === plan.name}
            isPopular={plan.is_popular}
          />
        ))}
      </div>
    </div>
  );
}

