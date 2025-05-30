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

// Enhanced number normalization function that handles article prefixes 
export const enhancedNormalizeArticleNumber = (number: string | null | undefined): string => {
  if (!number) return '';
  
  // Remove prefixes like "art.", "artigo", etc.
  const cleanNumber = number.toLowerCase()
    .replace(/^art\.?\s*/i, '')
    .replace(/^artigo\s*/i, '')
    .replace(/º|o|°/g, '');
  
  // Remove anything that's not a number
  const normalized = cleanNumber.replace(/[^0-9]/g, '');
  
  return normalized;
};

// Check if a search term could be an advanced article number pattern
export const isAdvancedNumberPattern = (term: string): boolean => {
  // Check for patterns like "art. 5", "artigo 5", "5º", etc.
  return /^art(?:igo)?\.?\s*\d+/i.test(term) || /^\d+º/i.test(term) || /^\d+\s*(?:caput|par[aá]grafo|inciso|al[íi]nea)/i.test(term);
};

// New function to check advanced number patterns
export const matchesAdvancedPattern = (articleNumber: string | null | undefined, searchTerm: string): boolean => {
  if (!articleNumber) return false;
  
  // Import needed functions from laws.ts
  const { normalizeArticleNumber } = require("@/integrations/supabase/laws");
  
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
  articleNumber: string | null | undefined, 
  searchTerm: string
): number => {
  if (!articleNumber) return 0;
  
  // Import needed functions from laws.ts
  const { normalizeArticleNumber } = require("@/integrations/supabase/laws");
  
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
  // Import needed functions from laws.ts
  const { isNumberSearch, normalizeArticleNumber } = require("@/integrations/supabase/laws");
  
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
