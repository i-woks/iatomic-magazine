/**
 * AdZone — renders active ads for a placement.
 * If no active ad: renders absolutely nothing (no space, no placeholder).
 * Tracks impressions via IntersectionObserver (only when visible).
 * Tracks clicks via server redirect endpoint.
 */
import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

interface Ad {
  id: number;
  type: "manual_banner" | "google_adsense";
  label: string;
  placement: string;
  status: string;
  media_url?: string | null;
  destination_url?: string | null;
  alt?: string | null;
  adsense_client_id?: string | null;
  adsense_slot_id?: string | null;
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
      .then(d => { setAds(d.data || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [placement]);

  // Render nothing until loaded, then nothing if no ads
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

  // Impression tracking via IntersectionObserver
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

  const clickUrl = `${API_URL}/api/ads/public/${ad.id}/click`;

  if (ad.type === "google_adsense") {
    if (!ad.adsense_client_id || !ad.adsense_slot_id) return null;
    return (
      <div ref={ref} className="ad-zone my-3 overflow-hidden rounded-ios">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ad.adsense_client_id}
          data-ad-slot={ad.adsense_slot_id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Manual banner
  if (!ad.media_url) return null;
  const isVideo = ad.media_url.match(/\.(mp4|webm)$/i);

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
