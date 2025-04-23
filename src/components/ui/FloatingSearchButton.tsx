
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "./button";

interface FloatingSearchButtonProps {
  onOpenSearch: () => void;
}

export const FloatingSearchButton = ({ onOpenSearch }: FloatingSearchButtonProps) => {
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
      size="icon"
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-primary-300 to-primary-500 hover:from-primary-400 hover:to-primary-600 transition-all duration-300 hover:scale-105 z-50"
    >
      <Search className="text-white" />
    </Button>
  );
};
