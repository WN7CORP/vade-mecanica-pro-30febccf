import { GoogleGenerativeAI } from "@google/generative-ai";

// API key for Gemini
const API_KEY = "AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0";

// Initialize the Gemini API
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
    
    // Use the SDK method instead of fetch
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Resposta recebida do Gemini:", text.substring(0, 150) + "...");
    return text;
  } catch (error) {
    console.error("Erro ao gerar explicação com Gemini:", error);
    throw error;
  }
}

export const generateArticleExplanation = async (
  articleNumber: string,
  articleContent: string,
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    console.log(`Gerando explicação ${type} para artigo ${articleNumber} da lei ${lawName}`);
    
    if (!articleNumber || !articleContent || !lawName) {
      console.error("Argumentos inválidos:", { articleNumber, articleContent: articleContent?.substring(0, 20), lawName });
      throw new Error("Argumentos inválidos para gerar explicação");
    }
    
    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados. Estruture sua resposta em três partes: 1) Um resumo conciso, 2) Uma explicação detalhada, 3) Três exemplos práticos:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos. Estruture sua resposta em três partes: 1) Um resumo conciso em linguagem simples, 2) Uma explicação detalhada usando termos cotidianos, 3) Três exemplos práticos do dia a dia:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
    `;

    console.log("Enviando prompt para Gemini:", prompt.substring(0, 150) + "...");
    const response = await generateGeminiExplanation(prompt);
    console.log("Resposta bruta recebida do Gemini:", response.substring(0, 150) + "...");
    
    // Split the response into sections based on patterns
    const sections = response.split(/\n\n|\n(?=\d\.)|(?:Resumo:)|(?:Explicação detalhada:)|(?:Exemplos práticos)/i);
    console.log(`Processando ${sections.length} seções da resposta`);
    
    // Filter out empty sections
    const filteredSections = sections.filter(section => section && section.trim().length > 0);
    console.log("Seções filtradas:", filteredSections.length);
    
    // Now we'll try to identify the summary, detailed explanation, and examples
    let summary = "";
    let detailed = "";
    let examples: string[] = [];
    
    if (filteredSections.length >= 3) {
      // Try to extract the summary (should be the first meaningful section)
      summary = filteredSections[0].replace(/^.*?resumo:?\s*/i, "").trim();
      
      // Try to extract the detailed explanation (should be the second meaningful section)
      detailed = filteredSections[1].replace(/^.*?explicação:?\s*/i, "").trim();
      
      // Try to extract examples (everything after that, or split by numbers)
      const examplesText = filteredSections.slice(2).join("\n\n");
      const exampleMatches = examplesText.match(/\d+\..*?(?=\d+\.|$)/gs) || [];
      
      examples = exampleMatches.length > 0 
        ? exampleMatches.map(e => e.replace(/^\d+\.\s*/, "").trim())
        : [examplesText.trim()];
      
      // Ensure we have at least 3 examples
      while (examples.length < 3) {
        examples.push("Exemplo prático não disponível");
      }
    } else if (filteredSections.length === 2) {
      summary = filteredSections[0].trim();
      detailed = filteredSections[1].trim();
      examples = ["Exemplo prático não disponível", "Exemplo prático não disponível", "Exemplo prático não disponível"];
    } else if (filteredSections.length === 1) {
      // Try to split the single section into meaningful parts
      const text = filteredSections[0].trim();
      const parts = text.split(/\n\n/); 
      
      if (parts.length >= 3) {
        summary = parts[0];
        detailed = parts[1];
        examples = [parts[2], parts[3] || "Exemplo adicional não disponível", parts[4] || "Exemplo adicional não disponível"];
      } else {
        // If all else fails, use the entire text as an explanation
        summary = "Resumo da explicação";
        detailed = text;
        examples = ["Exemplo prático não disponível", "Exemplo prático não disponível", "Exemplo prático não disponível"];
      }
    }
    
    // Ensure we have at least something for each section
    if (!summary || summary.length < 10) summary = "Não foi possível extrair um resumo claro da explicação.";
    if (!detailed || detailed.length < 10) detailed = "Não foi possível extrair uma explicação detalhada.";
    if (examples.length === 0) examples = ["Não foi possível extrair exemplos claros."];
    
    console.log("Extração concluída:", {
      summaryLength: summary.length,
      detailedLength: detailed.length,
      examplesCount: examples.length
    });
    
    const result = {
      summary,
      detailed,
      examples
    };
    
    console.log("Explicação processada com sucesso");
    return result;
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
