
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play, Volume1 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceNarrationProps {
  text: string;
  title?: string;
  isActive: boolean;
  onComplete: () => void;
  onStop: () => void;
}

const VoiceNarration = ({
  text,
  title = "Narração",
  isActive,
  onComplete,
  onStop
}: VoiceNarrationProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Referências para o objeto de áudio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Preparar e iniciar a narração quando isActive mudar
  useEffect(() => {
    if (isActive && text) {
      // Parar qualquer áudio em reprodução atual
      if (window.currentAudio && window.currentAudio !== audioRef.current) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
      }
      
      startNarration();
    } else {
      stopNarration();
    }
    
    return () => {
      stopNarration();
      // Limpar URL do objeto se existir
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isActive, text]);
  
  const startNarration = async () => {
    setIsLoading(true);
    
    try {
      // Usar a API Google Text-to-Speech
      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const requestBody = {
        input: {
          text: text
        },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Wavenet-E'
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erro na API de sintetização: ${response.status}`);
      }

      const data = await response.json();
      
      // Converter base64 para áudio
      const audioContent = data.audioContent;
      const byteCharacters = atob(audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      
      // Criar URL e reproduzir áudio
      const audioUrlObject = URL.createObjectURL(blob);
      setAudioUrl(audioUrlObject);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrlObject;
        audioRef.current.volume = volume;
        
        // Guardar referência global para este áudio para poder interromper outros quando necessário
        window.currentAudio = audioRef.current;
        
        audioRef.current.play().catch(e => {
          console.error("Erro ao reproduzir áudio:", e);
          toast({
            description: "Erro ao reproduzir o áudio. Tente novamente.",
            variant: "destructive"
          });
        });
      } else {
        const audio = new Audio(audioUrlObject);
        audio.volume = volume;
        audioRef.current = audio;
        
        // Guardar referência global para este áudio para poder interromper outros quando necessário
        window.currentAudio = audio;
        
        audio.addEventListener('ended', onComplete);
        audio.addEventListener('error', () => {
          toast({
            description: "Erro ao reproduzir o áudio. Tente novamente.",
            variant: "destructive"
          });
          onStop();
        });
        
        audio.play().catch(e => {
          console.error("Erro ao reproduzir áudio:", e);
          toast({
            description: "Erro ao reproduzir o áudio. Tente novamente.",
            variant: "destructive"
          });
        });
      }
      
    } catch (error) {
      console.error("Erro na narração:", error);
      toast({
        description: "Não foi possível iniciar a narração. Tente novamente mais tarde.",
        variant: "destructive"
      });
      onStop();
    } finally {
      setIsLoading(false);
    }
  };
  
  const pauseNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };
  
  const resumeNarration = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
    }
  };
  
  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (window.currentAudio === audioRef.current) {
        window.currentAudio = null;
      }
    }
    setIsPaused(false);
    onStop();
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Renderizar a UI da narração
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="max-w-screen-md mx-auto">
        <div className="neomorph p-4 flex flex-col backdrop-blur-md bg-background/90">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="text-sm font-medium text-primary-200 mr-2">
                {title}
              </div>
              
              {isLoading ? (
                <div className="audio-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : isPaused ? null : (
                <div className="audio-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isPaused ? (
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
          <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </div>
  );
};

export default VoiceNarration;
