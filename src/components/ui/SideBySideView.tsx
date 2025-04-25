
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideBySideViewProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  initialSplit?: 'equal' | 'left-emphasis' | 'right-emphasis' | 'collapse-right' | 'collapse-left';
}

/**
 * Componente que exibe dois painéis lado a lado com controles de redimensionamento
 */
export function SideBySideView({
  leftContent,
  rightContent,
  leftTitle = "Artigo",
  rightTitle = "Detalhes",
  initialSplit = 'equal'
}: SideBySideViewProps) {
  const [split, setSplit] = useState<'equal' | 'left-emphasis' | 'right-emphasis' | 'collapse-right' | 'collapse-left'>(
    initialSplit
  );
  
  const getLeftWidth = () => {
    switch (split) {
      case 'equal': return 'w-1/2';
      case 'left-emphasis': return 'w-2/3';
      case 'right-emphasis': return 'w-1/3';
      case 'collapse-right': return 'w-full';
      case 'collapse-left': return 'w-0';
      default: return 'w-1/2';
    }
  };
  
  const getRightWidth = () => {
    switch (split) {
      case 'equal': return 'w-1/2';
      case 'left-emphasis': return 'w-1/3';
      case 'right-emphasis': return 'w-2/3';
      case 'collapse-right': return 'w-0';
      case 'collapse-left': return 'w-full';
      default: return 'w-1/2';
    }
  };
  
  const toggleLeftCollapse = () => {
    setSplit(split === 'collapse-left' ? 'equal' : 'collapse-left');
  };
  
  const toggleRightCollapse = () => {
    setSplit(split === 'collapse-right' ? 'equal' : 'collapse-right');
  };
  
  const cycleLayout = () => {
    const layouts: ('equal' | 'left-emphasis' | 'right-emphasis' | 'collapse-right' | 'collapse-left')[] = 
      ['equal', 'left-emphasis', 'right-emphasis'];
    const currentIndex = layouts.indexOf(split);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setSplit(layouts[nextIndex]);
  };

  return (
    <div className="relative flex flex-col md:flex-row w-full h-full min-h-[400px] animate-fade-in">
      <div className="absolute top-0 left-0 right-0 flex justify-center py-2 z-10">
        <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm p-1">
          <Button
            variant="ghost"
            size="icon"
            title="Alternar visualização do painel esquerdo"
            onClick={toggleLeftCollapse}
            className="h-7 w-7"
          >
            <ChevronLeft className={`h-4 w-4 ${split === 'collapse-left' ? 'opacity-50' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={cycleLayout}
            className="h-7 px-2 text-xs"
          >
            Alternar Layout
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            title="Alternar visualização do painel direito"
            onClick={toggleRightCollapse}
            className="h-7 w-7"
          >
            <ChevronRight className={`h-4 w-4 ${split === 'collapse-right' ? 'opacity-50' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${getLeftWidth()} min-h-[300px] max-h-[80vh] overflow-y-auto p-4 relative`}>
        {split !== 'collapse-left' && (
          <>
            <h3 className="text-lg font-medium text-center mb-4">{leftTitle}</h3>
            <div className="rounded-lg h-full">{leftContent}</div>
          </>
        )}
      </div>
      
      <div className="h-full mx-1 border-r border-border hidden md:block" />
      
      <div className={`transition-all duration-300 ${getRightWidth()} min-h-[300px] max-h-[80vh] overflow-y-auto p-4 relative`}>
        {split !== 'collapse-right' && (
          <>
            <h3 className="text-lg font-medium text-center mb-4">{rightTitle}</h3>
            <div className="rounded-lg h-full">{rightContent}</div>
          </>
        )}
      </div>
    </div>
  );
}
