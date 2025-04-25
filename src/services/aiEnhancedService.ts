
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";

// API Key do Google Gemini
const API_KEY = "AIzaSyCIQSUR9Mhy6rT1DgaszVxc5rL-gmVYGK0";

// Inicializar a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Tipos para funções e respostas
export interface AIArticleSummary {
  title: string;
  summary: string;
  keyPoints: string[];
  relatedArticles?: string[];
}

export interface AILegalResearch {
  findings: string;
  relevantLaws: string[];
  caseReferences: string[];
  analysis: string;
}

export interface StudyPlan {
  topics: {
    name: string;
    articles: string[];
    priority: 'alta' | 'média' | 'baixa';
    estimatedTime: string;
  }[];
  totalStudyTime: string;
  recommendedOrder: string[];
}

/**
 * Gera um resumo inteligente de um artigo jurídico
 */
export const generateArticleSummary = async (
  articleNumber: string,
  articleContent: string,
  lawName: string
): Promise<AIArticleSummary> => {
  try {
    const prompt = `
      Como especialista jurídico, analise o seguinte artigo e forneça:
      1. Um título resumido e descritivo
      2. Um resumo conciso em linguagem clara
      3. Os principais pontos jurídicos (máximo 3)
      4. Se possível, mencione artigos relacionados

      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
      
      Responda apenas no seguinte formato JSON:
      {
        "title": "Título descritivo",
        "summary": "Resumo conciso",
        "keyPoints": ["Ponto 1", "Ponto 2", "Ponto 3"],
        "relatedArticles": ["Art. X", "Art. Y"]
      }
    `;

    console.log("Enviando requisição para o Gemini - resumo de artigo");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Extrair o JSON da resposta
    const jsonMatch = textResponse.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    return {
      title: jsonResponse.title || "Resumo do Artigo",
      summary: jsonResponse.summary || "Resumo não disponível",
      keyPoints: jsonResponse.keyPoints || [],
      relatedArticles: jsonResponse.relatedArticles || []
    };
  } catch (error) {
    console.error("Erro ao gerar resumo inteligente:", error);
    toast({
      title: "Erro ao gerar resumo",
      description: "Não foi possível processar o resumo do artigo.",
      variant: "destructive"
    });
    
    return {
      title: "Resumo não disponível",
      summary: "Ocorreu um erro ao processar este artigo.",
      keyPoints: ["Não foi possível analisar o conteúdo"],
    };
  }
};

/**
 * Realiza pesquisa jurídica avançada com base em um tema
 */
export const performLegalResearch = async (
  topic: string,
  context?: string
): Promise<AILegalResearch> => {
  try {
    const prompt = `
      Como pesquisador jurídico, analise o seguinte tema:
      "${topic}"
      ${context ? `Contexto adicional: ${context}` : ''}
      
      Forneça uma análise jurídica completa com:
      1. Principais achados sobre o tema
      2. Leis e dispositivos legais relevantes
      3. Referências a jurisprudência importante
      4. Uma breve análise jurídica
      
      Responda apenas no seguinte formato JSON:
      {
        "findings": "Achados principais",
        "relevantLaws": ["Lei 1", "Lei 2", "Lei 3"],
        "caseReferences": ["Caso 1", "Caso 2"],
        "analysis": "Análise jurídica"
      }
    `;

    console.log("Enviando requisição para o Gemini - pesquisa jurídica");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    const jsonMatch = textResponse.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    return {
      findings: jsonResponse.findings || "Análise não disponível",
      relevantLaws: jsonResponse.relevantLaws || [],
      caseReferences: jsonResponse.caseReferences || [],
      analysis: jsonResponse.analysis || "Análise não disponível"
    };
  } catch (error) {
    console.error("Erro na pesquisa jurídica:", error);
    toast({
      title: "Erro na pesquisa jurídica",
      description: "Não foi possível completar a pesquisa solicitada.",
      variant: "destructive"
    });
    
    return {
      findings: "Não foi possível realizar a pesquisa",
      relevantLaws: [],
      caseReferences: [],
      analysis: "Ocorreu um erro ao processar esta pesquisa."
    };
  }
};

/**
 * Gera um plano de estudos personalizado com base nos artigos
 */
export const generateStudyPlan = async (
  lawName: string,
  articleNumbers: string[],
  timeAvailable: string,
  focusArea?: string
): Promise<StudyPlan> => {
  try {
    const prompt = `
      Como especialista em metodologia de estudos jurídicos, crie um plano de estudos para:
      Lei: ${lawName}
      Artigos: ${articleNumbers.join(', ')}
      Tempo disponível: ${timeAvailable}
      ${focusArea ? `Área de foco: ${focusArea}` : ''}
      
      Forneça um plano de estudos com:
      1. Lista de tópicos a estudar com respectivos artigos e prioridade
      2. Tempo estimado para cada tópico
      3. Tempo total de estudo
      4. Ordem recomendada de estudo
      
      Responda apenas no seguinte formato JSON:
      {
        "topics": [
          {
            "name": "Nome do tópico",
            "articles": ["Art. X", "Art. Y"],
            "priority": "alta|média|baixa",
            "estimatedTime": "X minutos/horas"
          }
        ],
        "totalStudyTime": "X horas",
        "recommendedOrder": ["Tópico 1", "Tópico 2"]
      }
    `;

    console.log("Enviando requisição para o Gemini - plano de estudos");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    const jsonMatch = textResponse.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    return {
      topics: jsonResponse.topics || [],
      totalStudyTime: jsonResponse.totalStudyTime || "Tempo não estimado",
      recommendedOrder: jsonResponse.recommendedOrder || []
    };
  } catch (error) {
    console.error("Erro ao gerar plano de estudos:", error);
    toast({
      title: "Erro no plano de estudos",
      description: "Não foi possível gerar o plano de estudos solicitado.",
      variant: "destructive"
    });
    
    return {
      topics: [],
      totalStudyTime: "Não disponível",
      recommendedOrder: []
    };
  }
};

/**
 * Analisa correlações entre artigos e explica suas interconexões
 */
export const analyzeCorrelations = async (
  articleNumbers: string[],
  articleContents: string[],
  lawName: string
): Promise<{correlations: string, matrix: Record<string, string[]>}> => {
  try {
    const articlesText = articleNumbers.map((num, i) => 
      `Artigo ${num}: ${articleContents[i]}`
    ).join('\n\n');
    
    const prompt = `
      Como especialista em análise jurídica, analise as correlações entre os seguintes artigos:
      
      Lei: ${lawName}
      ${articlesText}
      
      Forneça:
      1. Uma explicação das correlações e interconexões entre os artigos
      2. Uma matriz mostrando como cada artigo se relaciona com os demais
      
      Responda apenas no seguinte formato JSON:
      {
        "correlations": "Explicação das correlações",
        "matrix": {
          "Art. X": ["Art. Y - explicação da relação", "Art. Z - explicação da relação"],
          "Art. Y": ["Art. X - explicação da relação"]
        }
      }
    `;

    console.log("Enviando requisição para o Gemini - análise de correlações");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    const jsonMatch = textResponse.match(/({[\s\S]*})/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    return {
      correlations: jsonResponse.correlations || "Análise não disponível",
      matrix: jsonResponse.matrix || {}
    };
  } catch (error) {
    console.error("Erro na análise de correlações:", error);
    toast({
      title: "Erro na análise",
      description: "Não foi possível analisar as correlações entre os artigos.",
      variant: "destructive"
    });
    
    return {
      correlations: "Não foi possível realizar a análise de correlações",
      matrix: {}
    };
  }
};

/**
 * Gera um glossário jurídico com termos técnicos encontrados no texto
 */
export const generateLegalGlossary = async (
  content: string
): Promise<{term: string, definition: string}[]> => {
  try {
    const prompt = `
      Como lexicógrafo jurídico, analise o seguinte texto legal e extraia os termos técnicos:
      
      "${content.substring(0, 3000)}" ${content.length > 3000 ? '... (texto truncado)' : ''}
      
      Crie um glossário com os termos técnicos encontrados e suas definições.
      Limite-se aos 10 termos mais importantes ou complexos.
      
      Responda apenas no seguinte formato JSON:
      [
        {
          "term": "Termo técnico",
          "definition": "Definição clara e precisa"
        }
      ]
    `;

    console.log("Enviando requisição para o Gemini - glossário jurídico");
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Extrair apenas o JSON da resposta
    const jsonMatch = textResponse.match(/(\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error("Formato de resposta inválido");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Erro ao gerar glossário:", error);
    toast({
      title: "Erro no glossário",
      description: "Não foi possível gerar o glossário jurídico.",
      variant: "destructive"
    });
    
    return [];
  }
};
