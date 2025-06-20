CREATE OR REPLACE FUNCTION get_ranking_parceiros_recebidas_data(
    data_inicio_param TIMESTAMPTZ,
    data_fim_param TIMESTAMPTZ,
    status_param TEXT
)
RETURNS TABLE (
    parceiro_nome TEXT,
    indicacoes_total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(empresa_destino.nome, 'Desconhecido') AS parceiro_nome,
        COUNT(o.id) AS indicacoes_total
    FROM
        oportunidades o
    JOIN
        empresas empresa_origem ON o.empresa_origem_id = empresa_origem.id
    JOIN
        empresas empresa_destino ON o.empresa_destino_id = empresa_destino.id
    WHERE
        empresa_origem.tipo = 'intragrupo' AND empresa_destino.tipo = 'parceiro'
        AND o.data_inicio >= data_inicio_param
        AND o.data_fim <= data_fim_param
        AND (status_param IS NULL OR o.status = status_param)
    GROUP BY
        COALESCE(empresa_destino.nome, 'Desconhecido')
    ORDER BY
        indicacoes_total DESC;
END;
$$;
