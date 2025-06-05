
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { oportunidadeId } = await req.json();

    if (!oportunidadeId) {
      throw new Error('ID da oportunidade é obrigatório');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Buscar dados da oportunidade
    const { data: oportunidade, error: opError } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresa_origem:empresas!empresa_origem_id(nome, tipo, descricao),
        empresa_destino:empresas!empresa_destino_id(nome, tipo, descricao)
      `)
      .eq('id', oportunidadeId)
      .single();

    if (opError) throw opError;

    // Buscar parceiros com indicadores
    const { data: parceiros, error: parceirosError } = await supabase
      .from('empresas')
      .select(`
        *,
        indicadores_parceiro (*),
        empresa_categoria (
          categoria_id,
          categorias (nome, descricao)
        )
      `)
      .eq('tipo', 'parceiro')
      .eq('status', true);

    if (parceirosError) throw parceirosError;

    // Buscar histórico de oportunidades para análise de performance
    const { data: historico, error: historicoError } = await supabase
      .from('oportunidades')
      .select('empresa_destino_id, status, valor')
      .eq('status', 'ganho');

    if (historicoError) throw historicoError;

    // Calcular estatísticas de performance dos parceiros
    const performanceStats = new Map();
    historico?.forEach(op => {
      const parceiroId = op.empresa_destino_id;
      if (!performanceStats.has(parceiroId)) {
        performanceStats.set(parceiroId, { totalGanhas: 0, valorTotal: 0 });
      }
      const stats = performanceStats.get(parceiroId);
      stats.totalGanhas += 1;
      stats.valorTotal += op.valor || 0;
    });

    // Analisar compatibilidade com IA
    let aiAnalysis = null;
    if (openAIApiKey) {
      try {
        const prompt = `
Analise esta oportunidade e sugira os melhores parceiros:

Oportunidade:
- Nome: ${oportunidade.nome_lead}
- Valor: ${oportunidade.valor || 'Não informado'}
- Observações: ${oportunidade.observacoes || 'Nenhuma'}
- Empresa Origem: ${oportunidade.empresa_origem?.nome} (${oportunidade.empresa_origem?.tipo})
- Empresa Destino: ${oportunidade.empresa_destino?.nome} (${oportunidade.empresa_destino?.tipo})

Parceiros disponíveis:
${parceiros?.map(p => `
- ${p.nome}: ${p.descricao || 'Sem descrição'}
  Indicadores: ${p.indicadores_parceiro?.[0] ? 
    `Engajamento: ${p.indicadores_parceiro[0].engajamento}, 
     Potencial Leads: ${p.indicadores_parceiro[0].potencial_leads}, 
     Tamanho: ${p.indicadores_parceiro[0].tamanho}` : 'Não disponível'}
`).join('\n')}

Forneça uma análise concisa sobre qual parceiro seria mais adequado e por quê, considerando:
1. Alinhamento com o tipo de oportunidade
2. Capacidade técnica
3. Histórico de performance (se relevante)
4. Fit de mercado

Responda em formato JSON com:
{
  "analysis": "análise detalhada",
  "recommendations": [
    {
      "parceiroNome": "nome do parceiro",
      "score": número de 0-100,
      "reasoning": "justificativa específica"
    }
  ]
}
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um especialista em análise de parceiros de negócio. Responda sempre em português brasileiro e em formato JSON válido.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        const aiData = await response.json();
        const aiContent = aiData.choices?.[0]?.message?.content;
        
        if (aiContent) {
          try {
            aiAnalysis = JSON.parse(aiContent);
          } catch (parseError) {
            console.error('Erro ao fazer parse da resposta da IA:', parseError);
          }
        }
      } catch (aiError) {
        console.error('Erro na análise de IA:', aiError);
      }
    }

    // Calcular score de compatibilidade melhorado
    const parceirosComScore = parceiros?.map(parceiro => {
      const indicadores = parceiro.indicadores_parceiro?.[0];
      const performance = performanceStats.get(parceiro.id) || { totalGanhas: 0, valorTotal: 0 };
      
      let score = 0;
      let motivos = [];

      // 1. Score baseado em indicadores (40%)
      if (indicadores) {
        const scoreIndicadores = (
          indicadores.engajamento * 0.3 +
          indicadores.potencial_leads * 0.25 +
          indicadores.alinhamento * 0.25 +
          indicadores.potencial_investimento * 0.2
        ) * 0.4;
        score += scoreIndicadores;
        motivos.push(`Indicadores: ${Math.round(scoreIndicadores)}/40`);
      }

      // 2. Performance histórica (30%)
      if (performance.totalGanhas > 0) {
        const scorePerformance = Math.min(30, performance.totalGanhas * 5);
        score += scorePerformance;
        motivos.push(`${performance.totalGanhas} oportunidades ganhas`);
      }

      // 3. Adequação ao valor da oportunidade (20%)
      if (oportunidade.valor && indicadores) {
        let scoreValor = 0;
        if (oportunidade.valor > 100000 && indicadores.tamanho === 'G') {
          scoreValor = 20;
          motivos.push('Adequado para grandes valores');
        } else if (oportunidade.valor <= 50000 && ['P', 'PP'].includes(indicadores.tamanho)) {
          scoreValor = 15;
          motivos.push('Especialista em pequenos projetos');
        } else if (oportunidade.valor > 50000 && oportunidade.valor <= 100000 && ['M', 'G'].includes(indicadores.tamanho)) {
          scoreValor = 18;
          motivos.push('Adequado para projetos médios');
        } else {
          scoreValor = 10;
        }
        score += scoreValor;
      }

      // 4. Boost da análise de IA (10%)
      if (aiAnalysis?.recommendations) {
        const aiRec = aiAnalysis.recommendations.find(rec => 
          rec.parceiroNome.toLowerCase().includes(parceiro.nome.toLowerCase()) ||
          parceiro.nome.toLowerCase().includes(rec.parceiroNome.toLowerCase())
        );
        if (aiRec) {
          const aiBoost = (aiRec.score / 100) * 10;
          score += aiBoost;
          motivos.push('Recomendado pela IA');
        }
      }

      return {
        ...parceiro,
        indicadores,
        performance,
        score_compatibilidade: Math.min(100, Math.max(0, score)),
        motivos_score: motivos.join(', '),
        ai_reasoning: aiAnalysis?.recommendations?.find(rec => 
          rec.parceiroNome.toLowerCase().includes(parceiro.nome.toLowerCase())
        )?.reasoning
      };
    }) || [];

    // Ordenar por score
    parceirosComScore.sort((a, b) => b.score_compatibilidade - a.score_compatibilidade);

    console.log('Análise de IA concluída para oportunidade:', oportunidadeId);

    return new Response(
      JSON.stringify({ 
        suggestions: parceirosComScore.slice(0, 5), // Top 5
        aiAnalysis: aiAnalysis?.analysis,
        oportunidade
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função suggest-partners:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
