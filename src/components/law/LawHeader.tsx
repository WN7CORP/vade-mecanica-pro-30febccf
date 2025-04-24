import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
const LawHeader = () => {
  const navigate = useNavigate();
  const {
    lawName
  } = useParams<{
    lawName: string;
  }>();
  return;
};
export default LawHeader;