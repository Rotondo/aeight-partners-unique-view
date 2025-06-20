CREATE OR REPLACE FUNCTION get_status_distribution_data(
    data_inicio_param TIMESTAMPTZ,
    data_fim_param TIMESTAMPTZ,
    empresa_id_param UUID
)
RETURNS TABLE (
    status TEXT, -- Assuming 'status' in 'oportunidades' is TEXT.
    total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.status,
        COUNT(o.id) AS total
    FROM
        oportunidades o
    WHERE
        o.data_inicio >= data_inicio_param
        AND o.data_fim <= data_fim_param
        AND (empresa_id_param IS NULL OR o.empresa_origem_id = empresa_id_param OR o.empresa_destino_id = empresa_id_param)
    GROUP BY
        o.status
    ORDER BY
        o.status; -- Optional: Order by status name, or by total if preferred.
END;
$$;
