-- Phase 4: Cadence Retrieval Layer
-- Adds full-text search to cadence_events and recursive relationship graph traversal.

-- ── Full-Text Search ──────────────────────────────────────────────────────────

ALTER TABLE cadence_events
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS cadence_events_search_idx
  ON cadence_events USING gin(search_vector);

CREATE OR REPLACE FUNCTION cadence_events_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('english',
      coalesce(NEW.summary, '') || ' ' ||
      coalesce(NEW.type, '')    || ' ' ||
      coalesce(NEW.source, '')  || ' ' ||
      coalesce(NEW.entity_type, '') || ' ' ||
      coalesce(NEW.actor, '')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cadence_events_search_trigger ON cadence_events;
CREATE TRIGGER cadence_events_search_trigger
  BEFORE INSERT OR UPDATE ON cadence_events
  FOR EACH ROW EXECUTE FUNCTION cadence_events_search_vector_update();

-- Backfill existing rows so FTS works immediately
UPDATE cadence_events
SET search_vector =
  to_tsvector('english',
    coalesce(summary, '')      || ' ' ||
    coalesce(type, '')         || ' ' ||
    coalesce(source, '')       || ' ' ||
    coalesce(entity_type, '')  || ' ' ||
    coalesce(actor, '')
  );

-- ── Relationship Graph Traversal ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_cadence_entity_graph(
  p_entity_type text,
  p_entity_id   text,
  p_max_depth   int DEFAULT 2
)
RETURNS TABLE(
  entity_type_a text,
  entity_id_a   text,
  relationship  text,
  entity_type_b text,
  entity_id_b   text,
  depth         int
)
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE entity_graph AS (
    -- Base: direct relationships involving this entity
    SELECT
      c.entity_type_a, c.entity_id_a,
      c.relationship,
      c.entity_type_b, c.entity_id_b,
      1 AS depth
    FROM cadence_contexts c
    WHERE (c.entity_type_a = p_entity_type AND c.entity_id_a = p_entity_id)
       OR (c.entity_type_b = p_entity_type AND c.entity_id_b = p_entity_id)

    UNION ALL

    -- Recursive: traverse outward from each discovered node
    SELECT
      c.entity_type_a, c.entity_id_a,
      c.relationship,
      c.entity_type_b, c.entity_id_b,
      eg.depth + 1
    FROM cadence_contexts c
    INNER JOIN entity_graph eg ON
      (c.entity_type_a = eg.entity_type_b AND c.entity_id_a = eg.entity_id_b)
      OR (c.entity_type_b = eg.entity_type_a AND c.entity_id_b = eg.entity_id_a)
    WHERE eg.depth < p_max_depth
  )
  SELECT DISTINCT
    entity_type_a, entity_id_a, relationship, entity_type_b, entity_id_b, depth
  FROM entity_graph;
$$;
