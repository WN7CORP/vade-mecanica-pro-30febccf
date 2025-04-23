
import React from "react";
import { Link } from "react-router-dom";

export function MainNav() {
  return (
    <div className="flex items-center">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold text-primary-300">JurisTech</span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          to="/"
          className="text-sm font-medium transition-colors hover:text-primary-300"
        >
          Início
        </Link>
        <Link
          to="/pesquisa"
          className="text-sm font-medium transition-colors hover:text-primary-300"
        >
          Pesquisa
        </Link>
        <Link
          to="/leis"
          className="text-sm font-medium transition-colors hover:text-primary-300"
        >
          Leis
        </Link>
        <Link
          to="/duvidas"
          className="text-sm font-medium transition-colors hover:text-primary-300"
        >
          Dúvidas
        </Link>
        <Link
          to="/comunidade"
          className="text-sm font-medium transition-colors hover:text-primary-300"
        >
          Comunidade
        </Link>
      </nav>
    </div>
  );
}
