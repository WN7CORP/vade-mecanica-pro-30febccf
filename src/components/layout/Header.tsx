
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ui/ThemeToggle";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ml-64 ${
      isScrolled ? 'shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur' : ''
    }`}>
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link to="/perfil">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <User size={16} />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="px-6 pb-4 pt-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar artigos, leis ou termos..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-600"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
