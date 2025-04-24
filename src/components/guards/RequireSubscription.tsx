
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RequireSubscriptionProps {
  children: React.ReactNode;
}

export function RequireSubscription({ children }: RequireSubscriptionProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error("Error checking subscription:", error);
          toast.error("Erro ao verificar assinatura");
          return;
        }

        console.log("Subscription check response:", data);
        setIsSubscribed(data.active);
        
        if (!data.active) {
          toast.error("Esta funcionalidade requer uma assinatura ativa");
        }
      } catch (error) {
        console.error("Error in subscription check:", error);
        toast.error("Erro ao verificar status da assinatura");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-lg p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold">Recurso Exclusivo para Assinantes</h2>
          <p className="text-muted-foreground">
            Esta funcionalidade está disponível apenas para assinantes. 
            Assine agora para ter acesso a todos os recursos premium.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/subscription")}>
              Ver Planos
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
