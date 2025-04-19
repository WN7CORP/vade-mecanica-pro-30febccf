
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface UseVoiceNarrationProps {
  text: string;
  isActive: boolean;
  onComplete: () => void;
  onStop: () => void;
}

export const useVoiceNarration = ({
  text,
  isActive,
  onComplete,
  onStop,
}: UseVoiceNarrationProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive && text) {
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
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [isActive, text]);

  const startNarration = async () => {
    setIsLoading(true);
    
    try {
      const apiKey = 'AIzaSyCX26cgIpSd-BvtOLDdEQFa28_wh_HX1uk';
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'pt-BR',
            name: 'pt-BR-Wavenet-E'
          },
          audioConfig: {
            audioEncoding: 'MP3'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API de sintetização: ${response.status}`);
      }

      const { audioContent } = await response.json();
      const byteCharacters = atob(audioContent);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const audioUrlObject = URL.createObjectURL(blob);
      setAudioUrl(audioUrlObject);

      if (audioRef.current) {
        setupAudioElement(audioRef.current, audioUrlObject);
      } else {
        const audio = new Audio(audioUrlObject);
        setupAudioElement(audio, audioUrlObject);
        audioRef.current = audio;
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

  const setupAudioElement = (audio: HTMLAudioElement, url: string) => {
    audio.src = url;
    audio.volume = volume;
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return {
    isPaused,
    isLoading,
    volume,
    pauseNarration,
    resumeNarration,
    stopNarration,
    handleVolumeChange
  };
};
