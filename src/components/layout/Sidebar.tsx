
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Scale, 
  MessageCircle, 
  Users, 
  Search, 
  Bookmark, 
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      icon: <Home size={collapsed ? 24 : 20} />,
      label: "Início",
      path: "/",
      active: isActive("/")
    },
    {
      icon: <Scale size={collapsed ? 24 : 20} />,
      label: "Leis",
      path: "/leis",
      active: isActive("/leis")
    },
    {
      icon: <MessageCircle size={collapsed ? 24 : 20} />,
      label: "Dúvidas",
      path: "/duvidas",
      active: isActive("/duvidas")
    },
    {
      icon: <Users size={collapsed ? 24 : 20} />,
      label: "Comunidade",
      path: "/comunidade",
      active: isActive("/comunidade")
    },
    {
      icon: <Search size={collapsed ? 24 : 20} />,
      label: "Pesquisar",
      path: "/pesquisa",
      active: isActive("/pesquisa")
    },
    {
      icon: <Bookmark size={collapsed ? 24 : 20} />,
      label: "Favoritos",
      path: "/favoritos",
      active: isActive("/favoritos")
    },
    {
      icon: <ScrollText size={collapsed ? 24 : 20} />,
      label: "Anotações",
      path: "/anotacoes",
      active: isActive("/anotacoes")
    },
    {
      icon: <Lightbulb size={collapsed ? 24 : 20} />,
      label: "Estudos",
      path: "/estudos",
      active: isActive("/estudos")
    }
  ];

  const secondaryNavItems = [
    {
      icon: <Settings size={collapsed ? 24 : 20} />,
      label: "Configurações",
      path: "/configuracoes",
      active: isActive("/configuracoes")
    }
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} h-screen fixed left-0 top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm z-40 transition-all duration-300`}>
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 px-4">
          {!collapsed ? (
            <h1 className="text-lg font-heading font-bold gradient-text">VADE MECUM <span className="text-primary-300">PRO</span></h1>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              V
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left ${
                  collapsed 
                    ? 'justify-center py-3 px-2' 
                    : 'px-3 py-2.5'
                } rounded-lg flex items-center gap-3 transition-colors ${
                  item.active
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span className={`${
                  item.active 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                }`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left ${
                  collapsed 
                    ? 'justify-center py-3 px-2' 
                    : 'px-3 py-2.5'
                } rounded-lg flex items-center gap-3 transition-colors ${
                  item.active
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span className={`${
                  item.active 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                }`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-2 justify-center"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
