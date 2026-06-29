/**
 * Helpers to invoke the polyglot workers:
 *  - Python AI worker  (server/python/ai_worker.py)
 *  - Go text processor (server/go binary or `go run` fallback)
 * Each falls back to a pure-JS implementation when the runtime/binary is
 * unavailable, so the API never hard-fails because of a missing toolchain.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/runners.js -> server root is one level up from dist
const SERVER_ROOT = join(__dirname, "..");

function run(cmd: string, args: string[], input: string, timeoutMs = 20000): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"] });
    } catch {
      return resolve({ ok: false, stdout: "", stderr: "spawn failed" });
    }
    let stdout = "", stderr = "";
    const timer = setTimeout(() => { child.kill("SIGKILL"); resolve({ ok: false, stdout, stderr: "timeout" }); }, timeoutMs);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", () => { clearTimeout(timer); resolve({ ok: false, stdout, stderr: "error" }); });
    child.on("close", (code) => { clearTimeout(timer); resolve({ ok: code === 0, stdout, stderr }); });
    child.stdin.write(input);
    child.stdin.end();
  });
}

const PY = process.env.PYTHON_BIN || "python3";

export async function runPythonAi(payload: unknown): Promise<any> {
  const script = join(SERVER_ROOT, "python", "ai_worker.py");
  if (existsSync(script)) {
    const r = await run(PY, [script], JSON.stringify(payload));
    if (r.ok && r.stdout.trim()) {
      try { return JSON.parse(r.stdout); } catch { /* fall through to JS fallback */ }
    }
  }
  return jsAiFallback(payload as any);
}

export async function runGoStats(payload: { text: string }): Promise<any> {
  const binary = join(SERVER_ROOT, "go", "processor");
  const input = JSON.stringify(payload);
  if (existsSync(binary)) {
    const r = await run(binary, [], input);
    if (r.ok && r.stdout.trim()) { try { return JSON.parse(r.stdout); } catch { /* */ } }
  }
  // try `go run` as a dev fallback
  const main = join(SERVER_ROOT, "go", "cmd", "processor", "main.go");
  if (existsSync(main)) {
    const r = await run("go", ["run", main], input, 60000);
    if (r.ok && r.stdout.trim()) { try { return JSON.parse(r.stdout); } catch { /* */ } }
  }
  return jsStatsFallback(payload.text || "");
}

// ── Pure-JS fallbacks ─────────────────────────────────────────────────
function jsStatsFallback(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const freq = new Map<string, number>();
  for (const w of words.map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""))) {
    if (w.length < 3) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
  return {
    word_count: words.length,
    estimated_reading_time: Math.max(1, Math.ceil(words.length / 200)),
    top_keywords: top,
    engine: "js-fallback",
  };
}

function jsAiFallback(payload: { action?: string; text?: string }) {
  const text = payload.text || "";
  const words = text.trim().split(/\s+/).filter(Boolean);
  switch (payload.action) {
    case "summarize":
      return { action: "summarize", summary: text.split(/(?<=[.!؟?])\s+/).slice(0, 2).join(" ").slice(0, 280), engine: "js-fallback" };
    case "suggest_tags": {
      const freq = new Map<string, number>();
      for (const w of words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))) {
        if (w.length < 4) continue;
        freq.set(w, (freq.get(w) || 0) + 1);
      }
      const tags = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
      return { action: "suggest_tags", tags, engine: "js-fallback" };
    }
    case "translate_video_stub":
      return { action: "translate_video_stub", status: "stub", message: "Video translation is not configured.", engine: "js-fallback" };
    case "quality_check":
    default:
      return {
        action: "quality_check",
        word_count: words.length,
        passed: words.length >= 50,
        issues: words.length < 50 ? ["متن کوتاه است."] : [],
        engine: "js-fallback",
      };
  }
}
