import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { MainNav } from "./MainNav";
import ProfileMenu from "./ProfileMenu";
import NotificationCenter from "./NotificationCenter";
import { BackButton } from "@/components/ui/BackButton";
import { Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
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
      if (scrollPosition > 20) {
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
  return <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-lg bg-background/90' : 'bg-background/70'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {!isHomePage && <BackButton />}
            
          </div>

          <MainNav />

          <div className="flex items-center gap-2">
            {isLoggedIn ? <>
                <NotificationCenter />
                <ProfileMenu />
              </> : <button onClick={() => navigate("/auth")} className="flex items-center gap-1 px-3 py-2 rounded text-sm hover:text-primary transition-colors font-medium">
                <Book size={16} />
                <span>Login</span>
              </button>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;