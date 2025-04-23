
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
      const { data: { session } } = await supabase.auth.getSession();
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
      isScrolled ? 'shadow-lg bg-background/90' : 'bg-background/70'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {!isHomePage && <BackButton />}
            <Link to="/" className="flex items-center">
              <div className="relative mr-2 animate-bounce-slow">
                <svg 
                  className="h-8 w-8 text-primary-300" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 14h4l-1 8 11-11h-4l3-9z" />
                </svg>
                <div className="absolute inset-0 animate-pulse-slow">
                  <svg 
                    className="h-8 w-8 text-purple-500 opacity-50" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 14h4l-1 8 11-11h-4l3-9z" />
                  </svg>
                </div>
              </div>
              <span className="flex text-xl font-bold items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 animate-text-shimmer">
                JurisAI
                <span className="relative ml-1 top-0.5">
                  <svg className="h-5 w-5 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#fire-gradient)" />
                    <defs>
                      <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9b87f5" />
                        <stop offset="100%" stopColor="#D946EF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
            </Link>
          </div>

          <MainNav />

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <NotificationCenter />
                <ProfileMenu />
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1 px-3 py-2 rounded text-sm hover:text-primary transition-colors font-medium"
              >
                <Book size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
