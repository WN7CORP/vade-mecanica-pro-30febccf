
import { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Volume1, 
  Loader2 
} from "lucide-react";

interface VoiceNarrationProps {
  text: string;
  isActive: boolean;
  onComplete: () => void;
  onStop: () => void;
}

const VoiceNarration = ({
  text,
  isActive,
  onComplete,
  onStop
}: VoiceNarrationProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);
  
  // Referências para o objeto de síntese de voz
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Configure a síntese de voz quando o componente for montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    return () => {
      // Limpe a fala ao desmontar o componente
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  // Preparar e iniciar a narração quando isActive mudar
  useEffect(() => {
    if (isActive && speechSynthesisRef.current) {
      startNarration();
    } else {
      stopNarration();
    }
    
    return () => {
      stopNarration();
    };
  }, [isActive, text]);
  
  // Tratar a quebra de texto em parágrafos para destacamento
  useEffect(() => {
    if (text) {
      const paragraphs = text.split('\n').filter(p => p.trim());
      setHighlightedText(paragraphs);
    }
  }, [text]);
  
  const startNarration = () => {
    if (!speechSynthesisRef.current) return;
    
    // Cancelar qualquer fala anterior
    speechSynthesisRef.current.cancel();
    
    // Criar nova instância de utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Configurar a voz em português do Brasil, se disponível
    const voices = speechSynthesisRef.current.getVoices();
    const ptBRVoice = voices.find(voice => 
      voice.lang.includes('pt-BR') || voice.lang.includes('pt')
    );
    
    if (ptBRVoice) {
      utterance.voice = ptBRVoice;
    }
    
    // Configurar propriedades
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = volume;
    
    // Configurar eventos
    utterance.onstart = () => {
      setIsLoading(false);
    };
    
    utterance.onend = () => {
      onComplete();
    };
    
    utterance.onboundary = (event) => {
      setCurrentPosition(event.charIndex);
    };
    
    // Iniciar narração
    setIsLoading(true);
    speechSynthesisRef.current.speak(utterance);
  };
  
  const pauseNarration = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.pause();
      setIsPaused(true);
    }
  };
  
  const resumeNarration = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.resume();
      setIsPaused(false);
    }
  };
  
  const stopNarration = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsPaused(false);
      setCurrentPosition(0);
      onStop();
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  };
  
  // Renderizar a UI da narração
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="max-w-screen-md mx-auto">
        <div className="neomorph p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium text-primary-200">
              Narração em andamento
            </div>
            
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <Loader2 size={18} className="text-primary-300 animate-spin" />
              ) : isPaused ? (
                <button 
                  onClick={resumeNarration}
                  className="p-1.5 neomorph-sm text-primary-300"
                  aria-label="Continuar narração"
                >
                  <Play size={16} />
                </button>
              ) : (
                <button 
                  onClick={pauseNarration}
                  className="p-1.5 neomorph-sm text-primary-300"
                  aria-label="Pausar narração"
                >
                  <Pause size={16} />
                </button>
              )}
              
              <button 
                onClick={stopNarration}
                className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300"
                aria-label="Parar narração"
              >
                <VolumeX size={16} />
              </button>
            </div>
          </div>
          
          {/* Controle de volume */}
          <div className="flex items-center space-x-2 mb-4">
            <Volume1 size={14} className="text-gray-400" />
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary-300"
            />
            
            <Volume2 size={14} className="text-gray-400" />
          </div>
          
          {/* Texto sendo lido com realce */}
          <div className="max-h-32 overflow-y-auto scrollbar-thin neomorph-inset p-3 text-sm">
            {highlightedText.map((paragraph, index) => (
              <p 
                key={index} 
                className={`mb-2 ${
                  // Lógica simplificada de realce - em produção, seria mais precisa
                  currentPosition > text.indexOf(paragraph)
                    ? 'text-primary-300'
                    : 'text-gray-400'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceNarration;
