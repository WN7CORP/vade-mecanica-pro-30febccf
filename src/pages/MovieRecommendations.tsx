
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MovieCard from "@/components/movies/MovieCard";
import MovieCategoryFilter from "@/components/movies/MovieCategoryFilter";

interface Movie {
  id: string;
  title: string;
  poster_url: string;
  average_rating: number;
  rating_count: number;
  year: number;
  category_id: string;
  category?: {
    name: string;
  };
}

const MovieRecommendations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ['legal-movies', selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('legal_movies')
        .select(`
          *,
          category:movie_categories(name)
        `);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching movies:', error);
        throw error;
      }

      return (data || []) as Movie[];
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary-300 mb-2">
            Filmes Jurídicos Recomendados
          </h1>
          <p className="text-gray-400">
            Descubra filmes que enriquecem seu conhecimento jurídico
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64">
            <MovieCategoryFilter 
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Pesquisar filmes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {isError ? (
              <div className="text-center text-red-500">
                Erro ao carregar os filmes. Por favor, tente novamente.
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Card key={n} className="h-[300px] animate-pulse bg-gray-800/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies?.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MovieRecommendations;
