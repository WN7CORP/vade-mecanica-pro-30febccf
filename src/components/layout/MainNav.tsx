import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, MessageCircle } from "lucide-react";
export function MainNav() {
  return <div className="flex items-center space-x-2">
      <nav className="flex items-center space-x-4">
        <Link to="/leis" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
          
          
        </Link>
        <Link to="/pesquisa" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
          
          
        </Link>
        <Link to="/duvidas" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
          
          
        </Link>
      </nav>
    </div>;
}