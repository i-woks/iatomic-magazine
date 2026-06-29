-- ===========================================================================
-- iAtomic Magazine — PostgreSQL schema (full-stack PandaStack migration)
-- Safe to run multiple times: uses CREATE TABLE IF NOT EXISTS.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  accent_color TEXT NOT NULL DEFAULT '#00A8FF',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id         SERIAL PRIMARY KEY,
  r2_key     TEXT NOT NULL UNIQUE,
  url        TEXT NOT NULL,
  alt        TEXT,
  mime_type  TEXT NOT NULL,
  size       INTEGER NOT NULL DEFAULT 0,
  width      INTEGER,
  height     INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id                      SERIAL PRIMARY KEY,
  title                   TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  excerpt                 TEXT NOT NULL,
  content                 TEXT NOT NULL,
  cover_image_id          INTEGER REFERENCES media(id) ON DELETE SET NULL,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id             INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  reading_time            INTEGER NOT NULL DEFAULT 0,
  meta_title              TEXT,
  meta_description        TEXT,
  canonical_url           TEXT,
  sources                 TEXT,
  video_url               TEXT,
  video_poster            TEXT,
  telegram_discussion_url TEXT,
  view_count              INTEGER NOT NULL DEFAULT 0,
  like_count              INTEGER NOT NULL DEFAULT 0,
  featured                BOOLEAN NOT NULL DEFAULT FALSE,
  published_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category    ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published   ON posts(published_at DESC);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id             SERIAL PRIMARY KEY,
  category       TEXT NOT NULL,
  message        TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','archived')),
  source_page    TEXT,
  telegram_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_error TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ads (
  id                SERIAL PRIMARY KEY,
  type              TEXT NOT NULL DEFAULT 'manual_banner',
  label             TEXT NOT NULL,
  placement         TEXT NOT NULL DEFAULT 'homepage_top_above_donation',
  status            TEXT NOT NULL DEFAULT 'inactive',
  media_id          INTEGER REFERENCES media(id) ON DELETE SET NULL,
  destination_url   TEXT,
  alt               TEXT,
  html_snippet      TEXT,
  adsense_client_id TEXT,
  adsense_slot_id   TEXT,
  width             INTEGER,
  height            INTEGER,
  aspect_ratio      TEXT,
  priority          INTEGER NOT NULL DEFAULT 0,
  starts_at         TEXT,
  ends_at           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_metrics (
  ad_id              INTEGER PRIMARY KEY REFERENCES ads(id) ON DELETE CASCADE,
  impressions        INTEGER NOT NULL DEFAULT 0,
  clicks             INTEGER NOT NULL DEFAULT 0,
  last_impression_at TEXT,
  last_click_at      TEXT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI processing jobs / logs (replaces the settings-blob log store)
CREATE TABLE IF NOT EXISTS ai_logs (
  id                 SERIAL PRIMARY KEY,
  action             TEXT NOT NULL DEFAULT 'run',
  status             TEXT NOT NULL,
  message            TEXT NOT NULL DEFAULT '',
  articles_generated INTEGER NOT NULL DEFAULT 0,
  payload            JSONB,
  run_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telegram_events (
  id          SERIAL PRIMARY KEY,
  update_id   BIGINT,
  kind        TEXT NOT NULL,
  chat_id     TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
