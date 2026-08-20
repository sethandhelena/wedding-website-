CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attendance TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  meal TEXT,
  dietary TEXT,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);

CREATE TABLE IF NOT EXISTS registry_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  featured INTEGER NOT NULL DEFAULT 0,
  image_class TEXT,
  image_url TEXT,
  gift_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registry_store ON registry_items(store);
CREATE INDEX IF NOT EXISTS idx_registry_sort ON registry_items(sort_order, id);

CREATE TABLE IF NOT EXISTS journal_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT,
  post_date TEXT,
  excerpt TEXT,
  content TEXT,
  image_class TEXT,
  image_url TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_journal_published ON journal_posts(published, sort_order, id);
