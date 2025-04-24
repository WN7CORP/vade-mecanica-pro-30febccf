
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  planId: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
}

export function PricingCard({
  planId,
  name,
  description,
  price,
  interval,
  features,
  isCurrentPlan,
  isPopular = false
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      if (!data?.url) throw new Error('URL do portal não encontrada');

      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao acessar portal de gerenciamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={cn(
        "w-[340px] transition-all duration-300 hover:shadow-lg",
        isPopular ? "border-primary scale-105" : "",
        isCurrentPlan ? "border-primary/70" : ""
      )}>
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>Mais Popular</span>
          </div>
        )}
        <CardHeader className={cn(
          "pb-3",
          isPopular ? "bg-primary/5 rounded-t-lg" : ""
        )}>
          <CardTitle className="text-2xl flex items-center justify-between">
            {name}
            {isCurrentPlan && (
              <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">Plano Atual</span>
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className={cn(
          "pt-3",
          isPopular ? "bg-primary/5" : ""
        )}>
          <div className="text-4xl font-bold mb-1">
            R$ {price}
            <span className="text-sm font-normal text-muted-foreground">/{interval}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Faturados {interval === 'mês' ? 'mensalmente' : 'anualmente'}</p>
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className={cn(
          "pt-6",
          isPopular ? "bg-primary/5 rounded-b-lg" : ""
        )}>
          <Button
            className={cn(
              "w-full transition-transform hover:scale-105",
              isPopular ? "bg-primary hover:bg-primary-600" : ""
            )}
            variant={isPopular ? "default" : "outline"}
            onClick={isCurrentPlan ? handleManageSubscription : () => setIsSubscriptionDialogOpen(true)}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : isCurrentPlan ? "Gerenciar Assinatura" : "Assinar agora"}
          </Button>
        </CardFooter>
      </Card>

      <SubscriptionDialog
        isOpen={isSubscriptionDialogOpen}
        onClose={() => setIsSubscriptionDialogOpen(false)}
        planId={planId}
        planName={name}
      />
    </>
  );
}
