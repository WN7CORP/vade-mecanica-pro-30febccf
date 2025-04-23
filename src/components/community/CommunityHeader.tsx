
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

interface CommunityHeaderProps {
  onFilterToggle: () => void;
}

const CommunityHeader = ({ onFilterToggle }: CommunityHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-primary-300">Comunidade Jurídica</h1>
        <Button variant="outline" className="gap-2" onClick={onFilterToggle}>
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
          className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-800/50 border border-gray-700 text-gray-300 
          placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
      </div>
    </div>
  );
};

export default CommunityHeader;
