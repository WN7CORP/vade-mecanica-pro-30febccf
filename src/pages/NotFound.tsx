import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="text-center neomorph p-8 max-w-md">
        <FileQuestion className="h-16 w-16 text-primary-300 mx-auto mb-6" />
        <h1 className="text-3xl font-heading font-bold mb-2 text-primary-100">404</h1>
        <h2 className="text-xl font-heading text-gray-300 mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button 
          onClick={() => navigate("/")}
          className="shadow-button flex items-center justify-center mx-auto"
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default NotFound;
