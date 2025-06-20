CREATE OR REPLACE FUNCTION get_matriz_intragrupo_data(
    data_inicio_param TIMESTAMPTZ,
    data_fim_param TIMESTAMPTZ,
    empresa_id_param UUID,
    status_param TEXT
)
RETURNS TABLE (
    origem_nome TEXT,
    destino_nome TEXT,
    total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        empresa_origem.nome AS origem_nome,
        empresa_destino.nome AS destino_nome,
        COUNT(o.id) AS total
    FROM
        oportunidades o
    JOIN
        empresas empresa_origem ON o.empresa_origem_id = empresa_origem.id
    JOIN
        empresas empresa_destino ON o.empresa_destino_id = empresa_destino.id
    WHERE
        empresa_origem.tipo = 'intragrupo' AND empresa_destino.tipo = 'intragrupo'
        AND o.data_inicio >= data_inicio_param
        AND o.data_fim <= data_fim_param
        AND (empresa_id_param IS NULL OR o.empresa_origem_id = empresa_id_param OR o.empresa_destino_id = empresa_id_param)
        AND (status_param IS NULL OR o.status = status_param)
    GROUP BY
        empresa_origem.nome,
        empresa_destino.nome;
END;
$$;
