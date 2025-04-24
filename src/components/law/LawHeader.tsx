
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LawHeaderProps {
  lawName: string | undefined;
}

const LawHeader = ({ lawName }: LawHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-4 mb-6 p-4 neomorph">
      <button
        onClick={() => navigate(-1)}
        className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} />
      </button>
      
      <h1 className="text-xl font-heading font-semibold text-primary-300 line-clamp-1">
        {lawName ? decodeURIComponent(lawName) : "Legislação"}
      </h1>
    </div>
  );
};

export default LawHeader;
