
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
