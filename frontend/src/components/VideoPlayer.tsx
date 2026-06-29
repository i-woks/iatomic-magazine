import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function VideoPlayer({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="relative overflow-hidden rounded-ios-lg bg-black group">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        controls={false}
        playsInline
      >
        <track kind="captions" />
      </video>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={togglePlay}
          className="rounded-full bg-white/90 p-4 text-black shadow-ios-lg transition-transform hover:scale-110"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={toggleMute}
          className="rounded-full bg-white/90 p-2 text-black shadow-ios"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
