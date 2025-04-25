
import { useState, useEffect } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface NightModeToggleProps {
  onModeChange?: (isDarkMode: boolean) => void;
  onContrastChange?: (contrast: number) => void;
  onWarmthChange?: (warmth: number) => void;
}

export function NightModeToggle({
  onModeChange,
  onContrastChange,
  onWarmthChange
}: NightModeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contrast, setContrast] = useState(100);
  const [warmth, setWarmth] = useState(1);
  
  // Carregar preferências salvas ao inicializar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('legalReadingDarkMode') === 'true';
    const savedContrast = Number(localStorage.getItem('legalReadingContrast') || '100');
    const savedWarmth = Number(localStorage.getItem('legalReadingWarmth') || '1');
    
    setIsDarkMode(savedDarkMode);
    setContrast(savedContrast);
    setWarmth(savedWarmth);
    
    // Aplicar configurações iniciais
    applyReadingMode(savedDarkMode);
    applyContrast(savedContrast);
    applyWarmth(savedWarmth);
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('legalReadingDarkMode', newMode.toString());
    
    applyReadingMode(newMode);
    
    if (onModeChange) {
      onModeChange(newMode);
    }
  };
  
  const handleContrastChange = (value: number[]) => {
    const newContrast = value[0];
    setContrast(newContrast);
    localStorage.setItem('legalReadingContrast', newContrast.toString());
    
    applyContrast(newContrast);
    
    if (onContrastChange) {
      onContrastChange(newContrast);
    }
  };
  
  const handleWarmthChange = (value: number[]) => {
    const newWarmth = value[0];
    setWarmth(newWarmth);
    localStorage.setItem('legalReadingWarmth', newWarmth.toString());
    
    applyWarmth(newWarmth);
    
    if (onWarmthChange) {
      onWarmthChange(newWarmth);
    }
  };
  
  const applyReadingMode = (isDark: boolean) => {
    // Adicionar ou remover classe dark do documento
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('legal-dark-mode');
      // Aplicar estilos específicos para leitura noturna
      document.body.style.setProperty('--reading-bg', '#121212');
      document.body.style.setProperty('--reading-text', '#e0e0e0');
    } else {
      htmlElement.classList.remove('legal-dark-mode');
      document.body.style.removeProperty('--reading-bg');
      document.body.style.removeProperty('--reading-text');
    }
  };
  
  const applyContrast = (contrastValue: number) => {
    document.body.style.setProperty('--reading-contrast', `${contrastValue}%`);
  };
  
  const applyWarmth = (warmthValue: number) => {
    const filterValue = `sepia(${(warmthValue - 1) * 100}%)`;
    document.body.style.setProperty('--reading-warmth', filterValue);
  };
  
  const resetSettings = () => {
    setContrast(100);
    setWarmth(1);
    localStorage.setItem('legalReadingContrast', '100');
    localStorage.setItem('legalReadingWarmth', '1');
    
    applyContrast(100);
    applyWarmth(1);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-2">
        <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Switch 
          checked={isDarkMode}
          onCheckedChange={toggleDarkMode}
          aria-label="Toggle dark mode"
        />
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Ajustes de leitura</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          <DropdownMenuLabel>Configurações de Leitura</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="flex flex-col items-start p-4">
              <span className="text-sm font-medium mb-2">Contraste: {contrast}%</span>
              <Slider
                value={[contrast]}
                min={75}
                max={125}
                step={5}
                onValueChange={handleContrastChange}
                className="w-full"
                aria-label="Ajustar contraste"
              />
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex flex-col items-start p-4">
              <span className="text-sm font-medium mb-2">Temperatura: {warmth === 1 ? 'Neutro' : warmth < 1 ? 'Frio' : 'Quente'}</span>
              <Slider
                value={[warmth]}
                min={0.8}
                max={1.2}
                step={0.05}
                onValueChange={handleWarmthChange}
                className="w-full"
                aria-label="Ajustar temperatura"
              />
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="justify-center" onClick={resetSettings}>
              Restaurar padrões
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <style>
        {`
        /* Aplicar estilos de modo de leitura aos elementos */
        .legal-dark-mode .article-content,
        .legal-dark-mode .card-article {
          background-color: var(--reading-bg, #121212);
          color: var(--reading-text, #e0e0e0);
        }
        
        /* Aplicar contraste e temperatura */
        .article-content, .card-article {
          filter: contrast(var(--reading-contrast, 100%)) var(--reading-warmth, none);
          transition: filter 0.3s ease, background-color 0.3s ease, color 0.3s ease;
        }
        `}
      </style>
    </div>
  );
}
