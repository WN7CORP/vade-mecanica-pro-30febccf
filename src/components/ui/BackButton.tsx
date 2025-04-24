
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';

interface BackButtonProps {
  className?: string;
  fallbackRoute?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  fallbackRoute = '/'
}) => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    // Try to go back to previous page, if not possible, go to fallback route
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };
  
  return (
    <Button
      variant="ghost"
      className={`px-2 flex items-center text-gray-400 hover:text-white transition-colors ${className}`}
      onClick={handleGoBack}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      <span>Voltar</span>
    </Button>
  );
};
