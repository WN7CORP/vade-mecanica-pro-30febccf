
import { supabase } from "@/integrations/supabase/client";

interface Article {
  numero: string;
  conteudo: string;
  exemplo?: string;
}

export const fetchLawArticles = async (lawName: string): Promise<Article[]> => {
  try {
    // Convert law name to table name format
    const tableName = lawName.toLowerCase().replace(/ /g, '_');
    
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
    const tableName = lawName.toLowerCase().replace(/ /g, '_');
    
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
    const tableName = lawName.toLowerCase().replace(/ /g, '_');
    const term = searchTerm.toLowerCase();
    
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
