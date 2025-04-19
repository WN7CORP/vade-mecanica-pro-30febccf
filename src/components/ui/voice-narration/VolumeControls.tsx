
import { Volume1, Volume2 } from "lucide-react";

interface VolumeControlsProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export const VolumeControls = ({ volume, onVolumeChange }: VolumeControlsProps) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
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
  );
};
