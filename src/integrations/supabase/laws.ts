
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

// Define the tables using a string union type based on actual database tables
export type LawTableName = 
  | "constituicao_federal"
  | "codigo_civil"
  | "codigo_penal"
  | "codigo_processo_civil"
  | "codigo_processo_penal"
  | "codigo_defesa_consumidor"
  | "codigo_tributario"
  | "consolidacao_leis_trabalho"
  | "codigo_transito";

// Atualizando para incluir todas as leis disponíveis no banco
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
function getTableName(displayName: string): LawTableName | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table as LawTableName ?? null;
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
  
  // Use type assertion with 'as any' to bypass TypeScript's strict type checking
  // This is necessary because the dynamic table names don't match TypeScript's expectations
  const { data, error } = await (supabase
    .from(tableName as any)
    .select("*")
    .order("numero", { ascending: true }));

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

  // Use type assertion to bypass TypeScript's strict type checking
  const { data, error } = await (supabase
    .from(tableName as any)
    .select("*")
    .eq("numero", articleNumber)
    .maybeSingle());

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

  const term = searchTerm.toLowerCase();
  // Use type assertion to bypass TypeScript's strict type checking
  const { data, error } = await (supabase
    .from(tableName as any)
    .select("*")
    .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`));

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }
  
  if (!data) {
    return [];
  }

  return data as Article[];
};
