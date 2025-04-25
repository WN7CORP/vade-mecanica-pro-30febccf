
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";

const LawHeader = () => {
  const navigate = useNavigate();
  const { lawName } = useParams<{ lawName: string }>();

  return (
    <div className="flex items-center justify-between mb-4">
      {lawName && (
        <h1 className="text-2xl font-bold text-white">
          {decodeURIComponent(lawName)}
        </h1>
      )}
    </div>
  );
};

export default LawHeader;
