import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface LawHeaderProps {
  lawName: string | undefined;
}
const LawHeader = ({
  lawName
}: LawHeaderProps) => {
  const navigate = useNavigate();
  return <div className="flex items-center mb-6">
      
      
      <h1 className="text-xl font-heading font-semibold text-primary-300 line-clamp-1">
        {lawName ? decodeURIComponent(lawName) : "Legislação"}
      </h1>
    </div>;
};
export default LawHeader;