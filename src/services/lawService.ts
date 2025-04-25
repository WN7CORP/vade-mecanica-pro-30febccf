
export type { 
  Article,
  LawOption 
} from "@/integrations/supabase/laws";

export { 
  fetchLawArticles,
  searchArticle,
  searchByTerm,
  fetchAvailableLaws,
  fetchCategorizedLaws,
  searchAcrossAllLaws,
  LAW_OPTIONS 
} from "@/integrations/supabase/laws";

// Add new number-specific search functions
export const normalizeArticleNumber = (number: string): string => {
  return number.replace(/[^0-9]/g, '');
};

export const isArticleNumberMatch = (articleNumber: string, searchTerm: string): boolean => {
  const normalizedArticle = normalizeArticleNumber(articleNumber);
  const normalizedSearch = normalizeArticleNumber(searchTerm);
  return normalizedArticle.includes(normalizedSearch);
};
