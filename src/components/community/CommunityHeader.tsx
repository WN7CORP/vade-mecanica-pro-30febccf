
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface CommunityHeaderProps {
  onFilterToggle: () => void;
}

const CommunityHeader = ({ onFilterToggle }: CommunityHeaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px, hide the header
        setIsVisible(false);
      } else {
        // Scrolling up or at the top, show the header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : -20,
        transition: { duration: 0.3 }
      }}
      className={`transition-all duration-300 ${
        isVisible ? "" : "pointer-events-none"
      }`}
    >
      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold gradient-text">Comunidade Jurídica</h1>
            <Button variant="outline" className="gap-2" onClick={onFilterToggle}>
              <Filter size={16} />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar na comunidade..."
              className="pl-10 pr-4 py-2 w-full rounded-md border bg-background text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityHeader;
