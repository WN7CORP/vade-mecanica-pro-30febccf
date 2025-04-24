
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingCardProps {
  planId: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  isCurrentPlan?: boolean;
}

export function PricingCard({
  planId,
  name,
  description,
  price,
  interval,
  features,
  isCurrentPlan
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      if (!data.url) throw new Error('URL de checkout não encontrada');

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      if (!data.url) throw new Error('URL do portal não encontrada');

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao acessar portal de gerenciamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`w-[380px] ${isCurrentPlan ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl">
          {name}
          {isCurrentPlan && (
            <span className="ml-2 text-sm text-primary">(Plano Atual)</span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-6">
          R$ {price}
          <span className="text-sm font-normal text-muted-foreground">/{interval}</span>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={isCurrentPlan ? handleManageSubscription : handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : isCurrentPlan ? "Gerenciar Assinatura" : "Assinar agora"}
        </Button>
      </CardFooter>
    </Card>
  );
}
