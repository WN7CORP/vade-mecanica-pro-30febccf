
import { useState } from "react";
import { generateArticleExplanation, AIExplanation as AIExplanationType } from "@/services/aiService";

interface Article {
  article: string;
  content: string;
}

export const useAIExplanation = (lawName: string | undefined) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanationType | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleExplainArticle = async (article: Article, type: 'technical' | 'formal') => {
    if (!article.article || !lawName) return;
    
    setSelectedArticle(article);
    setShowExplanation(true);
    setLoadingExplanation(true);
    
    try {
      const aiExplanation = await generateArticleExplanation(
        article.article,
        article.content,
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
    handleExplainArticle
  };
};
