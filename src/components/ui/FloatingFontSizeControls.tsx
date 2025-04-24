
import React from 'react';
import { Button } from '@/components/ui/button';
import { TextCursor } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FloatingFontSizeControlsProps {
  onIncrease: () => void;
  onDecrease: () => void;
  currentSize: number;
  minSize?: number;
  maxSize?: number;
}

export const FloatingFontSizeControls: React.FC<FloatingFontSizeControlsProps> = ({
  onIncrease,
  onDecrease,
  currentSize,
  minSize = 12,
  maxSize = 24
}) => {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-primary/20 text-primary hover:bg-primary/30 rounded-full shadow-lg"
          >
            <TextCursor className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-48 p-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tamanho da fonte</span>
              <span className="text-sm font-semibold">{currentSize}px</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDecrease}
                disabled={currentSize <= minSize}
                className="flex-1"
              >
                A-
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onIncrease}
                disabled={currentSize >= maxSize}
                className="flex-1"
              >
                A+
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
