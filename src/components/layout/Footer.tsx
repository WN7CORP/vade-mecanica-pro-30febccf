
import { Home, BookOpen, MessageCircle, Award, Scale, PenLine } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      icon: <Home size={18} />,
      label: "Início",
      path: "/",
      active: isActive("/")
    },
    {
      icon: <MessageCircle size={18} />,
      label: "Dúvidas",
      path: "/duvidas",
      active: isActive("/duvidas")
    },
    {
      icon: <Scale size={18} />,
      label: "Leis",
      path: "/leis",
      active: isActive("/leis")
    },
    {
      icon: <PenLine size={18} />,
      label: "Anotações",
      path: "/anotacoes",
      active: isActive("/anotacoes")
    },
    {
      icon: <Award size={18} />,
      label: "Perfil",
      path: "/perfil",
      active: isActive("/perfil")
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 py-1.5 px-1 bg-background/95 backdrop-blur border-t border-gray-800/20">
      <div className="max-w-screen-md mx-auto">
        <nav className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-1.5 rounded-md transition-colors ${
                item.active
                  ? "text-primary-300 font-semibold border-t-2 border-primary-300"
                  : "text-gray-400 hover:text-primary-300"
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
