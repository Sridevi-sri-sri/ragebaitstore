-- ─────────────────────────────────────────────────────────────────────────────
--  RageBait Store — Supabase SQL Migration
--  Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--  Safe to run multiple times: uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════
--  EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════════
--  TABLE: products
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS products (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  price       NUMERIC     NOT NULL CHECK (price >= 0),
  image_url   TEXT        NOT NULL DEFAULT '',
  category    TEXT        NOT NULL DEFAULT '',
  stock       INT         NOT NULL DEFAULT 0 CHECK (stock >= 0),
  slug        TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);


-- ═══════════════════════════════════════════════════════════════════
--  TABLE: cart_items
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT        NOT NULL,               -- Firebase UID
  product_id  UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  quantity    INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)                    -- one row per user/product pair
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items (user_id);


-- ═══════════════════════════════════════════════════════════════════
--  TABLE: orders
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              TEXT        NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total_amount         NUMERIC     NOT NULL CHECK (total_amount >= 0),
  shipping_name        TEXT        NOT NULL DEFAULT '',
  shipping_address     TEXT        NOT NULL DEFAULT '',
  shipping_city        TEXT        NOT NULL DEFAULT '',
  shipping_postal_code TEXT        NOT NULL DEFAULT '',
  shipping_phone       TEXT        NOT NULL DEFAULT '',
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay   ON orders (razorpay_order_id);


-- ═══════════════════════════════════════════════════════════════════
--  TABLE: order_items
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID    NOT NULL REFERENCES orders   (id) ON DELETE CASCADE,
  product_id  UUID    NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  quantity    INT     NOT NULL CHECK (quantity > 0),
  price       NUMERIC NOT NULL CHECK (price >= 0)   -- snapshot of price at purchase time
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);


-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

-- ── products: publicly readable, no writes via anon key ──────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are publicly readable" ON products;
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (true);


-- ── cart_items: users can only see/manage their own rows ─────────
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own cart" ON cart_items;
CREATE POLICY "Users manage their own cart"
  ON cart_items FOR ALL
  USING      (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');


-- ── orders: users can only see/create their own orders ───────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own orders" ON orders;
CREATE POLICY "Users manage their own orders"
  ON orders FOR ALL
  USING      (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');


-- ── order_items: readable when the parent order belongs to user ──
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own order items" ON order_items;
CREATE POLICY "Users read their own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );


-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA  (8 realistic products)
--  ON CONFLICT DO NOTHING keeps this idempotent on re-runs.
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO products (id, name, description, price, image_url, category, stock, slug)
VALUES
  (
    uuid_generate_v4(),
    'Chaos Theory Tee',
    'Wear your disorder proudly. Ultra-soft 100% cotton with a chaotic graphic print designed to start conversations.',
    649,
    'https://placehold.co/600x600/e63946/ffffff?text=Chaos+Tee',
    'tees',
    120,
    'chaos-theory-tee'
  ),
  (
    uuid_generate_v4(),
    'Rage Bait Hoodie',
    'The hoodie that provokes. Heavyweight fleece, kangaroo pocket, and embroidered logo that says everything without saying anything.',
    1499,
    'https://placehold.co/600x600/1d3557/f1faee?text=Rage+Hoodie',
    'hoodies',
    75,
    'rage-bait-hoodie'
  ),
  (
    uuid_generate_v4(),
    'Main Character Cap',
    'Structured 6-panel cap with embroidered text. Adjustable strap. Because every story needs a protagonist.',
    499,
    'https://placehold.co/600x600/f4a261/ffffff?text=Main+Cap',
    'accessories',
    200,
    'main-character-cap'
  ),
  (
    uuid_generate_v4(),
    'Unfiltered Graphic Tee',
    'Bold, raw, unapologetic. Screen-printed heavyweight tee with a design that refuses to be ignored.',
    749,
    'https://placehold.co/600x600/e63946/ffffff?text=Unfiltered+Tee',
    'tees',
    95,
    'unfiltered-graphic-tee'
  ),
  (
    uuid_generate_v4(),
    'Loud Mouth Zip Hoodie',
    'Full-zip fleece hoodie with contrast lining. Say what everyone''s thinking without opening your mouth.',
    1799,
    'https://placehold.co/600x600/1d3557/f4a261?text=Loud+Hoodie',
    'hoodies',
    50,
    'loud-mouth-zip-hoodie'
  ),
  (
    uuid_generate_v4(),
    'Provocateur Tote',
    'Heavy-duty canvas tote with a slogan that makes people look twice. Fits a laptop. Starts arguments.',
    399,
    'https://placehold.co/600x600/0d1117/e63946?text=Tote+Bag',
    'accessories',
    300,
    'provocateur-tote'
  ),
  (
    uuid_generate_v4(),
    'Hypebeast Killer Tee',
    'Anti-hype statement tee. Vintage wash, relaxed fit, oversized print. The most ironic shirt in any room.',
    699,
    'https://placehold.co/600x600/e63946/ffffff?text=Hypebeast+Tee',
    'tees',
    110,
    'hypebeast-killer-tee'
  ),
  (
    uuid_generate_v4(),
    'Dissent Enamel Pin Set',
    'Set of 3 hard-enamel pins. Pin them on your bag, jacket, or wherever you need a little extra attitude.',
    299,
    'https://placehold.co/600x600/f4a261/0d1117?text=Pin+Set',
    'accessories',
    400,
    'dissent-enamel-pin-set'
  )
ON CONFLICT (slug) DO NOTHING;
