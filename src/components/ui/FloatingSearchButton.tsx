
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
      onClick={onOpenSearch}
      className="fixed bottom-20 right-4 z-40 rounded-full p-3 shadow-lg bg-primary-500 hover:bg-primary-600 text-white"
      size="icon"
      aria-label="Pesquisar"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
};
