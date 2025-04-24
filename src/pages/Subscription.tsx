
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/subscription/PricingCard";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

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
  current_period_end?: number;
}

export default function Subscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success === "true") {
      toast.success("Assinatura realizada com sucesso!");
      // Remove query params
      navigate("/subscription", { replace: true });
    } else if (canceled === "true") {
      toast.error("Processo de assinatura cancelado");
      navigate("/subscription", { replace: true });
    }
  }, [success, canceled, navigate]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: plansData, error } = await supabase
          .from("subscription_plans")
          .select("*");

        if (error) throw error;
        
        const parseFeatures = (features: any): string[] => {
          if (!features) return [];

          if (Array.isArray(features)) {
            return features.map(item => String(item).trim()).filter(item => item);
          }

          if (typeof features === 'string') {
            try {
              const parsed = JSON.parse(features);
              return Array.isArray(parsed) 
                ? parsed.map(item => String(item).trim()).filter(item => item)
                : [String(parsed).trim()];
            } catch {
              return [features.trim()];
            }
          }

          if (typeof features === 'object') {
            return Array.isArray(features) 
              ? features.map(item => String(item).trim()).filter(item => item)
              : [String(features).trim()];
          }

          return [];
        };
        
        const formattedPlans = plansData?.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || "",
          price: Number(plan.price),
          interval: plan.interval,
          features: parseFeatures(plan.features)
        })) || [];
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Erro ao carregar planos");
      }
    };

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (error) {
          console.error("Error from check-subscription:", error);
          throw error;
        }
        console.log("Subscription status:", data);
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
      
      {subscriptionStatus?.active && (
        <Alert variant="default" className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            Você tem uma assinatura ativa até {subscriptionStatus.current_period_end
              ? new Date(subscriptionStatus.current_period_end * 1000).toLocaleDateString()
              : 'data não disponível'}
          </AlertDescription>
        </Alert>
      )}
      
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
