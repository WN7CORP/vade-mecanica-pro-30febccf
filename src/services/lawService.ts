
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

async function getValidTables(): Promise<string[]> {
  try {
    // Use a raw query to get all tables in the public schema since the typed client
    // doesn't support querying system tables directly
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_all_tables', {}) as unknown as { 
        data: { tablename: string }[], 
        error: any 
      };

    if (tablesError || !tables) {
      console.error('Error fetching tables:', tablesError);
      return [];
    }

    // Validate each table's structure
    const validTables = [];
    for (const { tablename } of tables) {
      // Skip system tables and tables that don't match our naming convention
      if (tablename.startsWith('pg_') || tablename.includes('information_schema')) {
        continue;
      }

      // Instead of querying schema, try to get a sample row to check structure
      const { data: sample, error: sampleError } = await supabase
        .from(tablename)
        .select('numero, conteudo, exemplo, id, created_at')
        .limit(1) as any;

      if (sampleError) {
        console.error(`Error checking table ${tablename}:`, sampleError);
        continue;
      }

      // If we can query these columns, the table has the right structure
      validTables.push(tablename);
    }

    return validTables;
  } catch (error) {
    console.error('Error in getValidTables:', error);
    return [];
  }
}

// Fallback function to get valid tables if RPC method is not available
async function getValidTablesSimple(): Promise<string[]> {
  try {
    // Try to query the constituição_federal table as a known reference
    const { data: test } = await supabase
      .from('constituição_federal')
      .select('id')
      .limit(1);
    
    // If we can query it, return it
    if (test) {
      return ['constituição_federal'];
    }
    return [];
  } catch (error) {
    console.error('Error in getValidTablesSimple:', error);
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
    // Use type assertion to bypass TypeScript's strict typing
    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .order('numero') as any;

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    if (!data) return [];
    
    return data.map((item: any) => ({
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
    // Use type assertion to bypass TypeScript's strict typing
    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .eq('numero', articleNumber)
      .maybeSingle() as any;

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

    // Use type assertion to bypass TypeScript's strict typing
    const { data, error } = await supabase
      .from(lawName)
      .select('numero, conteudo, exemplo')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`) as any;

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    if (!data) return [];

    return data.map((item: any) => ({
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
  // Try to use the function to get tables, if it fails, use the simple method
  try {
    // First try to use RPC
    const tables = await getValidTables();
    if (tables.length > 0) {
      return tables.map(convertTableNameToDisplay);
    }
    
    // If that fails, use simple method
    const simpleTables = await getValidTablesSimple();
    return simpleTables.map(convertTableNameToDisplay);
  } catch (error) {
    console.error('Error fetching available laws:', error);
    // Return at least the known table as fallback
    return ['Constituição Federal'];
  }
};

// We need to create this RPC function in Supabase
const createGetAllTablesFunction = async () => {
  // This is just a reference of the SQL to create in Supabase if needed
  // Not executed here - just for documentation
  const sql = `
  CREATE OR REPLACE FUNCTION get_all_tables()
  RETURNS TABLE(tablename text) 
  SECURITY DEFINER 
  AS $$
  BEGIN
    RETURN QUERY SELECT table_name::text FROM information_schema.tables 
    WHERE table_schema = 'public';
  END;
  $$ LANGUAGE plpgsql;
  `;
  console.log('SQL to create in Supabase:', sql);
};
