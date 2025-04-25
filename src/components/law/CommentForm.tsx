
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CommentFormProps {
  lawName: string;
  articleNumber: string;
  onCommentAdded?: () => void;
}

export const CommentForm = ({ lawName, articleNumber, onCommentAdded }: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { toast } = useToast();

  const checkTermsAcceptance = async () => {
    const { data } = await supabase
      .from('comment_terms_acceptance')
      .select('accepted_at')
      .single();
    return !!data;
  };

  const acceptTerms = async () => {
    const { error } = await supabase
      .from('comment_terms_acceptance')
      .insert([{ user_id: (await supabase.auth.getUser()).data.user?.id }]);
    
    if (!error) {
      setShowTerms(false);
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!content || !tag) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha o comentário e selecione uma tag.",
      });
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para comentar.",
      });
      return;
    }

    const hasAcceptedTerms = await checkTermsAcceptance();
    if (!hasAcceptedTerms) {
      setShowTerms(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('law_article_comments')
        .insert([
          {
            content,
            tag,
            law_name: lawName,
            article_number: articleNumber,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!",
      });

      setContent("");
      setTag("");
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Textarea
              placeholder="Escreva seu comentário..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="w-[150px]">
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="duvida">Dúvida</SelectItem>
                <SelectItem value="atento">Atento</SelectItem>
                <SelectItem value="importante">Importante</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              className="w-full mt-2" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Comentar
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termos de Uso dos Comentários</DialogTitle>
            <DialogDescription className="py-4">
              Ao utilizar o sistema de comentários, você concorda em:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Respeitar outros usuários e suas opiniões</li>
                <li>Não publicar conteúdo ofensivo ou inadequado</li>
                <li>Não compartilhar informações pessoais de terceiros</li>
                <li>Aceitar que seus comentários podem ser moderados</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowTerms(false)}>
              Cancelar
            </Button>
            <Button onClick={acceptTerms}>
              Aceitar e Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
