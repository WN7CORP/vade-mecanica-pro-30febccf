
export interface Law {
  id: number;
  nome: string;
  created_at: string;
}

export interface Article {
  id: number;
  lei_id: number;
  numero: string;
  conteudo: string;
  created_at: string;
}
