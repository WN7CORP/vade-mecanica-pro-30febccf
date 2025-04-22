import { Search, Book, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === "/pesquisa";
  const isAllLawsPage = location.pathname === "/leis";
  return <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4">
      <div className="max-w-screen-md mx-auto">
        
      </div>
    </header>;
};
export default Header;