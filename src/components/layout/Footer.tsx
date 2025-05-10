
import { useState, useEffect } from "react";
import { Home, MessageCircle, Scale, Users, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      label: "Buscar",
      path: "/pesquisa",
      active: isActive("/pesquisa")
    },
    {
      icon: <Scale size={20} />,
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
      icon: <Users size={20} />,
      label: "Social",
      path: "/comunidade",
      active: isActive("/comunidade")
    }
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 20) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 20) {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <footer className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
      visible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg px-2 py-2 backdrop-blur-lg">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-1 px-3 rounded-md transition-colors ${
                item.active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
