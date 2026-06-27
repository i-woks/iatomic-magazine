CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category` text NOT NULL,
  `message` text NOT NULL,
  `status` text NOT NULL DEFAULT 'new',
  `source_page` text,
  `telegram_sent` integer NOT NULL DEFAULT 0,
  `telegram_error` text,
  `created_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
