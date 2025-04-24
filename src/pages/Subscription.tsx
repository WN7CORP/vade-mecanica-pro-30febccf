
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "@/components/subscription/PricingCard";
import { toast } from "sonner";

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para assinar");
        navigate("/auth");
        return;
      }

      // Redirect to Cakto checkout
      window.location.href = `https://app.cakto.com.br/checkout/YOUR_MERCHANT_ID?plan=YOUR_PLAN_ID&external_id=${user.id}&redirect_url=${window.location.origin}/subscription/success`;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao processar assinatura");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
        <p className="text-muted-foreground">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>
      
      <div className="flex justify-center">
        <PricingCard onSubscribe={handleSubscribe} isLoading={isLoading} />
      </div>
    </div>
  );
}
