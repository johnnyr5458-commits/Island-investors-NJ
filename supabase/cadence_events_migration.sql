-- Cadence Phase 1: Event Capture Layer
-- Creates the cadence_events table for universal operational activity logging.
-- Phase 2+ will add retrieval, Obsidian sync, and AI classification on top of this.

CREATE TABLE IF NOT EXISTS cadence_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type         text NOT NULL,
  timestamp    timestamptz NOT NULL DEFAULT now(),
  actor        text,
  source       text NOT NULL,
  summary      text NOT NULL,
  entity_type  text,
  entity_id    text,
  metadata     jsonb,
  importance   text NOT NULL DEFAULT 'normal' CHECK (importance IN ('normal', 'high')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cadence_events_timestamp_idx ON cadence_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS cadence_events_source_idx ON cadence_events (source, timestamp DESC);
CREATE INDEX IF NOT EXISTS cadence_events_type_idx ON cadence_events (type, timestamp DESC);

ALTER TABLE cadence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HQ authenticated users can read cadence events"
  ON cadence_events FOR SELECT
  TO authenticated USING (true);

-- updated_at auto-maintenance trigger
CREATE OR REPLACE FUNCTION set_cadence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cadence_events_updated_at
  BEFORE UPDATE ON cadence_events
  FOR EACH ROW EXECUTE FUNCTION set_cadence_updated_at();
