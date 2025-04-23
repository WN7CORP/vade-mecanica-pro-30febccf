
import { Home, BookOpen, MessageCircle, User } from "lucide-react";
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
      icon: <MessageCircle size={20} />,
      label: "Dúvidas",
      path: "/duvidas",
      active: isActive("/duvidas")
    },
    {
      icon: <BookOpen size={20} />,
      label: "Comunidade",
      path: "/comunidade",
      active: isActive("/comunidade"),
      className: "text-primary-300 font-bold border-t-2 border-primary-300"
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
                  ? "text-primary-300 font-bold border-t-2 border-primary-300"
                  : "text-gray-400 hover:text-primary-300"
              } ${item.className || ""}`}
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
