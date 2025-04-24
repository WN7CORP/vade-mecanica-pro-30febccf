
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/subscription/PricingCard";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: number;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
                   typeof plan.features === 'string' ? JSON.parse(plan.features) : []
        })) || [];

        setPlans(formattedPlans);

        // Check subscription status
        const { data: subData, error: subError } = await supabase.functions.invoke('check-subscription');
        if (subError) throw subError;
        setSubscriptionStatus(subData);

      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast.error("Erro ao carregar informações de assinatura");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Planos de Assinatura</h2>
        <p className="text-muted-foreground">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            planId={plan.id}
            name={plan.name}
            description={plan.description}
            price={plan.price}
            interval={plan.interval}
            features={plan.features}
            isCurrentPlan={subscriptionStatus?.subscription_tier === plan.name}
          />
        ))}
      </div>
    </div>
  );
}
