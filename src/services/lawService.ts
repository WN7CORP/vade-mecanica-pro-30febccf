import { supabase } from "@/integrations/supabase/client";

export type { 
  Article,
  LawOption,
  LawSearchResults
} from "@/integrations/supabase/laws";

export { 
  fetchLawArticles,
  searchArticle,
  searchByTerm,
  fetchAvailableLaws,
  fetchCategorizedLaws,
  searchAcrossAllLaws,
  LAW_OPTIONS,
  normalizeArticleNumber,
  isNumberSearch,
  isPartialNumberMatch,
  normalizeText,
  getTableName,
  getLawCategory
} from "@/integrations/supabase/laws";

// Enhanced number normalization function
export const enhancedNormalizeArticleNumber = (number: string): string => {
  // Remove anything that's not a number
  const normalized = number.replace(/[^0-9]/g, '');
  
  // If no numbers found, return empty string
  if (!normalized) return '';
  
  return normalized;
};

// Check if a search term could be an advanced article number pattern
export const isAdvancedNumberPattern = (term: string): boolean => {
  // Check for patterns like "art. 5", "artigo 5", "5º", etc.
  return /^art(?:igo)?\.?\s*\d+/i.test(term) || /^\d+º/i.test(term) || /^\d+\s*(?:caput|par[aá]grafo|inciso|al[íi]nea)/i.test(term);
};

// New function to check advanced number patterns
export const matchesAdvancedPattern = (articleNumber: string, searchTerm: string): boolean => {
  const normalizedArticle = normalizeArticleNumber(articleNumber).toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase();
  
  // Specific patterns that might be used in legal searches
  const patterns = [
    // Match "art. X" or "artigo X"
    new RegExp(`art(?:igo)?\.?\\s*${normalizedArticle}`, 'i'),
    // Match roman numerals (common in legal texts)
    new RegExp(`${normalizedArticle}\\s*(?:[IVXivx]+)`, 'i')
  ];
  
  return patterns.some(pattern => pattern.test(normalizedSearch));
};

// Calculate search relevance score
export const calculateRelevanceScore = (
  articleNumber: string, 
  searchTerm: string
): number => {
  const normalizedArticle = normalizeArticleNumber(articleNumber);
  const normalizedSearch = normalizeArticleNumber(searchTerm);
  
  // Exact match gets highest score
  if (normalizedArticle === normalizedSearch) {
    return 100;
  }
  
  // Partial matches
  if (normalizedArticle.includes(normalizedSearch)) {
    // Position matters - if search is at beginning of number, score higher
    if (normalizedArticle.startsWith(normalizedSearch)) {
      return 80;
    }
    
    // Otherwise score based on proximity to start
    const position = normalizedArticle.indexOf(normalizedSearch);
    return 70 - position; // The earlier the match appears, the higher the score
  }
  
  // No match
  return 0;
};

// Helper function to log search analytics
export const logSearchAnalytics = (
  term: string, 
  lawName: string, 
  resultsFound: boolean
): void => {
  // Log search pattern for analytics and future improvements
  console.log('Search Analytics:', {
    term,
    lawName,
    timestamp: new Date().toISOString(),
    isNumberSearch: isNumberSearch(term),
    normalized: normalizeArticleNumber(term),
    resultsFound,
    // Add more metrics as needed
  });
};
