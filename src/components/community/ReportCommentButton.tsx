
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const reportSchema = z.object({
  reason: z.string().min(5, "Por favor, explique o motivo da denúncia (mínimo 5 caracteres)"),
});

interface ReportCommentButtonProps {
  commentId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default";
}

export function ReportCommentButton({ 
  commentId,
  variant = "ghost",
  size = "sm" 
}: ReportCommentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof reportSchema>) => {
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para denunciar um comentário",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: session.user.id,
          reason: values.reason,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Denúncia enviada",
        description: "Agradecemos pela sua contribuição. Nossa equipe irá analisar.",
      });
      
      setIsDialogOpen(false);
      form.reset();
      
    } catch (error: any) {
      console.error("Erro ao enviar denúncia:", error);
      toast({
        title: "Erro ao enviar denúncia",
        description: error.message || "Não foi possível enviar sua denúncia. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-muted-foreground">
          <Flag className="h-4 w-4 mr-1" />
          <span>Denunciar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar Comentário</DialogTitle>
          <DialogDescription>
            Informe o motivo pelo qual este comentário deve ser revisado pelos moderadores.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da denúncia..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  "Enviar Denúncia"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
