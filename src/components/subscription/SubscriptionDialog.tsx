
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
}

export function SubscriptionDialog({ isOpen, onClose, planId, planName }: SubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccess) {
      // Trigger confetti animation on success
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const runConfetti = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#26a69a', '#00796b', '#4db6ac']
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#26a69a', '#00796b', '#4db6ac']
        });

        if (Date.now() < end) {
          requestAnimationFrame(runConfetti);
        }
      };

      runConfetti();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setIsLoading(false);
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!planId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('URL de checkout não encontrada');

      // Open Stripe checkout in a popup window
      const popupWidth = 1000;
      const popupHeight = 800;
      const left = (window.innerWidth - popupWidth) / 2;
      const top = (window.innerHeight - popupHeight) / 2;

      const popup = window.open(
        data.url,
        'StripeCheckout',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );

      // Poll for subscription status changes
      const checkSubscriptionInterval = setInterval(async () => {
        try {
          // Check if popup is closed
          if (popup?.closed) {
            clearInterval(checkSubscriptionInterval);
            
            // Verify subscription status
            const { data: subData } = await supabase.functions.invoke('check-subscription');
            
            if (subData?.active) {
              setIsSuccess(true);
              toast.success("Assinatura realizada com sucesso!");
            }
          }
        } catch (checkError) {
          console.error("Error checking subscription:", checkError);
        }
      }, 2000);

      // Clear interval after 5 minutes to prevent infinite polling
      setTimeout(() => {
        clearInterval(checkSubscriptionInterval);
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Error details:', error);
      setError('Erro ao processar assinatura. Por favor tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isSuccess ? "Parabéns!" : `Assinar plano ${planName}`}
          </DialogTitle>
          <DialogDescription>
            {isSuccess 
              ? "Sua assinatura foi ativada com sucesso." 
              : `Você está prestes a assinar o plano ${planName}. Clique no botão abaixo para continuar.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {isLoading && (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Preparando checkout seguro...</p>
            </div>
          )}

          {isSuccess && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Obrigado por assinar!</p>
              <p className="text-muted-foreground mt-2">
                Você agora tem acesso a todos os recursos do plano {planName}.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {error && (
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">{error}</p>
              <button 
                onClick={handleSubscribe} 
                className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !isSuccess && !error && (
            <button 
              onClick={handleSubscribe} 
              className="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-lg font-medium"
            >
              Continuar para pagamento
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
