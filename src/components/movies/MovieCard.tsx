
import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    poster_url: string;
    average_rating: number;
    rating_count: number;
    year: number;
  };
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/filmes/${movie.id}`}>
      <Card className="group overflow-hidden transition-all hover:ring-2 hover:ring-primary-300/50">
        <div className="aspect-[2/3] relative">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 p-4 text-white">
              <h3 className="font-medium">{movie.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm">
                  {movie.average_rating.toFixed(1)} ({movie.rating_count})
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{movie.year}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
