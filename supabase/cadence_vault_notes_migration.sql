-- cadence_vault_notes: stores auto-generated entity notes from Cadence sync cron
-- Run in Supabase SQL Editor before deploying cadence-sync cron route

CREATE TABLE IF NOT EXISTS cadence_vault_notes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   text        NOT NULL,
  entity_id     text        NOT NULL,
  note_content  text        NOT NULL,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_cvn_entity    ON cadence_vault_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cvn_generated ON cadence_vault_notes(generated_at DESC);

ALTER TABLE cadence_vault_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hq_read_vault_notes" ON cadence_vault_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'team')
        AND status = 'active'
    )
  );

CREATE TRIGGER update_cadence_vault_notes_updated_at
  BEFORE UPDATE ON cadence_vault_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
