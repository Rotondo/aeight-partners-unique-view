CREATE OR REPLACE FUNCTION get_balanco_grupo_parcerias_data(
    data_inicio_param TIMESTAMPTZ,
    data_fim_param TIMESTAMPTZ,
    empresa_id_param UUID,
    status_param TEXT
)
RETURNS TABLE (
    enviadas_count BIGINT,
    recebidas_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (
            SELECT COUNT(o1.id)
            FROM oportunidades o1
            JOIN empresas eo1 ON o1.empresa_origem_id = eo1.id
            JOIN empresas ed1 ON o1.empresa_destino_id = ed1.id
            WHERE
                eo1.tipo = 'intragrupo' AND ed1.tipo = 'parceiro'
                AND o1.data_inicio >= data_inicio_param
                AND o1.data_fim <= data_fim_param
                AND (status_param IS NULL OR o1.status = status_param)
                AND (empresa_id_param IS NULL OR o1.empresa_origem_id = empresa_id_param OR o1.empresa_destino_id = empresa_id_param)
        ) AS enviadas_count,
        (
            SELECT COUNT(o2.id)
            FROM oportunidades o2
            JOIN empresas eo2 ON o2.empresa_origem_id = eo2.id
            JOIN empresas ed2 ON o2.empresa_destino_id = ed2.id
            WHERE
                eo2.tipo = 'parceiro' AND ed2.tipo = 'intragrupo'
                AND o2.data_inicio >= data_inicio_param
                AND o2.data_fim <= data_fim_param
                AND (status_param IS NULL OR o2.status = status_param)
                AND (empresa_id_param IS NULL OR o2.empresa_origem_id = empresa_id_param OR o2.empresa_destino_id = empresa_id_param)
        ) AS recebidas_count;
END;
$$;
