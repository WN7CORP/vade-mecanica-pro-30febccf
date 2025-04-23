
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { Scale } from "lucide-react";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b ${
      scrolled 
        ? 'border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
        : 'border-transparent bg-background'
    } transition-all duration-300`}>
      <div className="container h-14 flex items-center justify-between">
        <Link to="/" className="mr-4 flex items-center gap-2 group">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary-300/20 text-primary-300 group-hover:scale-110 transition-all duration-300">
            <Scale size={18} className="group-hover:rotate-12 transition-transform" />
          </div>
          <span className="font-heading font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-violet-400 to-primary-300 bg-size-200 animate-gradient">
            JurisAI
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <div className="h-6 w-px bg-border/40" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
