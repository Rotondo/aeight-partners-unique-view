import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS = {
  'em_contato': '#FFBB28',
  'negociando': '#0088FE',
  'ganho': '#00C49F',
  'perdido': '#FF8042',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

export const OportunidadesDashboards: React.FC = () => {
  // Dados principais
  const [empresas, setEmpresas] = useState([]);
  const [matrizIntra, setMatrizIntra] = useState([]);
  const [matrizParceiros, setMatrizParceiros] = useState([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState([]);
  const [rankingEnviadas, setRankingEnviadas] = useState([]);
  const [rankingRecebidas, setRankingRecebidas] = useState([]);
  const [balanco, setBalanco] = useState([]);
  // Filtros
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [empresaId, setEmpresaId] = useState('');
  const [status, setStatus] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Busca empresas e dados
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [dataInicio, dataFim, empresaId, status, periodo]);

  async function fetchAll() {
    setLoading(true);
    try {
      // Empresas
      const { data: empresasDb } = await supabase.from("empresas").select("*").order("nome");
      setEmpresas(empresasDb || []);
      // Dados simulados - troque por fetch real (exemplo):
      const { data: oportunidadesDb } = await supabase.from("oportunidades").select("*, empresa_origem:empresas!empresa_origem_id(id, nome, tipo), empresa_destino:empresas!empresa_destino_id(id, nome, tipo)");
      const oportunidades = oportunidadesDb || [];

      // Matriz INTRAGRUPO
      const intra = empresasDb.filter(e => e.tipo === "intragrupo");
      const matrizIntraRows = intra.map(orig => {
        const row = { origem: orig.nome };
        intra.forEach(dest => {
          if (orig.id === dest.id) {
            row[dest.nome] = '-';
          } else {
            row[dest.nome] = oportunidades.filter(
              op =>
                op.empresa_origem_id === orig.id &&
                op.empresa_destino_id === dest.id &&
                op.empresa_origem.tipo === "intragrupo" &&
                op.empresa_destino.tipo === "intragrupo"
            ).length;
          }
        });
        return row;
      });
      setMatrizIntra(matrizIntraRows);

      // Matriz PARCEIROS
      const parceiros = empresasDb.filter(e => e.tipo === "parceiro");
      const matrizParceirosRows = parceiros.map(parc => {
        const row = { parceiro: parc.nome };
        intra.forEach(intraE => {
          row[intraE.nome] =
            oportunidades.filter(op =>
              (
                (op.empresa_origem_id === parc.id && op.empresa_destino_id === intraE.id) ||
                (op.empresa_origem_id === intraE.id && op.empresa_destino_id === parc.id)
              ) &&
              (
                op.empresa_origem.tipo === "parceiro" || op.empresa_destino.tipo === "parceiro"
              )
            ).length;
        });
        return row;
      });
      setMatrizParceiros(matrizParceirosRows);

      // Status - Geral
      const statusCount = {};
      oportunidades.forEach(op => {
        if (!statusCount[op.status]) statusCount[op.status] = 0;
        statusCount[op.status]++;
      });
      setStatusDistribuicao(Object.entries(statusCount).map(([status, total]) => ({ status, total })));

      // Ranking Enviadas/Recebidas
      const rankingEnv = {};
      const rankingRec = {};
      oportunidades.forEach(op => {
        // Enviadas
        if (op.empresa_origem?.nome) {
          if (!rankingEnv[op.empresa_origem.nome]) rankingEnv[op.empresa_origem.nome] = 0;
          rankingEnv[op.empresa_origem.nome]++;
        }
        // Recebidas
        if (op.empresa_destino?.nome) {
          if (!rankingRec[op.empresa_destino.nome]) rankingRec[op.empresa_destino.nome] = 0;
          rankingRec[op.empresa_destino.nome]++;
        }
      });
      setRankingEnviadas(Object.entries(rankingEnv).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));
      setRankingRecebidas(Object.entries(rankingRec).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));

      // Balanço Grupo x Parceiros
      const balGrupo = oportunidades.filter(op => op.empresa_origem.tipo === "intragrupo" && op.empresa_destino.tipo === "parceiro").length;
      const balParc = oportunidades.filter(op => op.empresa_origem.tipo === "parceiro" && op.empresa_destino.tipo === "intragrupo").length;
      setBalanco([
        { tipo: "Grupo → Parceiros", valor: balGrupo },
        { tipo: "Parceiros → Grupo", valor: balParc }
      ]);

    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Renderização - TABELA MATRIZ
  function renderMatrizTable(rows, colKey, label) {
    const cols = rows.length > 0 ? Object.keys(rows[0]).filter(c => c !== colKey) : [];
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">{label}</th>
              {cols.map(c => <th className="border p-1" key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-1 font-bold">{row[colKey]}</td>
                {cols.map(c => (
                  <td className="border p-1 text-center" key={c}>{row[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Label htmlFor="dataInicio">Data Inicial</Label>
          <DatePicker
            date={dataInicio}
            setDate={setDataInicio}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="dataFim">Data Final</Label>
          <DatePicker
            date={dataFim}
            setDate={setDataFim}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="empresaId">Empresa</Label>
          <Select
            value={empresaId === "" ? "all" : empresaId}
            onValueChange={v => setEmpresaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status === "" ? "all" : status}
            onValueChange={v => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="negociando">Negociando</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="periodo">Período</Label>
          <Select value={periodo} onValueChange={v => setPeriodo(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mensal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="intragrupo">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
          <TabsTrigger value="parcerias">Parcerias</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="intragrupo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
              <CardDescription>Quem indica para quem dentro do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                renderMatrizTable(matrizIntra, "origem", "Origem \\ Destino")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcerias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
              <CardDescription>Indicações envolvendo parceiros externos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                renderMatrizTable(matrizParceiros, "parceiro", "Parceiro \\ Intra")
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Enviadas</CardTitle>
              <CardDescription>Parceiros que mais enviam indicações</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Empresa</th>
                    <th className="border p-1">Indicações Enviadas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingEnviadas.map((r, i) => (
                    <tr key={i}>
                      <td className="border p-1">{r.empresa}</td>
                      <td className="border p-1">{r.indicacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Recebidas</CardTitle>
              <CardDescription>Parceiros que mais recebem indicações</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Empresa</th>
                    <th className="border p-1">Indicações Recebidas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingRecebidas.map((r, i) => (
                    <tr key={i}>
                      <td className="border p-1">{r.empresa}</td>
                      <td className="border p-1">{r.indicacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balanço Grupo × Parceiros</CardTitle>
              <CardDescription>Comparação entre indicações enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Tipo</th>
                    <th className="border p-1">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {balanco.map((b, i) => (
                    <tr key={i}>
                      <td className="border p-1">{b.tipo}</td>
                      <td className="border p-1">{b.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Status de todas as oportunidades</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Status</th>
                    <th className="border p-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {statusDistribuicao.map((s, i) => (
                    <tr key={i}>
                      <td className="border p-1" style={{ color: STATUS_COLORS[s.status] || undefined }}>
                        {s.status}
                      </td>
                      <td className="border p-1">{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS = {
  'em_contato': '#FFBB28',
  'negociando': '#0088FE',
  'ganho': '#00C49F',
  'perdido': '#FF8042',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

export const OportunidadesDashboards: React.FC = () => {
  // Dados principais
  const [empresas, setEmpresas] = useState([]);
  const [matrizIntra, setMatrizIntra] = useState([]);
  const [matrizParceiros, setMatrizParceiros] = useState([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState([]);
  const [rankingEnviadas, setRankingEnviadas] = useState([]);
  const [rankingRecebidas, setRankingRecebidas] = useState([]);
  const [balanco, setBalanco] = useState([]);
  // Filtros
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [empresaId, setEmpresaId] = useState('');
  const [status, setStatus] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Busca empresas e dados
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [dataInicio, dataFim, empresaId, status, periodo]);

  async function fetchAll() {
    setLoading(true);
    try {
      // Empresas
      const { data: empresasDb } = await supabase.from("empresas").select("*").order("nome");
      setEmpresas(empresasDb || []);
      // Dados simulados - troque por fetch real (exemplo):
      const { data: oportunidadesDb } = await supabase.from("oportunidades").select("*, empresa_origem:empresas!empresa_origem_id(id, nome, tipo), empresa_destino:empresas!empresa_destino_id(id, nome, tipo)");
      const oportunidades = oportunidadesDb || [];

      // Matriz INTRAGRUPO
      const intra = empresasDb.filter(e => e.tipo === "intragrupo");
      const matrizIntraRows = intra.map(orig => {
        const row = { origem: orig.nome };
        intra.forEach(dest => {
          if (orig.id === dest.id) {
            row[dest.nome] = '-';
          } else {
            row[dest.nome] = oportunidades.filter(
              op =>
                op.empresa_origem_id === orig.id &&
                op.empresa_destino_id === dest.id &&
                op.empresa_origem.tipo === "intragrupo" &&
                op.empresa_destino.tipo === "intragrupo"
            ).length;
          }
        });
        return row;
      });
      setMatrizIntra(matrizIntraRows);

      // Matriz PARCEIROS
      const parceiros = empresasDb.filter(e => e.tipo === "parceiro");
      const matrizParceirosRows = parceiros.map(parc => {
        const row = { parceiro: parc.nome };
        intra.forEach(intraE => {
          row[intraE.nome] =
            oportunidades.filter(op =>
              (
                (op.empresa_origem_id === parc.id && op.empresa_destino_id === intraE.id) ||
                (op.empresa_origem_id === intraE.id && op.empresa_destino_id === parc.id)
              ) &&
              (
                op.empresa_origem.tipo === "parceiro" || op.empresa_destino.tipo === "parceiro"
              )
            ).length;
        });
        return row;
      });
      setMatrizParceiros(matrizParceirosRows);

      // Status - Geral
      const statusCount = {};
      oportunidades.forEach(op => {
        if (!statusCount[op.status]) statusCount[op.status] = 0;
        statusCount[op.status]++;
      });
      setStatusDistribuicao(Object.entries(statusCount).map(([status, total]) => ({ status, total })));

      // Ranking Enviadas/Recebidas
      const rankingEnv = {};
      const rankingRec = {};
      oportunidades.forEach(op => {
        // Enviadas
        if (op.empresa_origem?.nome) {
          if (!rankingEnv[op.empresa_origem.nome]) rankingEnv[op.empresa_origem.nome] = 0;
          rankingEnv[op.empresa_origem.nome]++;
        }
        // Recebidas
        if (op.empresa_destino?.nome) {
          if (!rankingRec[op.empresa_destino.nome]) rankingRec[op.empresa_destino.nome] = 0;
          rankingRec[op.empresa_destino.nome]++;
        }
      });
      setRankingEnviadas(Object.entries(rankingEnv).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));
      setRankingRecebidas(Object.entries(rankingRec).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));

      // Balanço Grupo x Parceiros
      const balGrupo = oportunidades.filter(op => op.empresa_origem.tipo === "intragrupo" && op.empresa_destino.tipo === "parceiro").length;
      const balParc = oportunidades.filter(op => op.empresa_origem.tipo === "parceiro" && op.empresa_destino.tipo === "intragrupo").length;
      setBalanco([
        { tipo: "Grupo → Parceiros", valor: balGrupo },
        { tipo: "Parceiros → Grupo", valor: balParc }
      ]);

    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Renderização - TABELA MATRIZ
  function renderMatrizTable(rows, colKey, label) {
    const cols = rows.length > 0 ? Object.keys(rows[0]).filter(c => c !== colKey) : [];
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">{label}</th>
              {cols.map(c => <th className="border p-1" key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-1 font-bold">{row[colKey]}</td>
                {cols.map(c => (
                  <td className="border p-1 text-center" key={c}>{row[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Label htmlFor="dataInicio">Data Inicial</Label>
          <DatePicker
            date={dataInicio}
            setDate={setDataInicio}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="dataFim">Data Final</Label>
          <DatePicker
            date={dataFim}
            setDate={setDataFim}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="empresaId">Empresa</Label>
          <Select
            value={empresaId === "" ? "all" : empresaId}
            onValueChange={v => setEmpresaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status === "" ? "all" : status}
            onValueChange={v => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="negociando">Negociando</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="periodo">Período</Label>
          <Select value={periodo} onValueChange={v => setPeriodo(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mensal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="intragrupo">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
          <TabsTrigger value="parcerias">Parcerias</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="intragrupo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
              <CardDescription>Quem indica para quem dentro do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                renderMatrizTable(matrizIntra, "origem", "Origem \\ Destino")
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcerias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
              <CardDescription>Indicações envolvendo parceiros externos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                renderMatrizTable(matrizParceiros, "parceiro", "Parceiro \\ Intra")
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Enviadas</CardTitle>
              <CardDescription>Parceiros que mais enviam indicações</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Empresa</th>
                    <th className="border p-1">Indicações Enviadas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingEnviadas.map((r, i) => (
                    <tr key={i}>
                      <td className="border p-1">{r.empresa}</td>
                      <td className="border p-1">{r.indicacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Recebidas</CardTitle>
              <CardDescription>Parceiros que mais recebem indicações</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Empresa</th>
                    <th className="border p-1">Indicações Recebidas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingRecebidas.map((r, i) => (
                    <tr key={i}>
                      <td className="border p-1">{r.empresa}</td>
                      <td className="border p-1">{r.indicacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balanço Grupo × Parceiros</CardTitle>
              <CardDescription>Comparação entre indicações enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Tipo</th>
                    <th className="border p-1">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {balanco.map((b, i) => (
                    <tr key={i}>
                      <td className="border p-1">{b.tipo}</td>
                      <td className="border p-1">{b.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Status de todas as oportunidades</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border p-1">Status</th>
                    <th className="border p-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {statusDistribuicao.map((s, i) => (
                    <tr key={i}>
                      <td className="border p-1" style={{ color: STATUS_COLORS[s.status] || undefined }}>
                        {s.status}
                      </td>
                      <td className="border p-1">{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
