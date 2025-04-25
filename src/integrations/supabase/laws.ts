
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

/** Retorna apenas os nomes para popular um dropdown/menu */
export const fetchAvailableLaws = async (): Promise<string[]> => {
  return LAW_OPTIONS.map((opt) => opt.display);
}

/** Retorna leis agrupadas por categoria (códigos e estatutos) */
export const fetchCategorizedLaws = async (): Promise<Record<string, LawOption[]>> => {
  const categorized: Record<string, LawOption[]> = {
    'codigo': LAW_OPTIONS.filter(law => law.category === 'codigo'),
    'estatuto': LAW_OPTIONS.filter(law => law.category === 'estatuto')
  };
  
  return categorized;
}

/** Busca o nome da tabela a partir do texto exibido */
function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table ?? null;
}

/** Logs a user action in the statistics table in background */
async function logUserAction(
  actionType: 'search' | 'explain' | 'favorite' | 'note',
  lawName?: string,
  articleNumber?: string
) {
  try {
    // Get the current user's ID from the auth session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    // Only proceed if we have a user ID
    if (userId) {
      // Run in background - don't block the main flow
      // Using Promise-based approach instead of EdgeRuntime
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

/**
 * Mapeia os dados crus vindos do supabase para a interface Article
 * Trazendo os campos certos independentemente do nome da coluna no banco
 */
function mapRawArticle(dbRow: any): Article {
  return {
    id: dbRow.id,
    numero: dbRow.numero,
    titulo: dbRow.titulo || undefined,
    conteudo: dbRow.artigo || dbRow.conteudo || "",
    explicacao_tecnica: dbRow["explicacao tecnica"] || undefined,
    explicacao_formal: dbRow["explicacao formal"] || undefined,
    exemplo1: dbRow.exemplo1 || undefined,
    exemplo2: dbRow.exemplo2 || undefined,
    created_at: dbRow.created_at
  };
}

// Cache for articles to avoid redundant API calls
const articlesCache: Record<string, { timestamp: number, data: Article[] }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<{articles: Article[], totalCount: number}> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  console.log(`Buscando todos os artigos da tabela: ${tableName}`);
  
  // Log user action in background to not block the main flow
  logUserAction('search', lawDisplayName);

  try {
    // Get all articles at once
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

    // Map the raw data to the Article interface
    const articles = (data as any[]).map(mapRawArticle);
    
    return { 
      articles,
      totalCount: count || articles.length 
    };
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
};

export const searchArticle = async (
  lawDisplayName: string,
  articleNumber: string
): Promise<Article | null> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    return null;
  }

  await logUserAction('search', lawDisplayName, articleNumber);

  // Seleciona todas as colunas para não dar conflito de tipagem
  let selectCols = "*";
  if (tableName === "constituicao_federal") {
    selectCols = "id,numero,titulo,artigo,\"explicacao tecnica\",\"explicacao formal\",exemplo1,exemplo2,created_at";
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select(selectCols)
    .eq("numero", articleNumber)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
  if (!data) {
    return null;
  }

  return mapRawArticle(data);
};

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

  let selectCols = "*";
  if (tableName === "constituicao_federal") {
    selectCols = "id,numero,titulo,artigo,\"explicacao tecnica\",\"explicacao formal\",exemplo1,exemplo2,created_at";
  }

  const term = searchTerm.toLowerCase();
  // Busca nos campos relevantes (numero, artigo/titulo/conteudo)
  const { data, error } = await supabase
    .from(tableName as any)
    .select(selectCols)
    .or([
      `numero.ilike.%${term}%`,
      `artigo.ilike.%${term}%`,
      `titulo.ilike.%${term}%`,
      `conteudo.ilike.%${term}%`
    ].join(","));

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
  
  if (!data) {
    return [];
  }

  return (data as any[]).map(mapRawArticle);
};

// Busca em todas as leis simultaneamente
export const searchAcrossAllLaws = async (
  searchTerm: string
): Promise<Array<{lawName: string, articles: Article[]}>
> => {
  const results: Array<{lawName: string, articles: Article[]}> = [];
  const term = searchTerm.toLowerCase();

  // Limitamos a 5 resultados por lei para não sobrecarregar
  const searchPromises = LAW_OPTIONS.map(async (law) => {
    try {
      const articles = await searchByTerm(law.display, term);
      if (articles.length > 0) {
        results.push({
          lawName: law.display,
          articles: articles.slice(0, 5) // limita a 5 resultados por lei
        });
      }
    } catch (err) {
      console.error(`Erro ao buscar em ${law.display}:`, err);
    }
  });

  await Promise.all(searchPromises);
  return results;
};
