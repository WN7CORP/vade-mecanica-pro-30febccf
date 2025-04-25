
import { useState } from "react";
import { Scale, Book } from "lucide-react";
import { motion } from "framer-motion";

interface LawCategorySeparatorProps {
  onCategoryChange: (category: 'codigo' | 'estatuto' | 'all') => void;
  activeCategory: 'codigo' | 'estatuto' | 'all';
  codigoCount: number;
  estatutoCount: number;
}

const LawCategorySeparator = ({ 
  onCategoryChange, 
  activeCategory, 
  codigoCount, 
  estatutoCount 
}: LawCategorySeparatorProps) => {
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-4 neomorph p-1 rounded-xl">
        <motion.button
          onClick={() => onCategoryChange('all')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeCategory === 'all' 
              ? 'bg-primary text-white shadow-inner' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          whileHover={{ scale: activeCategory !== 'all' ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Scale size={18} />
          <span>Todos</span>
        </motion.button>

        <motion.button
          onClick={() => onCategoryChange('codigo')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeCategory === 'codigo' 
              ? 'bg-primary text-white shadow-inner' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          whileHover={{ scale: activeCategory !== 'codigo' ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Scale size={18} />
          <span>Códigos</span>
          <span className="bg-primary-900/30 text-primary-100 text-xs px-2 py-0.5 rounded-full">
            {codigoCount}
          </span>
        </motion.button>

        <motion.button
          onClick={() => onCategoryChange('estatuto')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            activeCategory === 'estatuto' 
              ? 'bg-primary text-white shadow-inner' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
          whileHover={{ scale: activeCategory !== 'estatuto' ? 1.05 : 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Book size={18} />
          <span>Estatutos</span>
          <span className="bg-primary-900/30 text-primary-100 text-xs px-2 py-0.5 rounded-full">
            {estatutoCount}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default LawCategorySeparator;
