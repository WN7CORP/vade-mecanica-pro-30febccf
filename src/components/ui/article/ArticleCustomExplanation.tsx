
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ArticleCustomExplanationProps {
  title: string;
  explanation: string;
  onNarrate: () => void;
}

export const ArticleCustomExplanation = ({ title, explanation, onNarrate }: ArticleCustomExplanationProps) => {
  return (
    <div className="mt-5 p-4 bg-primary-900/20 border-l-4 border-primary-300 rounded animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-primary-300 font-medium">{title}</h4>
        <button
          onClick={onNarrate}
          className="shadow-button px-3 py-1 text-primary-300 bg-primary/10 text-xs font-medium rounded transition-all 
            hover:bg-primary/30 active:scale-95 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          Narrar
        </button>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap text-left">
        {explanation}
      </p>
    </div>
  );
};
