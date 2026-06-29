#!/usr/bin/env python3
"""
iAtomic AI worker.

Reads a single JSON object on stdin and writes a single JSON object on stdout.

Supported actions:
  - summarize            -> { summary }
  - suggest_tags         -> { tags: [...] }
  - translate_video_stub -> { status, message }
  - quality_check        -> { passed, issues, word_count }

If AI_API_KEY (+ AI_API_BASE_URL, AI_MODEL) are set, an OpenAI-compatible
Chat Completions endpoint is used. Otherwise a deterministic local fallback
runs so the worker never hard-fails.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.error

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "are", "was", "were",
    "و", "در", "به", "از", "که", "را", "با", "این", "آن", "برای", "است", "های",
    "یک", "تا", "هم", "بر", "یا", "می", "شد", "شده", "خود", "ما", "بود",
}


def read_input():
    raw = sys.stdin.read()
    try:
        return json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        return {}


def tokenize(text):
    return [w for w in re.findall(r"[\w؀-ۿ]+", text.lower()) if len(w) >= 3 and w not in STOPWORDS]


def keyword_freq(text):
    freq = {}
    for w in tokenize(text):
        freq[w] = freq.get(w, 0) + 1
    return sorted(freq.items(), key=lambda kv: kv[1], reverse=True)


def split_sentences(text):
    parts = re.split(r"(?<=[.!؟?])\s+|\n+", text.strip())
    return [p.strip() for p in parts if p.strip()]


# Optional remote AI call
def ai_available():
    return bool(os.environ.get("AI_API_KEY"))


def call_ai(system, user):
    key = os.environ.get("AI_API_KEY")
    base = os.environ.get("AI_API_BASE_URL", "https://api.deepseek.com").rstrip("/")
    model = os.environ.get("AI_MODEL", "deepseek-chat")
    if not key:
        return None
    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.4,
        "max_tokens": 800,
    }).encode("utf-8")
    req = urllib.request.Request(
        base + "/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except (urllib.error.URLError, KeyError, TimeoutError, json.JSONDecodeError):
        return None


def action_summarize(payload):
    text = payload.get("text", "")
    if ai_available():
        out = call_ai(
            "خلاصه‌نویس علمی فارسی هستی. خلاصه‌ای کوتاه و دقیق بنویس.",
            "این متن را در حداکثر سه جمله خلاصه کن:\n\n" + text,
        )
        if out:
            return {"action": "summarize", "summary": out.strip(), "engine": "remote-ai"}
    summary = " ".join(split_sentences(text)[:2])[:300]
    return {"action": "summarize", "summary": summary, "engine": "local-fallback"}


def action_suggest_tags(payload):
    text = (payload.get("title", "") + " " + payload.get("text", "")).strip()
    if ai_available():
        out = call_ai(
            "متخصص برچسب‌گذاری مقالات علمی فارسی هستی. فقط فهرستی از برچسب‌ها را با کاما برگردان.",
            "حداکثر پنج برچسب کوتاه برای این متن پیشنهاد بده:\n\n" + text,
        )
        if out:
            tags = [t.strip(" #،,") for t in re.split(r"[،,\n]", out) if t.strip()][:5]
            if tags:
                return {"action": "suggest_tags", "tags": tags, "engine": "remote-ai"}
    tags = [w for w, _ in keyword_freq(text)[:5]]
    return {"action": "suggest_tags", "tags": tags, "engine": "local-fallback"}


def action_translate_video_stub(payload):
    return {
        "action": "translate_video_stub",
        "status": "stub",
        "video_url": payload.get("video_url") or payload.get("text", ""),
        "message": "Video transcription/translation pipeline is not configured in this environment.",
        "engine": "local-fallback",
    }


def action_quality_check(payload):
    text = payload.get("text", "")
    words = tokenize(text)
    issues = []
    if len(words) < 50:
        issues.append("متن بسیار کوتاه است (کمتر از ۵۰ کلمهٔ معنادار).")
    if "http://" in text:
        issues.append("استفاده از لینک ناامن (http) توصیه نمی‌شود.")
    if not re.search(r"[.!؟?]", text):
        issues.append("متن فاقد نشانه‌گذاری پایان جمله است.")
    return {
        "action": "quality_check",
        "passed": len(issues) == 0,
        "issues": issues,
        "word_count": len(words),
        "engine": "local-fallback",
    }


ACTIONS = {
    "summarize": action_summarize,
    "suggest_tags": action_suggest_tags,
    "translate_video_stub": action_translate_video_stub,
    "quality_check": action_quality_check,
}


def main():
    payload = read_input()
    action = payload.get("action", "quality_check")
    handler = ACTIONS.get(action)
    if not handler:
        print(json.dumps({"error": "unknown action: " + str(action), "engine": "local-fallback"}, ensure_ascii=False))
        return
    print(json.dumps(handler(payload), ensure_ascii=False))


if __name__ == "__main__":
    main()
