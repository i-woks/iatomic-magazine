import { cn } from "@/lib/utils";
export function MarkdownRenderer({ content, className }: { content: string; className?: string }) { return <div className={cn("article-body", className)} dangerouslySetInnerHTML={{ __html: renderMd(content) }} />; }
function renderMd(md: string): string {
  let h = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  h = h.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`);
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/^#{6}\s+(.*$)/gim, "<h6>$1</h6>").replace(/^#{5}\s+(.*$)/gim, "<h5>$1</h5>").replace(/^#{4}\s+(.*$)/gim, "<h4>$1</h4>").replace(/^#{3}\s+(.*$)/gim, "<h3>$1</h3>").replace(/^#{2}\s+(.*$)/gim, "<h2>$1</h2>").replace(/^#{1}\s+(.*$)/gim, "<h1>$1</h1>");
  h = h.replace(/^>\s+(.*$)/gim, "<blockquote>$1</blockquote>");
  h = h.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  h = h.replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>").replace(/(<li>.*<\/li>)/s, m => `<ul>${m}</ul>`);
  h = h.replace(/\n\n+/g, "\n\n").split("\n\n").map(b => { const t = b.trim(); if (!t || /^<[h1-6]|<pre|<blockquote|<ul|<li/.test(t)) return t; return `<p>${t.replace(/\n/g, "<br/>")}</p>`; }).join("\n");
  return h;
}
