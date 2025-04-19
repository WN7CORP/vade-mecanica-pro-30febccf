
import { Pause, Play, VolumeX } from "lucide-react";

interface PlaybackControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const PlaybackControls = ({
  isPaused,
  onPause,
  onResume,
  onStop
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {isPaused ? (
        <button 
          onClick={onResume}
          className="p-1.5 neomorph-sm text-primary-300"
          aria-label="Continuar narração"
        >
          <Play size={16} />
        </button>
      ) : (
        <button 
          onClick={onPause}
          className="p-1.5 neomorph-sm text-primary-300"
          aria-label="Pausar narração"
        >
          <Pause size={16} />
        </button>
      )}
      
      <button 
        onClick={onStop}
        className="p-1.5 neomorph-sm text-gray-400 hover:text-gray-300"
        aria-label="Parar narração"
      >
        <VolumeX size={16} />
      </button>
    </div>
  );
};
