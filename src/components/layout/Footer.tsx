
import { Search, BookOpen, MessageCircle, Home, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { 
      icon: <Home size={20} />, 
      label: "Início", 
      path: "/",
      active: isActive("/") 
    },
    { 
      icon: <Search size={20} />, 
      label: "Pesquisar", 
      path: "/pesquisa",
      active: isActive("/pesquisa") 
    },
    { 
      icon: <BookOpen size={20} />, 
      label: "Leis", 
      path: "/leis",
      active: isActive("/leis") 
    },
    { 
      icon: <MessageCircle size={20} />, 
      label: "Dúvidas", 
      path: "/duvidas",
      active: isActive("/duvidas") 
    },
    {
      icon: <User size={20} />,
      label: "Perfil",
      path: "/perfil",
      active: isActive("/perfil")
    }
  ];
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 py-2 px-4 bg-background border-t border-gray-800/20">
      <div className="max-w-screen-md mx-auto">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-md transition-colors ${
                item.active 
                  ? "text-primary-300" 
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
