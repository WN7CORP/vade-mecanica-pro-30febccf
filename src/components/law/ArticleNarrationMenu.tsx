
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

interface ArticleNarrationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  articles: { number: string; content: string }[];
  onStartNarration: (selectedArticles: string[]) => void;
}

const ArticleNarrationMenu = ({
  isOpen,
  onClose,
  articles,
  onStartNarration,
}: ArticleNarrationMenuProps) => {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);

  const handleSelectArticle = (articleNumber: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleNumber)
        ? prev.filter((num) => num !== articleNumber)
        : [...prev, articleNumber]
    );
  };

  const handleStartNarration = () => {
    if (selectedArticles.length > 0) {
      setIsPlaying(true);
      setCurrentArticle(selectedArticles[0]);
      onStartNarration(selectedArticles);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione os artigos para narração</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4">
          <ScrollArea className="flex-1 h-[50vh]">
            <div className="space-y-2 p-2">
              {articles.map((article) => (
                <div
                  key={article.number}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedArticles.includes(article.number)}
                    onCheckedChange={() => handleSelectArticle(article.number)}
                  />
                  <label className="text-sm cursor-pointer flex-1">
                    Artigo {article.number}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedArticles.length > 0 && (
            <div className="w-64 border-l p-4">
              <h3 className="font-medium mb-2">Playlist de Narração</h3>
              <div className="space-y-2 mb-4">
                {selectedArticles.map((num) => (
                  <div
                    key={num}
                    className={`text-sm p-2 rounded ${
                      currentArticle === num ? "bg-primary/20" : ""
                    }`}
                  >
                    Art. {num}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => console.log("Previous")}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => console.log("Next")}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStartNarration}
                  disabled={selectedArticles.length === 0}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Iniciar Narração
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleNarrationMenu;
