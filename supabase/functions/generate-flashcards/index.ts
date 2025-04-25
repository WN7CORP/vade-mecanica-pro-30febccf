
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize clients
    const supabaseUrl = "https://phzcazcyjhlmdchcjagy.supabase.co";
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Fetch articles that don't have flashcards yet
    const { data: articles, error: fetchError } = await supabase
      .from('codigo_civil')
      .select('numero, artigo')
      .limit(5); // Process 5 articles at a time

    if (fetchError) throw fetchError;

    const results = [];

    for (const article of articles) {
      try {
        // Check if flashcard already exists
        const { data: existing } = await supabase
          .from('law_flashcards')
          .select('id')
          .eq('law_name', 'Código Civil')
          .eq('article_number', article.numero)
          .single();

        if (existing) {
          results.push({ 
            article: article.numero, 
            status: 'skipped',
            message: 'Flashcard already exists'
          });
          continue;
        }

        const prompt = `
          Create a law flashcard for studying this article:
          Article ${article.numero}: ${article.artigo}
          
          Format the response exactly like this, with labels:
          Question: [A concise question about the key concept of the article]
          Answer: [A clear and complete answer explaining the article's content]
          Difficulty: [easy/medium/hard based on the complexity of the concept]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse the response
        const questionMatch = text.match(/Question: (.*)/i);
        const answerMatch = text.match(/Answer: (.*)/i);
        const difficultyMatch = text.match(/Difficulty: (.*)/i);

        if (questionMatch && answerMatch && difficultyMatch) {
          const { error } = await supabase.from('law_flashcards').insert({
            law_name: 'Código Civil',
            article_number: article.numero,
            article_content: article.artigo,
            question: questionMatch[1].trim(),
            answer: answerMatch[1].trim(),
            difficulty: difficultyMatch[1].trim().toLowerCase()
          });
          
          if (error) throw error;
          
          results.push({ 
            article: article.numero, 
            status: 'success',
            question: questionMatch[1].trim().substring(0, 30) + '...'
          });
        } else {
          throw new Error('Failed to parse response: ' + text);
        }
      } catch (articleError) {
        results.push({ 
          article: article.numero, 
          status: 'error',
          error: articleError.message 
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
