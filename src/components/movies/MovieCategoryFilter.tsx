
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface MovieCategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

interface MovieCategory {
  id: string;
  name: string;
  created_at: string;
}

const MovieCategoryFilter = ({ selectedCategory, onSelectCategory }: MovieCategoryFilterProps) => {
  const { data: categories } = useQuery({
    queryKey: ['movie-categories'],
    queryFn: async () => {
      // Using type assertion to bypass TypeScript's strict checking
      const { data, error } = await supabase
        .from('movie_categories')
        .select('*')
        .order('name') as { data: MovieCategory[] | null, error: any };

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    }
  });

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-primary-300 mb-4">Categorias</h3>
      <Button
        variant={selectedCategory === null ? "default" : "ghost"}
        className="w-full justify-start"
        onClick={() => onSelectCategory(null)}
      >
        Todas
      </Button>
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default MovieCategoryFilter;
