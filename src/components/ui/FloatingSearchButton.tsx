
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";

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

  // Return null when not visible to avoid any rendering issues
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-4 z-50"
        >
          <Button
            onClick={onOpenSearch}
            variant="default"
            size="icon"
            className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Search className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSearchButton;
