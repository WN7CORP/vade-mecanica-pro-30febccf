
import { supabase } from "@/lib/supabase";
import { Law, Article } from "@/types/law";

export const fetchAvailableLaws = async (): Promise<Law[]> => {
  const { data, error } = await supabase
    .from('leis')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Error fetching laws:', error);
    throw new Error('Falha ao carregar lista de legislações');
  }

  return data;
};

export const fetchLawArticles = async (lawId: number): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('lei_id', lawId)
    .order('numero');

  if (error) {
    console.error('Error fetching articles:', error);
    throw new Error('Falha ao carregar artigos');
  }

  return data;
};

export const searchArticles = async (
  lawId: number,
  searchTerm: string
): Promise<Article[]> => {
  const { data, error } = await supabase
    .from('artigos')
    .select('*')
    .eq('lei_id', lawId)
    .or(`numero.ilike.%${searchTerm}%,conteudo.ilike.%${searchTerm}%`)
    .order('numero');

  if (error) {
    console.error('Error searching articles:', error);
    throw new Error('Falha ao buscar artigos');
  }

  return data;
};
