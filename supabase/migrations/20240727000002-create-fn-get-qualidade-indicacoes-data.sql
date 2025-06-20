CREATE OR REPLACE FUNCTION get_qualidade_indicacoes_data(
    data_inicio_param TIMESTAMPTZ,
    data_fim_param TIMESTAMPTZ,
    empresa_id_param UUID
)
RETURNS TABLE (
    origem_nome TEXT,
    destino_nome TEXT,
    status TEXT, -- Assuming 'status' in 'oportunidades' is TEXT. Adjust if necessary.
    total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(empresa_origem.nome, 'Desconhecido') AS origem_nome,
        COALESCE(empresa_destino.nome, 'Desconhecido') AS destino_nome,
        o.status,
        COUNT(o.id) AS total
    FROM
        oportunidades o
    LEFT JOIN -- Using LEFT JOIN to include oportunidades even if one of the empresas is not found (though less likely with foreign keys)
        empresas empresa_origem ON o.empresa_origem_id = empresa_origem.id
    LEFT JOIN
        empresas empresa_destino ON o.empresa_destino_id = empresa_destino.id
    WHERE
        o.data_inicio >= data_inicio_param
        AND o.data_fim <= data_fim_param
        AND (empresa_id_param IS NULL OR o.empresa_origem_id = empresa_id_param OR o.empresa_destino_id = empresa_id_param)
    GROUP BY
        COALESCE(empresa_origem.nome, 'Desconhecido'),
        COALESCE(empresa_destino.nome, 'Desconhecido'),
        o.status;
END;
$$;
