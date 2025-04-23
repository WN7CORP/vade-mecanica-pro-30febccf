
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  average_rating: number;
  rating_count: number;
  year: number;
  description: string;
  youtube_trailer_url: string;
  director: string;
  category: {
    name: string;
  };
}

const MovieDetails = () => {
  const { id } = useParams();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_movies')
        .select(`
          *,
          category:movie_categories(name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching movie:', error);
        throw error;
      }

      return data as Movie;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="w-full h-[600px] animate-pulse bg-gray-800/50" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Filme não encontrado.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-300">Sobre o Filme</h3>
                <p className="text-gray-400">{movie.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-primary-300">Ano</h3>
                  <p className="text-gray-400">{movie.year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary-300">Diretor</h3>
                  <p className="text-gray-400">{movie.director}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary-300">Categoria</h3>
                  <p className="text-gray-400">{movie.category?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary-300">Avaliação</h3>
                  <p className="text-gray-400">{movie.average_rating.toFixed(1)} ({movie.rating_count} avaliações)</p>
                </div>
              </div>

              {movie.youtube_trailer_url && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">Trailer</h3>
                  <a
                    href={movie.youtube_trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Play size={20} />
                    Assistir no YouTube
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetails;
