
import { ArrowLeft, BookOpen, Share2, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LawHeader = () => {
  const navigate = useNavigate();
  const { lawName } = useParams<{ lawName: string }>();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <BookOpen className="h-5 w-5 text-primary-500 mr-2" />
        
        <Badge variant="outline" className="mr-2">
          Código
        </Badge>
        
        <div className="flex-1"></div>
        
        <Button variant="ghost" size="icon" title="Compartilhar">
          <Share2 className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" title="Favoritar">
          <Star className="h-4 w-4" />
        </Button>
      </div>
      
      {lawName && (
        <h1 className="text-2xl font-heading font-bold">
          {decodeURIComponent(lawName)}
        </h1>
      )}
    </div>
  );
};

export default LawHeader;
