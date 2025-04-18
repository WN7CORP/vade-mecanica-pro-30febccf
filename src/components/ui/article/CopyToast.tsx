
import { Check } from "lucide-react";

interface CopyToastProps {
  show: boolean;
}

const CopyToast = ({ show }: CopyToastProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center animate-fade-in">
      <div className="bg-primary-300/90 text-gray-900 px-4 py-2 rounded-md flex items-center">
        <Check size={16} className="mr-2" />
        Texto copiado com sucesso!
      </div>
    </div>
  );
};

export default CopyToast;
