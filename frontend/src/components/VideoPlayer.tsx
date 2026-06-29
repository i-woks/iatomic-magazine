import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
    id = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export function VideoPlayer({ videoUrl, posterUrl, title = "ویدئوی مقاله" }: { videoUrl: string; posterUrl?: string; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const embed = youtubeEmbed(videoUrl);

  if (embed) {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-separator/20 bg-black shadow-ios-lg">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/55 to-transparent px-4 py-3 text-xs font-bold text-white/90">
          <span>{title}</span>
          <span className="rounded-full bg-white/12 px-2 py-1">YouTube</span>
        </div>
        <iframe
          src={embed}
          title={title}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-separator/20 bg-black shadow-ios-lg">
      <video ref={videoRef} src={videoUrl} poster={posterUrl} className="w-full" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} controls={false} playsInline>
        <track kind="captions" />
      </video>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={togglePlay} className="rounded-full bg-white/90 p-4 text-black shadow-ios-lg transition-transform hover:scale-110" aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
      </div>
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={toggleMute} className="rounded-full bg-white/90 p-2 text-black shadow-ios" aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
