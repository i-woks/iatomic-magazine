-- Add showcase and engagement fields to posts table
ALTER TABLE posts ADD COLUMN video_url text;
ALTER TABLE posts ADD COLUMN video_poster text;
ALTER TABLE posts ADD COLUMN telegram_discussion_url text;
ALTER TABLE posts ADD COLUMN view_count integer DEFAULT 0 NOT NULL;
ALTER TABLE posts ADD COLUMN like_count integer DEFAULT 0 NOT NULL;
ALTER TABLE posts ADD COLUMN featured integer DEFAULT 0 NOT NULL;
