
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, MessageCircle } from "lucide-react";

export function MainNav() {
  return (
    <div className="flex items-center space-x-2">
      <nav className="flex items-center space-x-4">
        <Link 
          to="/leis" 
          className="text-sm font-medium transition-colors hover:text-primary flex items-center"
        >
          <BookOpen className="mr-1 h-4 w-4" />
          <span>Leis</span>
        </Link>
        <Link 
          to="/pesquisa" 
          className="text-sm font-medium transition-colors hover:text-primary flex items-center"
        >
          <Search className="mr-1 h-4 w-4" />
          <span>Pesquisar</span>
        </Link>
        <Link 
          to="/duvidas" 
          className="text-sm font-medium transition-colors hover:text-primary flex items-center"
        >
          <MessageCircle className="mr-1 h-4 w-4" />
          <span>Dúvidas</span>
        </Link>
      </nav>
    </div>
  );
}
