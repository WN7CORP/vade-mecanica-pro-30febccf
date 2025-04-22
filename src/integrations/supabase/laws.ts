import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: number;
  numero: string;
  conteudo: string;
  exemplo?: string;
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
    const { error } = await supabase.from('user_statistics').insert({
      action_type: actionType,
      law_name: lawName,
      article_number: articleNumber
    });

    if (error) {
      console.error('Error logging user action:', error);
    }
  } catch (err) {
    console.error('Failed to log user action:', err);
  }
}

export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  console.log(`Buscando artigos da tabela: ${tableName}`);
  
  // Log the search action
  await logUserAction('search', lawDisplayName);
  
  // Use type assertion to bypass TypeScript's type checking
  // since we've already validated the table name exists
  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .order("numero", { ascending: true });

  if (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }
  
  if (!data) {
    return [];
  }

  return data as Article[];
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

  // Log the search action
  await logUserAction('search', lawDisplayName, articleNumber);

  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .eq("numero", articleNumber)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }
  
  return data as Article | null;
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

  // Log the search action
  await logUserAction('search', lawDisplayName);

  const term = searchTerm.toLowerCase();
  const { data, error } = await supabase
    .from(tableName as any)
    .select("*")
    .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
  
  if (!data) {
    return [];
  }

  return data as Article[];
};
