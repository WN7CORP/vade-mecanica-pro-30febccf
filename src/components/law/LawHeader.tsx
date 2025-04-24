
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";

const LawHeader = () => {
  const navigate = useNavigate();
  const { lawName } = useParams<{ lawName: string }>();
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <BackButton fallbackRoute="/" className="mr-2" />
      </div>
      {lawName && (
        <h1 className="text-2xl font-bold text-white">
          {decodeURIComponent(lawName)}
        </h1>
      )}
    </div>
  );
};

export default LawHeader;
