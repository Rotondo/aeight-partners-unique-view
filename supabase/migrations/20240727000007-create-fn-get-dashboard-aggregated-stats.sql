CREATE OR REPLACE FUNCTION get_dashboard_aggregated_stats(
    oportunidade_ids_param UUID[]
)
RETURNS JSON -- Retorna um único objeto JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    opp_status TEXT;
    origem_tipo TEXT;
    destino_tipo TEXT;

    total_em_contato BIGINT := 0;
    total_negociando BIGINT := 0;
    total_proposta_enviada BIGINT := 0;
    total_aguardando_aprovacao BIGINT := 0;
    total_ganho BIGINT := 0;
    total_perdido BIGINT := 0;
    total_geral BIGINT := 0;

    intra_em_contato BIGINT := 0;
    intra_negociando BIGINT := 0;
    intra_proposta_enviada BIGINT := 0;
    intra_aguardando_aprovacao BIGINT := 0;
    intra_ganho BIGINT := 0;
    intra_perdido BIGINT := 0;
    total_intra BIGINT := 0;

    extra_em_contato BIGINT := 0;
    extra_negociando BIGINT := 0;
    extra_proposta_enviada BIGINT := 0;
    extra_aguardando_aprovacao BIGINT := 0;
    extra_ganho BIGINT := 0;
    extra_perdido BIGINT := 0;
    total_extra BIGINT := 0;

    enviadas_count BIGINT := 0;
    recebidas_count BIGINT := 0;
    saldo_count BIGINT := 0;

BEGIN
    -- Loop através das oportunidades filtradas por IDs
    FOR opp_status, origem_tipo, destino_tipo IN
        SELECT
            o.status,
            emp_origem.tipo,
            emp_destino.tipo
        FROM oportunidades o
        LEFT JOIN empresas emp_origem ON o.empresa_origem_id = emp_origem.id
        LEFT JOIN empresas emp_destino ON o.empresa_destino_id = emp_destino.id
        WHERE o.id = ANY(oportunidade_ids_param)
    LOOP
        -- Normalizar status (exemplo, se precisar de mapeamento mais complexo, ajustar aqui)
        -- Para este exemplo, assumimos que os valores de o.status já são os desejados
        -- (e.g., 'Em contato', 'Negociando', 'Proposta Enviada', 'Aguardando Aprovação', 'Ganho', 'Perdido')

        total_geral := total_geral + 1;
        CASE opp_status
            WHEN 'Em contato' THEN total_em_contato := total_em_contato + 1;
            WHEN 'Negociando' THEN total_negociando := total_negociando + 1;
            WHEN 'Proposta Enviada' THEN total_proposta_enviada := total_proposta_enviada + 1;
            WHEN 'Aguardando Aprovação' THEN total_aguardando_aprovacao := total_aguardando_aprovacao + 1;
            WHEN 'Ganho' THEN total_ganho := total_ganho + 1;
            WHEN 'Perdido' THEN total_perdido := total_perdido + 1;
            ELSE NULL; -- Não contar status não mapeados ou fazer algo diferente
        END CASE;

        -- Lógica para intra_status_counts e extra_status_counts
        IF origem_tipo = 'intragrupo' AND destino_tipo = 'intragrupo' THEN
            total_intra := total_intra + 1;
            CASE opp_status
                WHEN 'Em contato' THEN intra_em_contato := intra_em_contato + 1;
                WHEN 'Negociando' THEN intra_negociando := intra_negociando + 1;
                WHEN 'Proposta Enviada' THEN intra_proposta_enviada := intra_proposta_enviada + 1;
                WHEN 'Aguardando Aprovação' THEN intra_aguardando_aprovacao := intra_aguardando_aprovacao + 1;
                WHEN 'Ganho' THEN intra_ganho := intra_ganho + 1;
                WHEN 'Perdido' THEN intra_perdido := intra_perdido + 1;
                ELSE NULL;
            END CASE;
        ELSE -- Considerar todas as outras como 'extra'
            total_extra := total_extra + 1;
            CASE opp_status
                WHEN 'Em contato' THEN extra_em_contato := extra_em_contato + 1;
                WHEN 'Negociando' THEN extra_negociando := extra_negociando + 1;
                WHEN 'Proposta Enviada' THEN extra_proposta_enviada := extra_proposta_enviada + 1;
                WHEN 'Aguardando Aprovação' THEN extra_aguardando_aprovacao := extra_aguardando_aprovacao + 1;
                WHEN 'Ganho' THEN extra_ganho := extra_ganho + 1;
                WHEN 'Perdido' THEN extra_perdido := extra_perdido + 1;
                ELSE NULL;
            END CASE;
        END IF;

        -- Lógica para enviadas e recebidas
        IF origem_tipo = 'intragrupo' AND (destino_tipo = 'parceiro' OR destino_tipo = 'cliente') THEN
            enviadas_count := enviadas_count + 1;
        END IF;

        IF (origem_tipo = 'parceiro' OR origem_tipo = 'cliente') AND destino_tipo = 'intragrupo' THEN
            recebidas_count := recebidas_count + 1;
        END IF;

    END LOOP;

    saldo_count := enviadas_count - recebidas_count;

    -- Construir o JSON de resultado
    result := json_build_object(
        'total_status_counts', json_build_object(
            'em_contato', total_em_contato,
            'negociando', total_negociando,
            'proposta_enviada', total_proposta_enviada,
            'aguardando_aprovacao', total_aguardando_aprovacao,
            'ganho', total_ganho,
            'perdido', total_perdido,
            'total_geral', total_geral
        ),
        'intra_status_counts', json_build_object(
            'em_contato', intra_em_contato,
            'negociando', intra_negociando,
            'proposta_enviada', intra_proposta_enviada,
            'aguardando_aprovacao', intra_aguardando_aprovacao,
            'ganho', intra_ganho,
            'perdido', intra_perdido,
            'total_intra', total_intra
        ),
        'extra_status_counts', json_build_object(
            'em_contato', extra_em_contato,
            'negociando', extra_negociando,
            'proposta_enviada', extra_proposta_enviada,
            'aguardando_aprovacao', extra_aguardando_aprovacao,
            'ganho', extra_ganho,
            'perdido', extra_perdido,
            'total_extra', total_extra
        ),
        'enviadas', enviadas_count,
        'recebidas', recebidas_count,
        'saldo', saldo_count
    );

    RETURN result;
END;
$$;
