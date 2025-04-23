
import React from "react";
import { Link } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";

export function MainNav() {
  return (
    <div className="flex items-center space-x-2">
      <nav className="flex items-center space-x-4">
        <Link 
          to="/duvidas" 
          className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-primary-300/10 to-primary-400/10 hover:from-primary-300/20 hover:to-primary-400/20"
        >
          <MessageCircle size={18} className="text-primary-300" />
          <span>Dúvidas</span>
        </Link>
        
        <Link 
          to="/pesquisa" 
          className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-primary-300/10 to-primary-400/10 hover:from-primary-300/20 hover:to-primary-400/20"
        >
          <Search size={18} className="text-primary-300" />
          <span>Pesquisar</span>
        </Link>
      </nav>
    </div>
  );
}
