
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "./button";

interface FloatingSearchButtonProps {
  onOpenSearch: () => void;
}

export const FloatingSearchButton = ({
  onOpenSearch
}: FloatingSearchButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200); // Show after 200px of scroll
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={onOpenSearch} 
      className="fixed bottom-5 right-4 z-50 bg-primary/20 text-primary hover:bg-primary/30 rounded-full shadow-lg"
    >
      <Search className="h-4 w-4" />
    </Button>
  );
};
