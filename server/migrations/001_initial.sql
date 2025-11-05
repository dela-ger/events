-- companies
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    contact_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- users roles
CREATE TYPE user_role AS ENUM ('company_admin', 'attendee');

-- users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- events status
CREATE TYPE event_status AS ENUM ('draft', 'published');

-- events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    highlights JSONB DEFAULT '[]',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    venue TEXT,
    banner_url TEXT,
    status event_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tickets
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id  INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    quantity_total INTEGER NOT NULL CHECK (quantity_total >= 0),
    quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
    per_user_limit INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- order status
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'refunded', 'cancelled');

-- orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- order items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_cents_snapshot INTEGER NOT NULL CHECK (price_cents_snapshot >= 0)
);

-- attendee tickets
CREATE TABLE IF NOT EXISTS attendee_tickets (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    ticket_code TEXT UNIQUE NOT NULL,
    qr_svg_url TEXT,
    redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_events_company ON events(company_id);
CREATE INDEX IF NOT EXISTS idx_tickests_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);