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
  return;
};