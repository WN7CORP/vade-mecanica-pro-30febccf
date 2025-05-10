
import { ArrowLeft, BookOpen, Share2, Star, BookText, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LawHeader = () => {
  const navigate = useNavigate();
  const { lawName } = useParams<{ lawName: string }>();

  const goBack = () => {
    navigate(-1);
  };

  // Function to determine law category
  const getLawCategory = (name: string | undefined): 'codigo' | 'estatuto' | 'outros' => {
    if (!name) return 'outros';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('código') || lowerName.includes('consolidação') || lowerName === 'constituição federal') {
      return 'codigo';
    } else if (lowerName.includes('estatuto')) {
      return 'estatuto';
    }
    return 'outros';
  };

  const lawCategory = getLawCategory(lawName);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {lawCategory === 'codigo' ? (
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        ) : lawCategory === 'estatuto' ? (
          <FileText className="h-5 w-5 text-estatuto-light dark:text-estatuto-dark mr-2" />
        ) : (
          <BookText className="h-5 w-5 text-gray-500 mr-2" />
        )}
        
        <Badge 
          variant="outline" 
          className={`mr-2 ${
            lawCategory === 'codigo' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' : 
            lawCategory === 'estatuto' ? 'bg-green-50 dark:bg-green-950/30 text-estatuto-light dark:text-estatuto-dark border-green-200 dark:border-green-800/50' :
            'bg-gray-50 dark:bg-gray-800/30'
          }`}
        >
          {lawCategory === 'codigo' ? 'Código' : 
           lawCategory === 'estatuto' ? 'Estatuto' : 'Outro'}
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
        <h1 className={`text-2xl font-heading font-bold ${
          lawCategory === 'codigo' ? 'text-blue-800 dark:text-blue-300' : 
          lawCategory === 'estatuto' ? 'text-green-800 dark:text-green-300' :
          'text-gray-800 dark:text-gray-200'
        }`}>
          {decodeURIComponent(lawName)}
        </h1>
      )}
    </div>
  );
};

export default LawHeader;
