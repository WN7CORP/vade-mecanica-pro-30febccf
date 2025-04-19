
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

async function getValidTables(): Promise<string[]> {
  try {
    // Fetch all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError || !tables) {
      console.error('Error fetching tables:', tablesError);
      return [];
    }

    // Validate each table's structure
    const validTables = [];
    for (const { tablename } of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', tablename);

      if (columnsError || !columns) continue;

      // Check if table has required columns with correct types
      const hasRequiredStructure = columns.every(col => {
        const required = {
          exemplo: 'text',
          numero: 'text',
          id: 'bigint',
          conteudo: 'text',
          created_at: 'timestamp with time zone'
        };
        return required[col.column_name] === col.data_type;
      });

      if (hasRequiredStructure) {
        validTables.push(tablename);
      }
    }

    return validTables;
  } catch (error) {
    console.error('Error in getValidTables:', error);
    return [];
  }
}

function convertTableNameToDisplay(tableName: string): string {
  // Convert snake_case to Title Case
  return tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .order('numero');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    if (!data) return [];
    
    return data.map(item => ({
      numero: String(item.numero || ''),
      conteudo: String(item.conteudo || ''),
      exemplo: item.exemplo ? String(item.exemplo) : undefined
    }));
  } catch (error) {
    console.error('Error in fetchLawArticles:', error);
    throw new Error('Falha ao carregar artigos');
  }
};

export const searchArticle = async (
  lawName: string,
  articleNumber: string
): Promise<Article | null> => {
  try {
    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .eq('numero', articleNumber)
      .maybeSingle();

    if (error || !data) {
      console.error('Error searching article:', error);
      return null;
    }

    return {
      numero: String(data.numero || ''),
      conteudo: String(data.conteudo || ''),
      exemplo: data.exemplo ? String(data.exemplo) : undefined
    };
  } catch (error) {
    console.error('Error in searchArticle:', error);
    return null;
  }
};

export const searchByTerm = async (
  lawName: string,
  searchTerm: string
): Promise<Article[]> => {
  try {
    const term = searchTerm.toLowerCase();

    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    if (!data) return [];

    return data.map(item => ({
      numero: String(item.numero || ''),
      conteudo: String(item.conteudo || ''),
      exemplo: item.exemplo ? String(item.exemplo) : undefined
    }));
  } catch (error) {
    console.error('Error in searchByTerm:', error);
    return [];
  }
};

export const fetchAvailableLaws = async (): Promise<string[]> => {
  const validTables = await getValidTables();
  return validTables.map(convertTableNameToDisplay);
};

