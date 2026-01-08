-- 002_create_payments.sql

BEGIN;

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  payment_reference TEXT NOT NULL UNIQUE,
  gateway TEXT NOT NULL DEFAULT 'paystack',
  currency TEXT NOT NULL,              -- e.g., 'GHS'
  amount_cents BIGINT NOT NULL,        -- minor units
  status TEXT NOT NULL DEFAULT 'INITIALIZED',
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Status constraint
ALTER TABLE payments
  ADD CONSTRAINT payments_status_chk
  CHECK (status IN ('INITIALIZED', 'SUCCESS', 'FAILED'));

-- Indexes
CREATE INDEX IF NOT EXISTS payments_user_idx ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
CREATE INDEX IF NOT EXISTS payments_created_idx ON payments (created_at);

COMMIT;