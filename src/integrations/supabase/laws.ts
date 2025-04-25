
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string;
  titulo?: string;
  conteudo: string;
  explicacao_tecnica?: string;
  explicacao_formal?: string;
  exemplo1?: string;
  exemplo2?: string;
  created_at: string;
}

export interface LawOption {
  display: string;
  table: string;
  category: 'codigo' | 'estatuto';
  abbreviation: string;
}

export const LAW_OPTIONS: LawOption[] = [
  { display: "Constituição Federal",         table: "constituicao_federal",      category: 'codigo', abbreviation: "CF" },
  { display: "Código Civil",                 table: "codigo_civil",              category: 'codigo', abbreviation: "CC" },
  { display: "Código Penal",                 table: "codigo_penal",              category: 'codigo', abbreviation: "CP" },
  { display: "Código de Processo Civil",     table: "codigo_processo_civil",     category: 'codigo', abbreviation: "CPC" },
  { display: "Código de Processo Penal",     table: "codigo_processo_penal",     category: 'codigo', abbreviation: "CPP" },
  { display: "Código de Defesa do Consumidor", table: "codigo_defesa_consumidor", category: 'codigo', abbreviation: "CDC" },
  { display: "Código Tributário Nacional",   table: "codigo_tributario",         category: 'codigo', abbreviation: "CTN" },
  { display: "Consolidação das Leis do Trabalho", table: "consolidacao_leis_trabalho", category: 'codigo', abbreviation: "CLT" },
  { display: "Código de Trânsito Brasileiro", table: "codigo_transito",          category: 'codigo', abbreviation: "CTB" },
  { display: "Estatuto da Criança e do Adolescente", table: "estatuto_da_crianca_e_do_adolescente", category: 'estatuto', abbreviation: "ECA" },
  { display: "Estatuto do Idoso", table: "estatuto_do_idoso", category: 'estatuto', abbreviation: "EI" },
  { display: "Estatuto da Pessoa com Deficiência", table: "estatuto_da_pessoa_com_deficiencia", category: 'estatuto', abbreviation: "EPD" },
  { display: "Estatuto da Igualdade Racial", table: "estatuto_da_igualdade_racial", category: 'estatuto', abbreviation: "EIR" },
  { display: "Estatuto do Desarmamento", table: "estatuto_do_desarmamento", category: 'estatuto', abbreviation: "ED" },
  { display: "Estatuto da Juventude", table: "estatuto_da_juventude", category: 'estatuto', abbreviation: "EJ" },
  { display: "Estatuto da Cidade", table: "estatuto_da_cidade", category: 'estatuto', abbreviation: "EC" },
  { display: "Estatuto do Torcedor", table: "estatuto_do_torcedor", category: 'estatuto', abbreviation: "ET" },
  { display: "Estatuto da Terra", table: "estatuto_da_terra", category: 'estatuto', abbreviation: "ETr" },
  { display: "Estatuto da Advocacia e da OAB", table: "estatuto_da_advocacia_e_da_oab", category: 'estatuto', abbreviation: "EAOB" }
];

// Improved article number normalization that ignores case, punctuation and diacritics
export const normalizeArticleNumber = (number: string | null | undefined): string => {
  if (!number) return '';
  
  // Remove prefixes like "art.", "artigo", etc., ignore case
  const cleanNumber = number.toLowerCase()
    .replace(/^art\.?\s*/i, '')
    .replace(/^artigo\s*/i, '')
    .replace(/º|o|°/g, '');
  
  // Extract only the digits
  return cleanNumber.replace(/[^0-9]/g, '');
};

// Improved text normalization function
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Remove accents/diacritics
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Check if a term is likely to be a number search
export const isNumberSearch = (term: string): boolean => {
  // Check common number patterns in legal searches
  return /^\d+/.test(term) || /^art\D*\d+/i.test(term);
};

// Check for partial number matches with better accuracy
export const isPartialNumberMatch = (articleNumber: string | null | undefined, searchTerm: string): boolean => {
  const normalizedArticle = normalizeArticleNumber(articleNumber);
  const normalizedSearch = normalizeArticleNumber(searchTerm);
  
  if (!normalizedSearch) return false;
  
  // Exact match
  if (normalizedArticle === normalizedSearch) return true;
  
  // Partial match
  return normalizedArticle.includes(normalizedSearch);
};

export const fetchAvailableLaws = async (): Promise<string[]> => {
  return LAW_OPTIONS.map((opt) => opt.display);
}

export const fetchCategorizedLaws = async (): Promise<Record<string, LawOption[]>> => {
  const categorized: Record<string, LawOption[]> = {
    'codigo': LAW_OPTIONS.filter(law => law.category === 'codigo'),
    'estatuto': LAW_OPTIONS.filter(law => law.category === 'estatuto')
  };
  
  return categorized;
}

export function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => normalizeText(opt.display) === normalizeText(displayName)
  );
  return found?.table ?? null;
}

export function getLawCategory(displayName: string): 'codigo' | 'estatuto' | undefined {
  const found = LAW_OPTIONS.find(
    (opt) => normalizeText(opt.display) === normalizeText(displayName)
  );
  return found?.category;
}

// Improved function to log user actions with better error handling
export async function logUserAction(
  actionType: 'search' | 'explain' | 'favorite' | 'note',
  lawName?: string,
  articleNumber?: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId) {
      setTimeout(async () => {
        try {
          const { error } = await supabase.from('user_statistics').insert({
            user_id: userId,
            action_type: actionType,
            law_name: lawName,
            article_number: articleNumber
          });

          if (error) {
            console.error('Error logging user action:', error);
          }
        } catch (err) {
          console.error('Background task error:', err);
        }
      }, 0);
    } else {
      console.log('User not authenticated, skipping action logging');
    }
  } catch (err) {
    console.error('Failed to log user action:', err);
  }
}

export function mapRawArticle(dbRow: any): Article {
  return {
    id: dbRow.id,
    numero: dbRow.numero,
    titulo: dbRow.titulo || undefined,
    conteudo: dbRow.conteudo || dbRow.artigo || "", // Handle both field names from the database
    explicacao_tecnica: dbRow["explicacao tecnica"] || dbRow.explicacao_tecnica || undefined,
    explicacao_formal: dbRow["explicacao formal"] || dbRow.explicacao_formal || undefined,
    exemplo1: dbRow.exemplo1 || undefined,
    exemplo2: dbRow.exemplo2 || undefined,
    created_at: dbRow.created_at
  };
}

// Cache configuration
const articlesCache: Record<string, { timestamp: number, data: Article[] }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<{articles: Article[], totalCount: number}> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  console.log(`Buscando todos os artigos da tabela: ${tableName}`);
  
  // Use cached data if available and not expired
  if (articlesCache[lawDisplayName] && 
      (Date.now() - articlesCache[lawDisplayName].timestamp) < CACHE_TTL) {
    console.log(`Usando cache para ${lawDisplayName}`);
    const cachedData = articlesCache[lawDisplayName].data;
    return { articles: cachedData, totalCount: cachedData.length };
  }
  
  logUserAction('search', lawDisplayName);

  try {
    const { data, error, count } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact' })
      .order('id', { ascending: true });

    if (error) {
      console.error("Erro ao buscar artigos:", error);
      throw new Error("Falha ao carregar artigos");
    }
    
    if (!data) {
      return { articles: [], totalCount: 0 };
    }

    const articles = (data as any[]).map(mapRawArticle);
    
    // Save to cache
    articlesCache[lawDisplayName] = {
      timestamp: Date.now(),
      data: articles
    };
    
    return { 
      articles,
      totalCount: count || articles.length 
    };
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
};

// Improved search by article number with better pattern matching
export const searchArticle = async (
  lawDisplayName: string,
  searchTerm: string
): Promise<Article | null> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return null;
  }

  console.log('Search pattern:', {
    isNumberSearch: isNumberSearch(searchTerm),
    term: searchTerm,
    normalized: normalizeArticleNumber(searchTerm),
    timestamp: new Date().toISOString(),
    law: lawDisplayName
  });

  try {
    const normalizedSearchTerm = normalizeArticleNumber(searchTerm);
    
    // Check if we have the articles in cache to avoid database query
    if (articlesCache[lawDisplayName] && 
        (Date.now() - articlesCache[lawDisplayName].timestamp) < CACHE_TTL) {
      
      const articles = articlesCache[lawDisplayName].data;
      
      // First try exact number match
      const exactMatch = articles.find(article => 
        normalizeArticleNumber(article.numero) === normalizedSearchTerm
      );
      
      if (exactMatch) return exactMatch;
      
      // Then try partial matches
      const matches = articles
        .filter(article => isPartialNumberMatch(article.numero, searchTerm))
        .sort((a, b) => {
          const aMatch = normalizeArticleNumber(a.numero);
          const bMatch = normalizeArticleNumber(b.numero);
          
          if (aMatch === normalizedSearchTerm) return -1;
          if (bMatch === normalizedSearchTerm) return 1;
          
          return aMatch.indexOf(normalizedSearchTerm) - bMatch.indexOf(normalizedSearchTerm);
        });
      
      if (matches.length > 0) return matches[0];
    }
    
    // If not in cache, query the database
    const { data: exactMatch } = await supabase
      .from(tableName as any)
      .select("*")
      .eq("numero", searchTerm)
      .maybeSingle();

    if (exactMatch) {
      return mapRawArticle(exactMatch);
    }

    // For number searches, try to find the best match
    if (isNumberSearch(searchTerm)) {
      const { data } = await supabase
        .from(tableName as any)
        .select("*");

      if (!data || data.length === 0) {
        return null;
      }

      const sortedResults = (data as any[])
        .filter(article => isPartialNumberMatch(article.numero, searchTerm))
        .sort((a, b) => {
          const aMatch = normalizeArticleNumber(a.numero);
          const bMatch = normalizeArticleNumber(b.numero);
          
          if (aMatch === normalizedSearchTerm) return -1;
          if (bMatch === normalizedSearchTerm) return 1;
          
          return aMatch.indexOf(normalizedSearchTerm) - bMatch.indexOf(normalizedSearchTerm);
        });

      return sortedResults.length > 0 ? mapRawArticle(sortedResults[0]) : null;
    }

    return null;
  } catch (error) {
    console.error("Erro na busca por artigo:", error);
    return null;
  }
};

// Enhanced text search function with better normalization and matching
export const searchByTerm = async (
  lawDisplayName: string,
  searchTerm: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return [];
  }

  await logUserAction('search', lawDisplayName);

  const term = normalizeText(searchTerm);
  
  // Try to use cached data first
  if (articlesCache[lawDisplayName] && 
      (Date.now() - articlesCache[lawDisplayName].timestamp) < CACHE_TTL) {
    
    const cachedResults = articlesCache[lawDisplayName].data.filter(article => {
      const articleText = normalizeText(getContentText(article));
      return articleText.includes(term);
    });
    
    if (cachedResults.length > 0) {
      return cachedResults;
    }
  }
  
  // If not in cache or no results found, query the database
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Find out which column contains the article text
    const firstRow = data[0];
    const hasArtigo = 'artigo' in firstRow;
    const hasConteudo = 'conteudo' in firstRow;
    
    // Build the appropriate query based on the schema
    let searchQuery;
    if (hasArtigo && hasConteudo) {
      searchQuery = `artigo.ilike.%${term}%,conteudo.ilike.%${term}%`;
    } else if (hasArtigo) {
      searchQuery = `artigo.ilike.%${term}%`;
    } else if (hasConteudo) {
      searchQuery = `conteudo.ilike.%${term}%`;
    } else {
      // If neither column exists, search all text columns
      const textColumns = Object.keys(firstRow).filter(
        key => typeof firstRow[key] === 'string'
      );
      
      if (textColumns.length === 0) return [];
      
      searchQuery = textColumns
        .map(col => `${col}.ilike.%${term}%`)
        .join(',');
    }
    
    const { data: searchResults, error: searchError } = await supabase
      .from(tableName as any)
      .select('*')
      .or(searchQuery);
    
    if (searchError) throw searchError;
    
    // Process and return results
    return searchResults ? (searchResults as any[]).map(mapRawArticle) : [];
  } catch (error) {
    console.error("Error searching articles:", error);
    return [];
  }
};

const getContentText = (article: Article): string => {
  if (typeof article.conteudo === 'string') return article.conteudo;
  
  if (typeof article.conteudo === 'object' && article.conteudo !== null) {
    return Object.values(article.conteudo)
      .filter(val => typeof val === 'string')
      .join(' ');
  }
  
  return '';
};

export interface LawSearchResults {
  lawName: string;
  lawCategory: 'codigo' | 'estatuto';
  articles: Article[];
  total: number;
}

// Improved cross-law search with parallel requests for better performance
export const searchAcrossAllLaws = async (
  searchTerm: string
): Promise<LawSearchResults[]> => {
  const results: LawSearchResults[] = [];
  const term = normalizeText(searchTerm);

  const searchPromises = LAW_OPTIONS.map(async (law) => {
    try {
      const articles = await searchByTerm(law.display, term);
      if (articles.length > 0) {
        results.push({
          lawName: law.display,
          lawCategory: law.category,
          articles: articles.slice(0, 5), // Limit to top 5 results per law for performance
          total: articles.length
        });
      }
    } catch (err) {
      console.error(`Erro ao buscar em ${law.display}:`, err);
    }
  });

  // Wait for all search operations to complete
  await Promise.all(searchPromises);
  
  // Sort by most relevant (most matches)
  results.sort((a, b) => b.total - a.total);
  
  return results;
};
