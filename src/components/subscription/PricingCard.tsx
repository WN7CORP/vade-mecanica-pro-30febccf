
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingCardProps {
  onSubscribe: () => void;
  isLoading?: boolean;
}

export function PricingCard({ onSubscribe, isLoading }: PricingCardProps) {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="text-2xl">Plano Premium</CardTitle>
        <CardDescription>
          Acesso completo a todos os recursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-6">
          R$ 12,99
          <span className="text-sm font-normal text-muted-foreground">/mês</span>
        </div>
        <ul className="space-y-2 mb-6">
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            Acesso ilimitado aos flashcards
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            Recursos avançados de estudo
          </li>
          <li className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-primary" />
            Suporte prioritário
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onSubscribe}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Assinar agora"}
        </Button>
      </CardFooter>
    </Card>
  );
}
