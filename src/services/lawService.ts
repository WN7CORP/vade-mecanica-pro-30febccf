
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

const validTables = [
  'codigo_civil',
  'codigo_penal',
  'codigo_processo_civil',
  'codigo_processo_penal',
  'Constituição Federal'
];

function convertToTableName(lawName: string): string {
  const nameMap: Record<string, string> = {
    'constituição federal': 'Constituição Federal',
    'código civil': 'codigo_civil',
    'código penal': 'codigo_penal',
    'código de processo civil': 'codigo_processo_civil',
    'código de processo penal': 'codigo_processo_penal'
  };
  
  const normalized = lawName.toLowerCase().trim();
  return nameMap[normalized] || normalized;
}

function isValidTable(tableName: string): boolean {
  return validTables.includes(tableName);
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    if (tableName === 'Constituição Federal') {
      const { data, error } = await supabase
        .from(tableName)
        .select('numero:"Número do artigo", conteudo, exemplo')
        .order('Número do artigo');

      if (error) {
        console.error('Error fetching articles:', error);
        throw new Error('Falha ao carregar artigos');
      }

      return (data || []).map(item => ({
        numero: item.numero,
        conteudo: item.conteudo || '',
        exemplo: item.exemplo
      }));
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('numero, conteudo, exemplo')
      .order('numero');

    if (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Falha ao carregar artigos');
    }

    return data || [];
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
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return null;
    }
    
    if (tableName === 'Constituição Federal') {
      const { data, error } = await supabase
        .from(tableName)
        .select('numero:"Número do artigo", conteudo, exemplo')
        .eq('Número do artigo', articleNumber)
        .single();

      if (error) {
        console.error('Error searching article:', error);
        return null;
      }

      return {
        numero: data.numero,
        conteudo: data.conteudo || '',
        exemplo: data.exemplo
      };
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .select('numero, conteudo, exemplo')
      .eq('numero', articleNumber)
      .single();

    if (error) {
      console.error('Error searching article:', error);
      return null;
    }

    return data;
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
    const tableName = convertToTableName(lawName);
    
    if (!isValidTable(tableName)) {
      console.error(`Invalid table name: ${tableName}`);
      return [];
    }
    
    const term = searchTerm.toLowerCase();

    if (tableName === 'Constituição Federal') {
      const { data, error } = await supabase
        .from(tableName)
        .select('numero:"Número do artigo", conteudo, exemplo')
        .or(`"Número do artigo".ilike.%${term}%,conteudo.ilike.%${term}%`);

      if (error) {
        console.error('Error searching by term:', error);
        return [];
      }

      return (data || []).map(item => ({
        numero: item.numero,
        conteudo: item.conteudo || '',
        exemplo: item.exemplo
      }));
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .select('numero, conteudo, exemplo')
      .or(`numero.ilike.%${term}%,conteudo.ilike.%${term}%`);

    if (error) {
      console.error('Error searching by term:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchByTerm:', error);
    return [];
  }
};

export const fetchAvailableLaws = async (): Promise<string[]> => {
  return [
    'Constituição Federal',
    'Código Civil',
    'Código Penal',
    'Código de Processo Civil',
    'Código de Processo Penal'
  ];
};
