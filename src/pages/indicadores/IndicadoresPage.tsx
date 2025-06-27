
import React, { useState, useEffect } from "react";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { supabase } from "@/lib/supabase";
import { IndicadoresParceiro, Empresa, Oportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { IndicadoresParceiroWithEmpresa } from "./types";
import { IndicadoresFilters } from "./components/IndicadoresFilters";
import { IndicadoresCharts } from "./components/IndicadoresCharts";
import { IndicadoresTable } from "./components/IndicadoresTable";
import { exportToCSV } from "./utils";

const IndicadoresPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [filteredIndicadores, setFilteredIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("empresa");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const { toast } = useToast();
  const { isDemoMode } = usePrivacy();

  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<IndicadoresParceiro>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: indicadoresData, error: indicadoresError } = await supabase
        .from("indicadores_parceiro")
        .select("*")
        .order("data_avaliacao", { ascending: false });
      if (indicadoresError) throw indicadoresError;

      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .eq("tipo", "parceiro")
        .eq("status", true)
        .order("nome");
      if (empresasError) throw empresasError;

      const { data: oportunidadesData, error: oportunidadesError } = await supabase
        .from("oportunidades")
        .select("id, empresa_origem_id");
      if (oportunidadesError) throw oportunidadesError;

      let allIndicadores: IndicadoresParceiroWithEmpresa[] = indicadoresData.map(
        (indicador: any) => {
          const empresa = empresasData.find((e: any) => e.id === indicador.empresa_id);
          return {
            ...indicador,
            empresa: empresa ? { id: empresa.id, nome: empresa.nome } : undefined,
          };
        }
      );

      const uniqueIndicadores: Record<string, IndicadoresParceiroWithEmpresa> = {};
      for (const indicador of allIndicadores) {
        if (!uniqueIndicadores[indicador.empresa_id]) {
          uniqueIndicadores[indicador.empresa_id] = indicador;
        }
      }
      let indicadoresUnicos = Object.values(uniqueIndicadores);

      const indicadoresComOportunidades = indicadoresUnicos.map((indicador) => {
        const oportunidadesDoParceiro = oportunidadesData.filter(
          (o: any) => o.empresa_origem_id === indicador.empresa_id
        ).length;
        let share = undefined;
        if (indicador.base_clientes && indicador.base_clientes > 0) {
          share = (oportunidadesDoParceiro / indicador.base_clientes) * 100;
        }
        return {
          ...indicador,
          oportunidadesIndicadas: oportunidadesDoParceiro,
          share_of_wallet: share,
        };
      });

      setIndicadores(indicadoresComOportunidades);
      setEmpresas(empresasData as Empresa[]);
      setOportunidades(oportunidadesData as Oportunidade[]);
      setFilteredIndicadores(indicadoresComOportunidades);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os indicadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filt = indicadores;
    if (searchTerm) {
      filt = filt.filter((ind) =>
        (ind.empresa?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedEmpresa && selectedEmpresa !== "all") {
      filt = filt.filter((ind) => ind.empresa_id === selectedEmpresa);
    }
    filt = [...filt].sort((a, b) => {
      let vA: any, vB: any;
      if (sortColumn === "empresa") {
        vA = a.empresa?.nome || "";
        vB = b.empresa?.nome || "";
      } else if (sortColumn === "share_of_wallet") {
        vA = a.share_of_wallet ?? -1;
        vB = b.share_of_wallet ?? -1;
      } else if (sortColumn === "oportunidadesIndicadas") {
        vA = a.oportunidadesIndicadas ?? 0;
        vB = b.oportunidadesIndicadas ?? 0;
      } else {
        vA = (a as any)[sortColumn] ?? "";
        vB = (b as any)[sortColumn] ?? "";
      }
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });
    setFilteredIndicadores(filt);
  }, [indicadores, searchTerm, selectedEmpresa, sortColumn, sortAsc]);

  const handleExportCSV = () => {
    exportToCSV(filteredIndicadores, isDemoMode);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  async function handleSaveEdit(id: string) {
    try {
      const updates: Partial<IndicadoresParceiro> = { ...editValues };
      delete (updates as any).empresa;
      delete (updates as any).oportunidadesIndicadas;
      delete (updates as any).share_of_wallet;

      const { error } = await supabase
        .from("indicadores_parceiro")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Indicador atualizado com sucesso." });
      setEditRowId(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao atualizar indicador.", variant: "destructive" });
    }
  }

  function handleEdit(indicador: IndicadoresParceiroWithEmpresa) {
    setEditRowId(indicador.id);
    setEditValues({ ...indicador });
  }

  function handleCancelEdit() {
    setEditRowId(null);
    setEditValues({});
  }

  function handleEditValueChange(field: string, value: any) {
    setEditValues((v) => ({ ...v, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Indicadores de Performance</h1>
          <p className="text-muted-foreground">
            Avalie e gerencie indicadores de parceiros estratégicos
          </p>
        </div>
        <IndicadoresFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedEmpresa={selectedEmpresa}
          setSelectedEmpresa={setSelectedEmpresa}
          empresas={empresas}
          onExportCSV={handleExportCSV}
          onRefresh={fetchAll}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando indicadores...</p>
        </div>
      ) : (
        <>
          <IndicadoresCharts
            filteredIndicadores={filteredIndicadores}
            selectedEmpresa={selectedEmpresa}
          />
          
          <IndicadoresTable
            filteredIndicadores={filteredIndicadores}
            sortColumn={sortColumn}
            sortAsc={sortAsc}
            onSort={handleSort}
            editRowId={editRowId}
            editValues={editValues}
            onEdit={handleEdit}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onEditValueChange={handleEditValueChange}
          />
        </>
      )}
    </div>
  );
};

export default IndicadoresPage;
