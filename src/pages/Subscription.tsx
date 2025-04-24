
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  active: boolean;
  plan?: Plan;
}

export default function Subscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: plansData, error } = await supabase
          .from("subscription_plans")
          .select("*");

        if (error) throw error;
        
        // Convert the features from JSON to string array
        const formattedPlans = plansData?.map(plan => {
          // Parse features based on its type
          let parsedFeatures: string[] = [];
          
          if (plan.features) {
            if (Array.isArray(plan.features)) {
              // If features is already an array, convert each item to string
              parsedFeatures = plan.features.map(item => String(item));
            } else if (typeof plan.features === 'string') {
              // If features is a JSON string, parse it
              try {
                const parsed = JSON.parse(plan.features);
                parsedFeatures = Array.isArray(parsed) 
                  ? parsed.map(item => String(item))
                  : [String(parsed)];
              } catch (e) {
                parsedFeatures = [String(plan.features)];
              }
            } else if (typeof plan.features === 'object') {
              // If features is a JSON object from Supabase
              try {
                parsedFeatures = Array.isArray(plan.features) 
                  ? plan.features.map(item => String(item)) 
                  : [String(plan.features)];
              } catch (e) {
                parsedFeatures = [];
              }
            }
          }

          return {
            id: plan.id,
            name: plan.name,
            description: plan.description || "",
            price: Number(plan.price),
            interval: plan.interval,
            features: parsedFeatures
          };
        }) || [];
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Erro ao carregar planos");
      }
    };

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (error) throw error;
        setSubscriptionStatus(data);
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast.error("Erro ao verificar assinatura");
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlans(), checkSubscription()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
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
            description={plan.description || ""}
            price={Number(plan.price)}
            interval={plan.interval}
            features={plan.features || []}
            isCurrentPlan={subscriptionStatus?.plan?.id === plan.id}
          />
        ))}
      </div>
    </div>
  );
}
