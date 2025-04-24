
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/subscription/PricingCard";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, CreditCard, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
  };
  current_period_end?: number;
  cancel_at_period_end?: boolean;
}

export default function Subscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

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
    if (success === "true") {
      toast.success("Assinatura realizada com sucesso!", {
        description: "Agradecemos a confiança em nossos serviços."
      });
      // Remove query params
      navigate("/subscription", { replace: true });
      // Force a subscription check
      checkSubscription();
    } else if (canceled === "true") {
      toast.error("Processo de assinatura cancelado", {
        description: "Você pode tentar novamente quando quiser."
      });
      navigate("/subscription", { replace: true });
    }
  }, [success, canceled, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from("subscription_plans")
          .select("*");

        if (plansError) throw plansError;
        
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
          features: parseFeatures(plan.features),
          is_popular: Boolean(plan.is_popular) || false
        })) || [];
        
        setPlans(formattedPlans);

        // Check subscription
        await checkSubscription();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling to check subscription status periodically
    const intervalId = setInterval(checkSubscription, 15000);

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

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (!data?.url) throw new Error('URL do portal não encontrada');
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao acessar portal de gerenciamento');
    }
  };

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
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Escolha o plano ideal para suas necessidades e tenha acesso a recursos exclusivos para potencializar seu aprendizado
        </p>
      </div>
      
      {subscriptionStatus?.active && (
        <div className="mb-10">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Sua Assinatura Ativa</span>
              </CardTitle>
              <CardDescription>
                Detalhes da sua assinatura atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informações da Assinatura</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Plano</p>
                        <p className="text-muted-foreground">{subscriptionStatus.plan?.name || "Plano Standard"}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Próxima cobrança</p>
                        <p className="text-muted-foreground">
                          {formatDate(subscriptionStatus.current_period_end || 0)}
                          {subscriptionStatus.cancel_at_period_end && " (Cancelamento agendado)"}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col justify-center items-center border-l border-primary/20 pl-6">
                  <p className="text-center mb-4">Gerencie sua assinatura, método de pagamento e histórico de faturas</p>
                  <Button 
                    onClick={handleManageSubscription} 
                    className="min-w-[200px]"
                  >
                    Gerenciar Assinatura
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-4 flex items-center gap-1"
                    onClick={checkSubscription}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Verificar status</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
            isPopular={plan.is_popular}
          />
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como funciona a cobrança?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A cobrança é realizada mensalmente ou anualmente, dependendo do plano escolhido. 
                Você pode cancelar a qualquer momento pelo portal do cliente.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posso trocar de plano?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                A diferença será calculada proporcionalmente.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como cancelar minha assinatura?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento. 
                O acesso permanece até o fim do período pago.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preciso de cartão de crédito?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito e débito das principais bandeiras. 
                O pagamento é processado de forma segura pelo Stripe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

