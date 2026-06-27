-- Ads system migration
CREATE TABLE IF NOT EXISTS `ads` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `type` text NOT NULL DEFAULT 'manual_banner',
  `label` text NOT NULL,
  `placement` text NOT NULL DEFAULT 'homepage_top_above_donation',
  `status` text NOT NULL DEFAULT 'inactive',
  `media_id` integer,
  `destination_url` text,
  `alt` text,
  `html_snippet` text,
  `adsense_client_id` text,
  `adsense_slot_id` text,
  `width` integer,
  `height` integer,
  `aspect_ratio` text,
  `priority` integer NOT NULL DEFAULT 0,
  `starts_at` text,
  `ends_at` text,
  `created_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS `ad_metrics` (
  `ad_id` integer PRIMARY KEY NOT NULL,
  `impressions` integer NOT NULL DEFAULT 0,
  `clicks` integer NOT NULL DEFAULT 0,
  `last_impression_at` text,
  `last_click_at` text,
  `updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
