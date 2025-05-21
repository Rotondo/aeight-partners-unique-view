import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empresa, TipoEmpresa } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface OnePager {
  id: string;
  empresa_id: string;
  categoria_id: string;
  url_imagem: string | null;
  arquivo_upload: string | null;
  data_upload: string;
  empresa?: {
    nome: string;
  };
  categoria?: {
    nome: string;
  };
}

export const OnePagerList: React.FC = () => {
  const [onepagers, setOnepagers] = useState<OnePager[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<{id: string, nome: string}[]>([]);
  const [loading, setLoading] = useState(true);
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
      setOnepagers(data as OnePager[]);
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
      
      // Convert the raw data to match the Empresa type
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
              <TableHead>Imagem</TableHead>
              <TableHead>Arquivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {onepagers.map((onepager) => (
              <TableRow key={onepager.id}>
                <TableCell>{onepager.empresa?.nome}</TableCell>
                <TableCell>{onepager.categoria?.nome}</TableCell>
                <TableCell>{formatDataUpload(onepager.data_upload)}</TableCell>
                <TableCell>
                  {onepager.url_imagem && (
                    <a href={onepager.url_imagem} target="_blank" rel="noopener noreferrer">
                      Ver Imagem <ExternalLink className="inline-block h-4 w-4 ml-1" />
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {onepager.arquivo_upload && (
                    <a href={onepager.arquivo_upload} target="_blank" rel="noopener noreferrer">
                      Ver Arquivo <ExternalLink className="inline-block h-4 w-4 ml-1" />
                    </a>
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
