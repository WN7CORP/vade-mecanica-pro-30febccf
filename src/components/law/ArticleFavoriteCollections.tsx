
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { type Article } from "@/services/lawService";

interface ArticleFavoriteCollectionsProps {
  article: Article;
  onFavorite: (collectionName: string) => void;
  isFavorited: boolean;
}

const ArticleFavoriteCollections = ({
  article,
  onFavorite,
  isFavorited
}: ArticleFavoriteCollectionsProps) => {
  const [showCollections, setShowCollections] = useState(false);
  const [collections] = useState(['Principais', 'Para Estudar', 'Importantes']);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowCollections(!showCollections)}
        className={`flex items-center gap-2 ${isFavorited ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        <span className="text-xs">
          {isFavorited ? 'Favoritado' : 'Favoritar'}
        </span>
      </Button>

      {showCollections && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur border rounded-lg shadow-lg z-50"
        >
          <div className="p-2 space-y-1">
            {collections.map((collection) => (
              <Button
                key={collection}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onFavorite(collection);
                  setShowCollections(false);
                }}
              >
                <Bookmark className="h-4 w-4" />
                <span className="text-xs">{collection}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 border-t border-border mt-2 pt-2"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="text-xs">Nova Coleção</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ArticleFavoriteCollections;
