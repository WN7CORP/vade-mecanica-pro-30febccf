
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

interface CommunityHeaderProps {
  onFilterToggle: () => void;
}

const CommunityHeader = ({ onFilterToggle }: CommunityHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500">
          Comunidade Jurídica
        </h1>
        <Button variant="outline" className="gap-2 border-gray-800/50 bg-gray-900/50 hover:bg-primary-500/10 hover:text-primary-400" onClick={onFilterToggle}>
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
          className="pl-10 pr-4 py-3 w-full rounded-xl bg-gray-900/70 border border-gray-800/40 text-gray-300 
          placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
        />
      </div>
    </motion.div>
  );
};

export default CommunityHeader;
