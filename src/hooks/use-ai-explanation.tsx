
import { useState } from "react";
import { generateArticleExplanation, AIExplanation as AIExplanationType } from "@/services/aiService";
import { Article } from "@/services/lawService";

export const useAIExplanation = (lawName: string | undefined) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleExplainArticle = async (article: Article, type: 'technical' | 'formal') => {
    if (!article.numero || !lawName) return;
    
    setSelectedArticle(article);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        article.numero,
        article.conteudo,
        decodeURIComponent(lawName),
        type
      );
      
      setExplanation(aiExplanation);
    } catch (error) {
      console.error("Erro ao gerar explicação:", error);
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
