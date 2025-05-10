
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

    // Initialize visibility check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Return null when not visible, but always return something
  if (!isVisible) return null;

  return (
    <Button
      onClick={onOpenSearch}
      variant="outline"
      size="icon"
      className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-primary-300/20 text-primary-300 hover:bg-primary-300/30 animate-fade-in"
    >
      <Search className="h-5 w-5" />
    </Button>
  );
};
