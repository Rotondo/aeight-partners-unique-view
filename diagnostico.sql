SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY table_schema, table_name;

SELECT * FROM pg_policies;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'associacoes_parceiro_etapa';
