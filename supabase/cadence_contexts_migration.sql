-- Cadence Phase 2: Context Relationship Layer
-- Stores lightweight directional relationships between operational entities.
-- Extensible foundation for retrieval, summaries, and timeline reconstruction.
-- Phase 3+ will query these relationships for Obsidian sync and contextual search.

CREATE TABLE IF NOT EXISTS cadence_contexts (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type_a   text NOT NULL,
  entity_id_a     text NOT NULL,
  relationship    text NOT NULL,
  entity_type_b   text NOT NULL,
  entity_id_b     text NOT NULL,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint prevents duplicate relationships (insert is idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS cadence_contexts_unique_idx
  ON cadence_contexts (entity_type_a, entity_id_a, relationship, entity_type_b, entity_id_b);

CREATE INDEX IF NOT EXISTS cadence_contexts_a_idx ON cadence_contexts (entity_type_a, entity_id_a);
CREATE INDEX IF NOT EXISTS cadence_contexts_b_idx ON cadence_contexts (entity_type_b, entity_id_b);

ALTER TABLE cadence_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HQ authenticated users can read cadence contexts"
  ON cadence_contexts FOR SELECT
  TO authenticated USING (true);
