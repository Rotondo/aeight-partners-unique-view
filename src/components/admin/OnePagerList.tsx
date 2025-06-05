
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Empresa, TipoEmpresa, OnePager } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Eye } from "lucide-react";
import OnePagerViewer from "@/components/onepager/OnePagerViewer";

interface OnePagerWithRelations extends OnePager {
  empresa?: {
    nome: string;
  };
  categoria?: {
    nome: string;
  };
}

export const OnePagerList: React.FC = () => {
  const [onepagers, setOnepagers] = useState<OnePagerWithRelations[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOnePager, setSelectedOnePager] = useState<OnePager | null>(null);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOnePagers();
    fetchEmpresas();
    fetchCategorias();
  }, []);

  const fetchOnePagers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("onepager")
        .select(`
          *,
          empresa:empresas(nome),
          categoria:categorias(nome)
        `)
        .order("data_upload", { ascending: false });

      if (error) throw error;
      setOnepagers(data as OnePagerWithRelations[]);
    } catch (error) {
      console.error("Erro ao buscar one-pagers:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os one-pagers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (error) throw error;
      
      const typedData: Empresa[] = data.map(item => ({
        ...item,
        tipo: item.tipo as TipoEmpresa
      }));
      
      setEmpresas(typedData);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome");

      if (error) throw error;
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    }
  };

  const formatDataUpload = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const handleViewOnePager = (onepager: OnePagerWithRelations) => {
    const parceiro = empresas.find(e => e.id === onepager.empresa_id);
    setSelectedOnePager(onepager);
    setSelectedParceiro(parceiro || null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">One-Pagers</h2>
      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data Upload</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {onepagers.map((onepager) => (
              <TableRow key={onepager.id}>
                <TableCell>{onepager.empresa?.nome}</TableCell>
                <TableCell>{onepager.categoria?.nome}</TableCell>
                <TableCell>{formatDataUpload(onepager.data_upload)}</TableCell>
                <TableCell className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOnePager(onepager)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver OnePager
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>OnePager - {selectedParceiro?.nome}</DialogTitle>
                      </DialogHeader>
                      <OnePagerViewer
                        onePager={selectedOnePager}
                        parceiro={selectedParceiro}
                        isLoading={false}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  {onepager.url_imagem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(onepager.url_imagem!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Link Direto
                    </Button>
                  )}
                  
                  {onepager.arquivo_upload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const { data } = supabase.storage
                          .from('onepagers')
                          .getPublicUrl(onepager.arquivo_upload!);
                        window.open(data.publicUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Arquivo
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
