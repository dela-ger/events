BEGIN;

CREATE INDEX IF NOT EXISTS tickets_event_idx ON tickets (event_id);
CREATE INDEX IF NOT EXISTS tickets_quantity_sold_idx ON tickets (quantity_sold);

COMMIT;