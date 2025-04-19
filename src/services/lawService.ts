
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

// Function to get table names from the Supabase database
async function getValidTables(): Promise<string[]> {
  try {
    // Use a simple client.rpc call instead of trying to query system tables
    const { data, error } = await supabase.rpc('get_tables') as unknown as { 
      data: string[], 
      error: any 
    };

    if (error) {
      console.error('Error fetching tables:', error);
      // If the RPC fails, fall back to a known table
      return ['constituição_federal'];
    }

    if (!data || !Array.isArray(data)) {
      console.warn('Unexpected response format from get_tables RPC');
      return ['constituição_federal'];
    }

    // Filter out system tables and tables that don't match our naming convention
    const filteredTables = data.filter(tableName => {
      return !tableName.startsWith('pg_') && !tableName.includes('information_schema');
    });

    return filteredTables.length > 0 ? filteredTables : ['constituição_federal'];
  } catch (error) {
    console.error('Error in getValidTables:', error);
    return ['constituição_federal'];
  }
}

// Fallback function to get a simple list of known tables
async function getValidTablesSimple(): Promise<string[]> {
  return ['constituição_federal'];
}

function convertTableNameToDisplay(tableName: string): string {
  // Convert snake_case to Title Case
  return tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to handle dynamic table queries safely
async function queryTable<T>(
  tableName: string, 
  queryBuilder: (table: any) => any
): Promise<T[]> {
  try {
    // Use type assertion to bypass TypeScript's strict typing
    const query = queryBuilder(supabase.from(tableName) as any);
    const { data, error } = await query;

    if (error) {
      console.error(`Error querying table ${tableName}:`, error);
      return [];
    }

    return (data || []) as T[];
  } catch (error) {
    console.error(`Error in queryTable for ${tableName}:`, error);
    return [];
  }
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    const articles = await queryTable<Article>(
      lawName,
      (table) => table.select('numero, conteudo, exemplo').order('numero')
    );
    
    return articles.map(item => ({
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
    const articles = await queryTable<Article>(
      lawName,
      (table) => table.select('numero, conteudo, exemplo').eq('numero', articleNumber).limit(1)
    );

    if (!articles || articles.length === 0) {
      return null;
    }

    const article = articles[0];
    return {
      numero: String(article.numero || ''),
      conteudo: String(article.conteudo || ''),
      exemplo: article.exemplo ? String(article.exemplo) : undefined
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
    
    const articles = await queryTable<Article>(
      lawName,
      (table) => table.select('numero, conteudo, exemplo')
        .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`)
    );

    return articles.map(item => ({
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
  try {
    // First try to use the function to get tables
    const tables = await getValidTables();
    
    // Convert table names to display format
    return tables.map(convertTableNameToDisplay);
  } catch (error) {
    console.error('Error fetching available laws:', error);
    
    // Return fallback if everything fails
    const fallbackTables = await getValidTablesSimple();
    return fallbackTables.map(convertTableNameToDisplay);
  }
};

// Create a RPC function in the Supabase database to get all tables
// This is just a reference - needs to be created in Supabase SQL editor
const createGetTablesFunction = `
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE(tablename text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT table_name::text 
  FROM information_schema.tables 
  WHERE table_schema = 'public';
END;
$$;
`;
