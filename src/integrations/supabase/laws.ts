
import { supabase } from "@/integrations/supabase/client";

// Artigos agora buscam sempre os mesmos campos, respeitando os nomes das colunas de cada tabela.
export interface Article {
  id: number;
  numero: string;
  artigo?: string;
  conteudo?: string;
  titulo?: string;
  explicacao_tecnica?: string;
  explicacao_formal?: string;
  exemplo1?: string;
  exemplo2?: string;
  exemplo?: string;
  created_at: string;
}

export interface LawOption {
  display: string;
  table: string;
}

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

function getTableName(displayName: string): string | null {
  const found = LAW_OPTIONS.find(
    (opt) => opt.display.toLowerCase() === displayName.toLowerCase()
  );
  return found?.table ?? null;
}

async function logUserAction(
  actionType: 'search' | 'explain' | 'favorite' | 'note',
  lawName?: string,
  articleNumber?: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
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

// Busca padronizada para qualquer tabela
export const fetchLawArticles = async (
  lawDisplayName: string
): Promise<Article[]> => {
  const tableName = getTableName(lawDisplayName);
  if (!tableName) {
    console.error(`Lei inválida: "${lawDisplayName}"`);
    throw new Error(`Lei inválida: "${lawDisplayName}"`);
  }

  await logUserAction('search', lawDisplayName);

  let selectFields =
    "id, numero, artigo, conteudo, titulo, explicacao_tecnica, explicacao_formal, exemplo1, exemplo2, exemplo, created_at";

  // Para constituição federal, os nomes dos campos são diferentes em algumas colunas
  if (tableName === "constituicao_federal") {
    selectFields =
      "id, numero, artigo, titulo, \"explicacao tecnica\" as explicacao_tecnica, \"explicacao formal\" as explicacao_formal, exemplo1, exemplo2, created_at";
  }

  // Para outras tabelas, tentamos buscar tanto conteudo/artigo/exemplo e campos de explicação técnica/formal.
  const { data, error } = await supabase
    .from(tableName as any)
    .select(selectFields)
    .order("numero", { ascending: true });

  if (error) {
    console.error("Erro ao buscar artigos:", error);
    throw new Error("Falha ao carregar artigos");
  }

  // Padroniza para Article independentemente de campos ausentes
  return (
    data?.map((row: any) => ({
      id: row.id,
      numero: row.numero,
      artigo: row.artigo,
      conteudo: row.conteudo,
      titulo: row.titulo,
      explicacao_tecnica: row.explicacao_tecnica,
      explicacao_formal: row.explicacao_formal,
      exemplo1: row.exemplo1,
      exemplo2: row.exemplo2,
      exemplo: row.exemplo,
      created_at: row.created_at,
    })) || []
  );
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

  let selectFields =
    "id, numero, artigo, conteudo, titulo, explicacao_tecnica, explicacao_formal, exemplo1, exemplo2, exemplo, created_at";
  if (tableName === "constituicao_federal") {
    selectFields =
      "id, numero, artigo, titulo, \"explicacao tecnica\" as explicacao_tecnica, \"explicacao formal\" as explicacao_formal, exemplo1, exemplo2, created_at";
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select(selectFields)
    .eq("numero", articleNumber)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar artigo:", error);
    return null;
  }

  return data
    ? {
        id: data.id,
        numero: data.numero,
        artigo: data.artigo,
        conteudo: data.conteudo,
        titulo: data.titulo,
        explicacao_tecnica: data.explicacao_tecnica,
        explicacao_formal: data.explicacao_formal,
        exemplo1: data.exemplo1,
        exemplo2: data.exemplo2,
        exemplo: data.exemplo,
        created_at: data.created_at,
      }
    : null;
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

  const term = searchTerm.toLowerCase();
  let selectFields =
    "id, numero, artigo, conteudo, titulo, explicacao_tecnica, explicacao_formal, exemplo1, exemplo2, exemplo, created_at";
  if (tableName === "constituicao_federal") {
    selectFields =
      "id, numero, artigo, titulo, \"explicacao tecnica\" as explicacao_tecnica, \"explicacao formal\" as explicacao_formal, exemplo1, exemplo2, created_at";
  }

  const { data, error } = await supabase
    .from(tableName as any)
    .select(selectFields)
    .or(`numero.ilike.%${term}%,artigo.ilike.%${term}%,conteudo.ilike.%${term}%`);

  if (error) {
    console.error("Erro na busca por termo:", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      numero: row.numero,
      artigo: row.artigo,
      conteudo: row.conteudo,
      titulo: row.titulo,
      explicacao_tecnica: row.explicacao_tecnica,
      explicacao_formal: row.explicacao_formal,
      exemplo1: row.exemplo1,
      exemplo2: row.exemplo2,
      exemplo: row.exemplo,
      created_at: row.created_at,
    })) || []
  );
};

export const fetchAvailableLaws = (): string[] =>
  LAW_OPTIONS.map((opt) => opt.display);

