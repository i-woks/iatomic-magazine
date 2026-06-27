import { useEffect } from "react";
export function Seo({ title, description, ogImage }: { title: string; description?: string; ogImage?: string }) {
  useEffect(() => { document.title = title; }, [title]);
  useEffect(() => {
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); if (name.startsWith("og:") || name.startsWith("twitter:")) el.setAttribute("property", name); else el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    if (description) setMeta("description", description);
    setMeta("og:title", title);
    if (description) setMeta("og:description", description);
    setMeta("og:type", "website");
    if (ogImage) setMeta("og:image", ogImage);
    setMeta("twitter:card", "summary_large_image");
  }, [title, description, ogImage]);
  return null;
}
