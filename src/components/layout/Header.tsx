
import { Search, Book, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSearchPage = location.pathname === "/pesquisa";
  const isAllLawsPage = location.pathname === "/leis";
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4">
      <div className="max-w-screen-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/")}
              className="p-2 neomorph-sm"
            >
              <Book size={20} className="text-primary-300" />
            </button>
            
            <h1 className="text-xl font-heading font-bold text-primary-300 ml-3">
              VADE MECUM <span className="text-primary-100">PRO</span>
            </h1>
          </div>
          
          <div className="flex space-x-2">
            {!isSearchPage && (
              <button 
                onClick={() => navigate("/pesquisa")}
                className="p-2 neomorph-sm"
                aria-label="Pesquisar"
              >
                <Search size={20} className="text-primary-300" />
              </button>
            )}
            
            {!isAllLawsPage && (
              <button 
                onClick={() => navigate("/leis")}
                className="p-2 neomorph-sm"
                aria-label="Ver todas as leis"
              >
                <Menu size={20} className="text-primary-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
