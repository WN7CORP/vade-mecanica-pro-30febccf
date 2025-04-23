import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string; // número do artigo
  titulo?: string; // texto que aparece antes do artigo, opcional
  conteudo: string; // conteúdo do artigo
  explicacao_tecnica?: string; // explicação técnica
  explicacao_formal?: string; // explicação formal
  exemplo1?: string; // exemplo 1
  exemplo2?: string; // exemplo 2
  created_at: string;
}

export interface LawOption {
  display: string;
  table: string;
}

// Use literal string type instead of a type alias to ensure compatibility with Supabase's client
export const LAW_OPTIONS: LawOption[] = [
  { display: "Constituição Federal",         table: "constituicao_federal"      },
  { display: "Código Civil",                 table: "codigo_civil"              },
  { display: "Código Penal",                 table: "codigo_penal"              },
  { display: "Código de Processo Civil",     table: "codigo_processo_civil"     },
  { display: "Código de Processo Penal",     table: "codigo_processo_penal"     },
  { display: "Código de Defesa do Consumidor", table: "codigo_defesa_consumidor" },
  { display: "Código Tributário Nacional",   table: "codigo_tributario"         },
  { display: "Consolidação das Leis do Trabalho", table: "consolidacao_leis_trabalho" },
  { display: "Código de Trânsito Brasileiro", table: "codigo_transito"          }
];

/** Retorna apenas os nomes para popular um dropdown/menu */
export const fetchAvailableLaws = (): string[] =>
  LAW_OPTIONS.map((opt) => opt.display);

/** Busca o nome da tabela a partir do texto exibido */
function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table ?? null;
}

/** Logs a user action in the statistics table */
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
      const { error } = await supabase.from('user_statistics').insert({
        user_id: userId,
        action_type: actionType,
        law_name: lawName,
        article_number: articleNumber
      });

      if (error) {
        console.error('Error logging user action:', error);
      }
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
    conteudo: dbRow.artigo || dbRow.conteudo || "", // usa 'artigo' se existir, senão 'conteudo'
    explicacao_tecnica: dbRow["explicacao tecnica"] || undefined,
    explicacao_formal: dbRow["explicacao formal"] || undefined,
    exemplo1: dbRow.exemplo1 || undefined,
    exemplo2: dbRow.exemplo2 || undefined,
    created_at: dbRow.created_at
  };
}

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  let selectCols = "*";
  
  console.log(`Buscando artigos da tabela: ${tableName}`);
  await logUserAction('search', lawDisplayName);

  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select(selectCols)
      .order('id', { ascending: true }); // Add explicit ordering by ID

    if (error) {
      console.error("Erro ao buscar artigos:", error);
      throw new Error("Falha ao carregar artigos");
    }
    
    if (!data) {
      return [];
    }

    // Faz o mapeamento para o tipo Article
    return (data as any[]).map(mapRawArticle);
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
