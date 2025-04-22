
import { useState } from "react";
import { generateArticleExplanation, AIExplanation as AIExplanationType } from "@/services/aiService";
import { Article } from "@/services/lawService";
import { toast } from "@/hooks/use-toast";

export const useAIExplanation = (lawName: string | undefined) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleExplainArticle = async (article: Article, type: 'technical' | 'formal') => {
    if (!article.numero || !lawName) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar o artigo ou a lei para explicação.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedArticle(article);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    console.log(`Solicitando explicação ${type} para artigo ${article.numero}`);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        article.numero,
        article.conteudo,
        decodeURIComponent(lawName),
        type
      );
      
      console.log("Explicação recebida:", aiExplanation);
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a explicação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoadingExplanation(false);
    }
  };

  return {
    showExplanation,
    setShowExplanation,
    explanation,
    loadingExplanation,
    selectedArticle,
    setSelectedArticle,
    handleExplainArticle
  };
};
