-- 001_alter_sales_add_payment_fields.sql

BEGIN;

-- Add status column with default
ALTER TABLE sales
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS payment_reference TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Enforce status enum via CHECK constraint (lightweight alternative to pg enum)
ALTER TABLE sales
  ADD CONSTRAINT sales_status_chk
  CHECK (status IN ('PENDING', 'PAID', 'REFUNDED', 'CANCELLED'));

-- Unique index on payment_reference (idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS sales_payment_reference_uq
  ON sales (payment_reference)
  WHERE payment_reference IS NOT NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS sales_user_ticket_idx ON sales (user_id, ticket_id);
CREATE INDEX IF NOT EXISTS sales_status_idx ON sales (status);

COMMIT;