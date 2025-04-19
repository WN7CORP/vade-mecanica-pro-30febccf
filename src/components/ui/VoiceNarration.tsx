
import { useVoiceNarration } from "@/hooks/use-voice-narration";
import { VolumeControls } from "./voice-narration/VolumeControls";
import { PlaybackControls } from "./voice-narration/PlaybackControls";

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
  const {
    isPaused,
    isLoading,
    volume,
    pauseNarration,
    resumeNarration,
    stopNarration,
    handleVolumeChange
  } = useVoiceNarration({
    text,
    isActive,
    onComplete,
    onStop
  });

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
            
            <PlaybackControls
              isPaused={isPaused}
              onPause={pauseNarration}
              onResume={resumeNarration}
              onStop={stopNarration}
            />
          </div>
          
          <VolumeControls
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceNarration;
