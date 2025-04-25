
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = "https://phzcazcyjhlmdchcjagy.supabase.co";
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiApiKey = Deno.env.get('GOOGLE_API_KEY') ?? '';

    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
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
          continue; // Skip if flashcard exists
        }

        const prompt = `
          Create a law flashcard for studying this article:
          Article ${article.numero}: ${article.artigo}
          
          Format the response exactly like this, with labels:
          Question: [A concise question about the key concept of the article]
          Answer: [A clear and complete answer explaining the article's content]
          Difficulty: [easy/medium/hard based on the complexity of the concept]
        `;

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey,
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        
        if (!result.candidates || result.candidates.length === 0 || 
            !result.candidates[0].content || !result.candidates[0].content.parts || 
            !result.candidates[0].content.parts[0].text) {
          throw new Error('Invalid response format from Gemini API');
        }
        
        const content = result.candidates[0].content.parts[0].text;

        // Parse the response
        const questionMatch = content.match(/Question: (.*)/i);
        const answerMatch = content.match(/Answer: (.*)/i);
        const difficultyMatch = content.match(/Difficulty: (.*)/i);

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
          throw new Error('Failed to parse response: ' + content);
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
