
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useStudyTimer } from "@/contexts/StudyTimerContext";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import StudyContent from "@/components/study/StudyContent";

const StudyMode = () => {
  const { lawName } = useParams<{ lawName: string }>();
  const { studyTimeMinutes } = useStudyTimer();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div 
      style={{ background: '#131620' }} 
      className="flex flex-col min-h-screen md:px-4 px-0"
    >
      <Header />
      
      <main className="flex-1 max-w-screen-md mx-auto w-full pt-16 pb-6">
        <StudyContent 
          lawName={lawName} 
          studyTimeMinutes={studyTimeMinutes}
        />
      </main>
      
      {showScrollTop && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={scrollToTop} 
          className="fixed bottom-20 right-4 z-50 bg-primary/20 text-primary hover:bg-primary/30 rounded-full shadow-lg"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      
      <Footer />
    </div>
  );
};

export default StudyMode;
