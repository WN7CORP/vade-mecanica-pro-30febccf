import { GoogleGenerativeAI } from "@google/generative-ai";

// Atualizar a chave da API para uma chave válida
const API_KEY = "AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0";

// Inicializar a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1-pro" });

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

  // Try different possible column names with correct spacing
  const possibleKeys = type === 'technical' 
    ? ['explicacao tecnica', 'explicacao_tecnica', 'explicacao-tecnica'] 
    : ['explicacao formal', 'explicacao_formal', 'explicacao-formal'];

  // First try direct access with space in column name
  const spaceKey = type === 'technical' ? 'explicacao tecnica' : 'explicacao formal';
  if (content[spaceKey]) {
    return content[spaceKey];
  }

  // Then try other variations
  for (const key of possibleKeys) {
    if (key in content && content[key]) {
      return content[key];
    }
  }

  // If content has nested properties, try to find the explanation there
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
  articleContent: string | { [key: string]: any },
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    console.log("Iniciando geração de explicação...");
    console.log(`Tipo: ${type}, Lei: ${lawName}, Artigo: ${articleNumber}`);
    
    // Handle when content is an object
    const content = typeof articleContent === 'object' 
      ? articleContent.conteudo || articleContent.artigo
      : articleContent;

    // Check for existing explanation in the content
    if (typeof articleContent === 'object') {
      const existingExplanation = type === 'technical' 
        ? articleContent['explicacao_tecnica'] || articleContent['explicacao tecnica']
        : articleContent['explicacao_formal'] || articleContent['explicacao formal'];

      if (existingExplanation) {
        console.log("Usando explicação existente do banco de dados");
        return {
          summary: existingExplanation.substring(0, 200) + "...",
          detailed: existingExplanation,
          examples: [existingExplanation]
        };
      }
    }

    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados. Estruture sua resposta em três partes: 1) Um resumo conciso, 2) Uma explicação detalhada, 3) Três exemplos práticos:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos. Estruture sua resposta em três partes: 1) Um resumo conciso em linguagem simples, 2) Uma explicação detalhada usando termos cotidianos, 3) Três exemplos práticos do dia a dia:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${content}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("Resposta do Gemini recebida:", text.substring(0, 150) + "...");
    
    const sections = text.split(/\n\n|\n(?=\d\.)/);
    
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
    throw error;
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
