/**
 * AdZone — renders active MANUAL ads for a placement.
 * Google AdSense is NOT supported (removed per spec).
 * If no active ad: renders null — zero space, no placeholder.
 * Impression tracking: IntersectionObserver at 50% threshold.
 * Click tracking: server-side redirect endpoint.
 */
import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Ad {
  id: number;
  type: "manual_banner";
  label: string;
  placement: string;
  status: string;
  media_url?: string | null;
  destination_url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  aspect_ratio?: string | null;
}

interface AdZoneProps {
  placement: string;
  className?: string;
}

export function AdZone({ placement, className }: AdZoneProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/ads/public/${placement}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => { setAds((d.data || []).filter((a: Ad) => a.type === "manual_banner")); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [placement]);

  if (!loaded || ads.length === 0) return null;

  return (
    <div className={className} role="complementary" aria-label="آگهی">
      {ads.map(ad => <AdItem key={ad.id} ad={ad} />)}
    </div>
  );
}

function AdItem({ ad }: { ad: Ad }) {
  const ref = useRef<HTMLDivElement>(null);
  const impressed = useRef(false);

  useEffect(() => {
    if (!ref.current || impressed.current) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !impressed.current) {
          impressed.current = true;
          fetch(`${API_URL}/api/ads/public/${ad.id}/impression`, { method: "POST" }).catch(() => {});
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ad.id]);

  if (!ad.media_url) return null;

  const clickUrl = `${API_URL}/api/ads/public/${ad.id}/click`;
  const isVideo = /\.(mp4|webm)$/i.test(ad.media_url);

  return (
    <div ref={ref} className="ad-zone my-3">
      <a
        href={clickUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={ad.alt || ad.label || "آگهی"}
        className="block overflow-hidden rounded-ios shadow-ios transition-opacity hover:opacity-90"
      >
        {isVideo ? (
          <video
            src={ad.media_url}
            autoPlay muted loop playsInline
            className="w-full"
            style={ad.aspect_ratio ? { aspectRatio: ad.aspect_ratio } : {}}
          />
        ) : (
          <img
            src={ad.media_url}
            alt={ad.alt || ad.label || "آگهی"}
            className="w-full"
            style={ad.aspect_ratio ? { aspectRatio: ad.aspect_ratio } : {}}
            loading="lazy"
          />
        )}
      </a>
      <p className="mt-1 text-center text-[10px] text-label-quaternary">آگهی</p>
    </div>
  );
}
