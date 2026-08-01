CREATE TABLE IF NOT EXISTS Product (
  id         TEXT    PRIMARY KEY,
  slug       TEXT    UNIQUE NOT NULL,
  name       TEXT    NOT NULL,
  description TEXT,
  priceMinor INTEGER NOT NULL,
  currency   TEXT    NOT NULL DEFAULT 'IDR',
  stockQty   INTEGER NOT NULL DEFAULT 0,
  weightGrams INTEGER,
  isActive   INTEGER NOT NULL DEFAULT 1,
  createdAt  TEXT    NOT NULL DEFAULT (datetime('now')),
  updatedAt  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ProductImage (
  id        TEXT    PRIMARY KEY,
  productId TEXT    NOT NULL REFERENCES Product(id) ON DELETE CASCADE,
  url       TEXT    NOT NULL,
  alt       TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_slug     ON Product(slug);
CREATE INDEX IF NOT EXISTS idx_product_active   ON Product(isActive);
CREATE INDEX IF NOT EXISTS idx_image_product_id ON ProductImage(productId);
