
-- Add new enum for pipeline phases
CREATE TYPE pipeline_fase_enum AS ENUM (
  'aprovado',
  'planejado', 
  'apresentado',
  'aguardando_feedback',
  'convertido',
  'rejeitado'
);

-- Add new fields to wishlist_apresentacoes table
ALTER TABLE wishlist_apresentacoes 
ADD COLUMN executivo_responsavel_id uuid REFERENCES usuarios(id),
ADD COLUMN data_planejada timestamp with time zone,
ADD COLUMN fase_pipeline pipeline_fase_enum DEFAULT 'aprovado';

-- Update existing records to have a default phase
UPDATE wishlist_apresentacoes 
SET fase_pipeline = 'aprovado' 
WHERE fase_pipeline IS NULL;

-- Create index for better performance on pipeline queries
CREATE INDEX idx_wishlist_apresentacoes_fase_pipeline ON wishlist_apresentacoes(fase_pipeline);
CREATE INDEX idx_wishlist_apresentacoes_executivo ON wishlist_apresentacoes(executivo_responsavel_id);
