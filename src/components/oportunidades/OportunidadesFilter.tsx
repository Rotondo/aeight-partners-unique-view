import React, { useState, useEffect } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  OportunidadesFilterParams,
  Usuario,
  StatusOportunidade,
} from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { usePartnersAndIntragroup } from "@/hooks/usePartners";

export const OportunidadesFilter: React.FC = () => {
  const { filterParams, setFilterParams } = useOportunidades();
  const { partners: empresas, loading: empresasLoading } = usePartnersAndIntragroup();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [tempFilters, setTempFilters] = useState<OportunidadesFilterParams>({
    dataInicio: filterParams.dataInicio,
    dataFim: filterParams.dataFim,
    empresaOrigemId: filterParams.empresaOrigemId,
    empresaDestinoId: filterParams.empresaDestinoId,
    status: filterParams.status,
    usuarioId: filterParams.usuarioId,
    valorStatus: filterParams.valorStatus,
  });

  // Aplicar busca por texto em tempo real
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilterParams({
        ...filterParams,
        searchTerm: searchTerm || undefined
      });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const { data: usuariosData, error: usuariosError } = await supabase
          .from("usuarios")
          .select("id, nome, email, empresa_id, papel, ativo")
          .order("nome");

        if (usuariosError) throw usuariosError;

        if (usuariosData) {
          setUsuarios(usuariosData as Usuario[]);
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários para filtros.",
          variant: "destructive",
        });
      }
    }

    fetchUsuarios();
  }, [toast]);

  const applyFilters = () => {
    setFilterParams(tempFilters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    const resetFilterParams: OportunidadesFilterParams = {};
    setTempFilters(resetFilterParams);
    setFilterParams(resetFilterParams);
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  const formatDateStr = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  const hasActiveFilters = () => {
    return Object.values(filterParams).some((value) => value !== undefined && value !== "");
  };

  // Função para obter o label do tipo de empresa
  const getEmpresaLabel = (empresa: typeof empresas[0]) => {
    const tipoLabel = empresa.tipo === 'intragrupo' ? '[IG]' : '[P]';
    return `${tipoLabel} ${empresa.nome}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar oportunidades por nome do lead..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex items-center gap-2",
                hasActiveFilters() && "bg-primary/20"
              )}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters() && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {Object.values(filterParams).filter(
                    (val) => val !== undefined && val !== ""
                  ).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>Filtrar oportunidades</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="p-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Data Início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempFilters.dataInicio && "text-muted-foreground"
                        )}
                      >
                        {tempFilters.dataInicio
                          ? formatDateStr(tempFilters.dataInicio)
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          tempFilters.dataInicio
                            ? new Date(tempFilters.dataInicio)
                            : undefined
                        }
                        onSelect={(date) =>
                          setTempFilters({
                            ...tempFilters,
                            dataInicio: date ? date.toISOString() : undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Data Fim</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tempFilters.dataFim && "text-muted-foreground"
                        )}
                      >
                        {tempFilters.dataFim
                          ? formatDateStr(tempFilters.dataFim)
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          tempFilters.dataFim
                            ? new Date(tempFilters.dataFim)
                            : undefined
                        }
                        onSelect={(date) =>
                          setTempFilters({
                            ...tempFilters,
                            dataFim: date ? date.toISOString() : undefined,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Empresa de origem</label>
                <Select
                  value={tempFilters.empresaOrigemId ?? "all"}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      empresaOrigemId: value === "all" ? undefined : value,
                    })
                  }
                  disabled={empresasLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={empresasLoading ? "Carregando..." : "Todas as empresas"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {empresas
                      .sort((a, b) => {
                        // Ordenar primeiro por tipo (intragrupo antes de parceiro), depois por nome
                        if (a.tipo !== b.tipo) {
                          return a.tipo === 'intragrupo' ? -1 : 1;
                        }
                        return a.nome.localeCompare(b.nome);
                      })
                      .map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {getEmpresaLabel(empresa)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Empresa de destino</label>
                <Select
                  value={tempFilters.empresaDestinoId ?? "all"}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      empresaDestinoId: value === "all" ? undefined : value,
                    })
                  }
                  disabled={empresasLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={empresasLoading ? "Carregando..." : "Todas as empresas"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {empresas
                      .sort((a, b) => {
                        // Ordenar primeiro por tipo (intragrupo antes de parceiro), depois por nome
                        if (a.tipo !== b.tipo) {
                          return a.tipo === 'intragrupo' ? -1 : 1;
                        }
                        return a.nome.localeCompare(b.nome);
                      })
                      .map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {getEmpresaLabel(empresa)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={tempFilters.status ?? "all"}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      status: value === "all" ? undefined : (value as StatusOportunidade),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="em_contato">Em Contato</SelectItem>
                    <SelectItem value="negociando">Negociando</SelectItem>
                    <SelectItem value="ganho">Ganho</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                    <SelectItem value="Contato">Contato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Responsável</label>
                <Select
                  value={tempFilters.usuarioId ?? "all"}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      usuarioId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Valor</label>
                <Select
                  value={tempFilters.valorStatus ?? "all"}
                  onValueChange={(value) =>
                    setTempFilters({
                      ...tempFilters,
                      valorStatus: value === "all" ? undefined : (value as "all" | "com_valor" | "sem_valor"),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="com_valor">Com valor</SelectItem>
                    <SelectItem value="sem_valor">Sem valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={resetFilters}>
                  Limpar Filtros
                </Button>
                <Button onClick={applyFilters}>Aplicar Filtros</Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2">
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Busca: {searchTerm}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.dataInicio && (
            <Badge variant="outline" className="flex items-center gap-1">
              Início: {formatDateStr(filterParams.dataInicio)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, dataInicio: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.dataFim && (
            <Badge variant="outline" className="flex items-center gap-1">
              Fim: {formatDateStr(filterParams.dataFim)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, dataFim: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.empresaOrigemId && (
            <Badge variant="outline" className="flex items-center gap-1">
              Origem: {empresas.find((e) => e.id === filterParams.empresaOrigemId)?.nome || "Desconhecida"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, empresaOrigemId: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.empresaDestinoId && (
            <Badge variant="outline" className="flex items-center gap-1">
              Destino: {empresas.find((e) => e.id === filterParams.empresaDestinoId)?.nome || "Desconhecida"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, empresaDestinoId: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.status && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status:{" "}
              {filterParams.status === "em_contato"
                ? "Em Contato"
                : filterParams.status === "negociando"
                ? "Negociando"
                : filterParams.status === "ganho"
                ? "Ganho"
                : filterParams.status === "perdido"
                ? "Perdido"
                : filterParams.status === "Contato"
                ? "Contato"
                : "Desconhecido"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, status: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.usuarioId && (
            <Badge variant="outline" className="flex items-center gap-1">
              Responsável: {usuarios.find((u) => u.id === filterParams.usuarioId)?.nome || "Desconhecido"}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, usuarioId: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filterParams.valorStatus && (
            <Badge variant="outline" className="flex items-center gap-1">
              Valor: {filterParams.valorStatus === "com_valor" ? "Com valor" : filterParams.valorStatus === "sem_valor" ? "Sem valor" : filterParams.valorStatus}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() =>
                  setFilterParams({ ...filterParams, valorStatus: undefined })
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
