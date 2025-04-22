
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
    if (!article) {
      console.error("Artigo não fornecido para explicação");
      toast({
        title: "Erro",
        description: "Não foi possível identificar o artigo para explicação.",
        variant: "destructive",
      });
      return;
    }

    if (!article.numero || !article.artigo) {
      console.error("Artigo sem número ou conteúdo", article);
      toast({
        title: "Erro",
        description: "Artigo sem número ou conteúdo válido.",
        variant: "destructive",
      });
      return;
    }

    if (!lawName) {
      console.error("Nome da lei não fornecido para explicação");
      toast({
        title: "Erro",
        description: "Nome da lei não identificado.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedArticle(article);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    console.log(`Solicitando explicação ${type} para artigo ${article.numero}`);
    console.log(`Lei: ${lawName}, Artigo: ${article.artigo.substring(0, 100)}...`);
    
    try {
      // Utilizar o nome da lei decodificado para evitar problemas com caracteres especiais
      const decodedLawName = decodeURIComponent(lawName);
      console.log(`Nome da lei decodificado: ${decodedLawName}`);
      
      const aiExplanation = await generateArticleExplanation(
        article.numero,
        article.artigo,
        decodedLawName,
        type
      );
      
      console.log("Explicação recebida:", aiExplanation);
      
      if (!aiExplanation || 
          !aiExplanation.summary || 
          !aiExplanation.detailed || 
          !aiExplanation.examples || 
          aiExplanation.examples.length === 0) {
        console.error("Explicação incompleta recebida:", aiExplanation);
        throw new Error("Explicação incompleta ou inválida");
      }
      
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a explicação. Tente novamente mais tarde.",
        variant: "destructive",
      });
      // Fechar o modal de explicação em caso de erro
      setShowExplanation(false);
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
