import { useRef, useState } from "react";
import { Captions, ExternalLink, Pause, Play, Volume2, VolumeX } from "lucide-react";

function youtubeInfo(url: string): { embed: string; watch: string } | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v") || u.pathname.split("/").filter(Boolean).pop() || "";
    id = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return id ? { embed: `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1`, watch: `https://www.youtube.com/watch?v=${id}` } : null;
  } catch {
    return null;
  }
}

export function VideoPlayer({ videoUrl, posterUrl, title = "ویدئوی مقاله" }: { videoUrl: string; posterUrl?: string; title?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const yt = youtubeInfo(videoUrl);

  const postYoutube = (func: "playVideo" | "pauseVideo" | "mute" | "unMute") => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  };

  const togglePlay = () => {
    if (yt) {
      postYoutube(playing ? "pauseVideo" : "playVideo");
      setPlaying(v => !v);
      return;
    }
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (yt) {
      postYoutube(muted ? "unMute" : "mute");
      setMuted(v => !v);
      return;
    }
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="custom-video-player overflow-hidden rounded-[24px] border border-separator/20 bg-black shadow-ios-lg">
      <div className="relative">
        {yt ? (
          <iframe
            ref={iframeRef}
            src={yt.embed}
            title={title}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <video ref={videoRef} src={videoUrl} poster={posterUrl} className="w-full" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} controls={false} playsInline>
            <track kind="captions" />
          </video>
        )}
      </div>

      <div className="custom-video-controls">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-extrabold text-white/90">{title}</div>
          <div className="text-[10px] font-bold text-white/45">پلیر اختصاصی اتمیک</div>
        </div>
        <button type="button" onClick={togglePlay} aria-label={playing ? "توقف" : "پخش"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={muted ? "فعال کردن صدا" : "قطع صدا"}>
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => setTranslationOpen(v => !v)} aria-label="ترجمه فارسی">
          <Captions className="h-4 w-4" />
          <span className="hidden sm:inline">ترجمه</span>
        </button>
        {yt && (
          <a href={yt.watch} target="_blank" rel="noopener noreferrer" aria-label="باز کردن در یوتوب">
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {translationOpen && (
        <div className="custom-video-translation">
          ترجمه فارسی و خلاصه ویدئو از مسیر پردازش محتوای اتمیک نمایش داده می‌شود. این بخش برای اتصال به API ترجمه/زیرنویس آماده است.
        </div>
      )}
    </div>
  );
}
