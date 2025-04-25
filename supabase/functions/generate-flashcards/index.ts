
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
    const geminiApiKey = "AIzaSyAIvZkvZIJNYS4aNFABKHbfGLH58i5grf0";

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Fetch articles that don't have flashcards yet
    const { data: articles, error: fetchError } = await supabase
      .from('codigo_civil')
      .select('numero, artigo')
      .limit(5); // Process 5 articles at a time

    if (fetchError) throw fetchError;

    for (const article of articles) {
      // Check if flashcard already exists
      const { data: existing } = await supabase
        .from('law_flashcards')
        .select('id')
        .eq('law_name', 'Código Civil')
        .eq('article_number', article.numero)
        .single();

      if (existing) continue; // Skip if flashcard exists

      const prompt = `
        Create a law flashcard for studying this article:
        Article ${article.numero}: ${article.artigo}
        
        Format the response exactly like this, with labels:
        Question: [A concise question about the key concept of the article]
        Answer: [A clear and complete answer explaining the article's content]
        Difficulty: [easy/medium/hard based on the complexity of the concept]
      `;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
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

      const result = await response.json();
      const content = result.candidates[0].content.parts[0].text;

      // Parse the response
      const questionMatch = content.match(/Question: (.*)/);
      const answerMatch = content.match(/Answer: (.*)/);
      const difficultyMatch = content.match(/Difficulty: (.*)/);

      if (questionMatch && answerMatch && difficultyMatch) {
        await supabase.from('law_flashcards').insert({
          law_name: 'Código Civil',
          article_number: article.numero,
          article_content: article.artigo,
          question: questionMatch[1].trim(),
          answer: answerMatch[1].trim(),
          difficulty: difficultyMatch[1].trim().toLowerCase()
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
