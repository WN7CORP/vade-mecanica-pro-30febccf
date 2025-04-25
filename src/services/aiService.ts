import { GoogleGenerativeAI } from "@google/generative-ai";

// API key para Gemini (atualizada)
const API_KEY = "AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0";

// Inicializar a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIExplanation {
  summary: string;
  detailed: string;
  examples: string[];
}

const generateGeminiExplanation = async (prompt: string) => {
  try {
    console.log("Enviando requisição para API do Gemini...");
    
    // Formato correto conforme documentação da SDK
    const result = await model.generateContent(prompt);
    
    const text = result.response.text();
    
    console.log("Resposta recebida do Gemini:", text.substring(0, 150) + "...");
    return text;
  } catch (error) {
    console.error("Erro ao gerar explicação com Gemini:", error);
    throw error;
  }
}

const checkForExplanation = (content: any, type: 'technical' | 'formal'): string | null => {
  if (!content || typeof content !== 'object') {
    return null;
  }

  // Try different possible column names
  const possibleKeys = type === 'technical' 
    ? ['explicacao_tecnica', 'explicacao tecnica', 'explicacao-tecnica'] 
    : ['explicacao_formal', 'explicacao formal', 'explicacao-formal'];

  for (const key of possibleKeys) {
    if (key in content && content[key]) {
      return content[key];
    }
  }

  // If the content has nested properties, try to find the explanation there
  for (const prop in content) {
    if (typeof content[prop] === 'object') {
      const nestedResult = checkForExplanation(content[prop], type);
      if (nestedResult) {
        return nestedResult;
      }
    }
  }

  return null;
};

export const generateArticleExplanation = async (
  articleNumber: string,
  articleContent: string,
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    // First check if we have a pre-existing explanation
    const existingExplanation = checkForExplanation(
      typeof articleContent === 'string' ? JSON.parse(articleContent) : articleContent,
      type
    );

    if (existingExplanation) {
      // Parse the existing explanation into our required format
      const sections = existingExplanation.split(/\n\n|\n(?=\d\.)/);
      return {
        summary: sections[0] || "Resumo não disponível",
        detailed: sections[1] || existingExplanation,
        examples: sections.slice(2).map(s => s.trim()).filter(Boolean)
      };
    }

    // If no pre-existing explanation, generate one using AI
    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados. Estruture sua resposta em três partes: 1) Um resumo conciso, 2) Uma explicação detalhada, 3) Três exemplos práticos:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos. Estruture sua resposta em três partes: 1) Um resumo conciso em linguagem simples, 2) Uma explicação detalhada usando termos cotidianos, 3) Três exemplos práticos do dia a dia:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
    `;

    const response = await generateGeminiExplanation(prompt);
    
    // Split and process the response
    const sections = response.split(/\n\n|\n(?=\d\.)|(?:Resumo:)|(?:Explicação detalhada:)|(?:Exemplos práticos)/i)
      .filter(section => section && section.trim().length > 0);

    return {
      summary: sections[0]?.replace(/^.*?resumo:?\s*/i, "").trim() || "Resumo não disponível",
      detailed: sections[1]?.replace(/^.*?explicação:?\s*/i, "").trim() || sections[0] || "Explicação detalhada não disponível",
      examples: sections.slice(2)
        .map(s => s.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3) || ["Exemplo prático não disponível"]
    };
  } catch (error) {
    console.error("Erro ao gerar explicação:", error);
    // Return a user-friendly error response
    return {
      summary: "Não foi possível gerar o resumo no momento. Por favor, tente novamente mais tarde.",
      detailed: "Ocorreu um erro ao processar a explicação detalhada. Nossa equipe foi notificada e está trabalhando para resolver o problema.",
      examples: ["Exemplos temporariamente indisponíveis devido a um erro técnico."]
    };
  }
};

export const askAIQuestion = async (
  question: string,
  articleNumber: string,
  articleContent: string,
  lawName: string
): Promise<string> => {
  try {
    const prompt = `
      Como especialista jurídico, responda à seguinte dúvida sobre este artigo:
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
      
      Dúvida: ${question}
      
      Responda de forma clara, precisa e com base na legislação citada.
    `;

    // Formato correto para a SDK
    const result = await model.generateContent(prompt);
    
    return result.response.text();
  } catch (error) {
    console.error("Erro ao processar pergunta:", error);
    return "Desculpe, não foi possível processar sua pergunta no momento. Por favor, tente novamente mais tarde.";
  }
};

export const generateArticleNotes = async (
  articleContent: string,
  lawName: string
): Promise<{title: string, summary: string}> => {
  try {
    const prompt = `
      Com base no seguinte artigo jurídico, gere um título descritivo conciso e um breve resumo:
      
      Lei: ${lawName}
      Artigo: ${articleContent}
      
      Retorne apenas:
      Título: [título descritivo]
      Resumo: [resumo conciso]
    `;

    // Formato correto para a SDK
    const result = await model.generateContent(prompt);
    
    const response = result.response.text();
    
    const titleMatch = response.match(/Título:\s*(.*?)(?:\n|$)/);
    const summaryMatch = response.match(/Resumo:\s*(.*?)(?:\n|$)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : "Título não disponível",
      summary: summaryMatch ? summaryMatch[1].trim() : "Resumo não disponível"
    };
  } catch (error) {
    console.error("Erro ao gerar notas:", error);
    return {
      title: "Título não disponível",
      summary: "Resumo não disponível"
    };
  }
};
