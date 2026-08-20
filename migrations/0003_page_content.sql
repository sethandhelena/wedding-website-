CREATE TABLE IF NOT EXISTS page_content (
  slug TEXT PRIMARY KEY,
  content_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
