import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8";

// Inicializa a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIExplanation {
  summary: string;
  detailed: string;
  examples: string[];
}

const generateGeminiExplanation = async (prompt: string) => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Erro ao gerar explicação com Gemini:", error);
    return "Não foi possível gerar a explicação no momento.";
  }
}

export const generateArticleExplanation = async (
  articleNumber: string,
  articleContent: string,
  lawName: string,
  type: 'technical' | 'formal' = 'technical'
): Promise<AIExplanation> => {
  try {
    const prompt = `
      ${type === 'technical' 
        ? 'Explique o seguinte artigo jurídico de forma técnica e detalhada, mantendo a linguagem formal e os termos técnicos apropriados. Estruture sua resposta em três partes: 1) Um resumo conciso, 2) Uma explicação detalhada, 3) Três exemplos práticos:'
        : 'Explique o seguinte artigo jurídico de forma clara e acessível, usando linguagem simples e exemplos práticos. Estruture sua resposta em três partes: 1) Um resumo conciso em linguagem simples, 2) Uma explicação detalhada usando termos cotidianos, 3) Três exemplos práticos do dia a dia:'}
      
      Lei: ${lawName}
      Artigo ${articleNumber}: ${articleContent}
    `;

    const response = await generateGeminiExplanation(prompt);
    
    // Split the response into sections
    const sections = response.split(/\n\n|\n(?=\d\.)/);
    
    return {
      summary: sections[0]?.replace(/^.*?resumo:?\s*/i, "").trim() || "Resumo não disponível",
      detailed: sections[1]?.replace(/^.*?explicação:?\s*/i, "").trim() || "Explicação detalhada não disponível",
      examples: sections.slice(2)
        .filter(s => s?.trim())
        .map(e => e.replace(/^\d\.\s*/, "").trim()) || ["Exemplos não disponíveis"]
    };
  } catch (error) {
    console.error("Erro ao gerar explicação:", error);
    return {
      summary: "Não foi possível gerar um resumo no momento.",
      detailed: "Ocorreu um erro ao processar a explicação detalhada.",
      examples: ["Exemplos não disponíveis no momento."]
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
