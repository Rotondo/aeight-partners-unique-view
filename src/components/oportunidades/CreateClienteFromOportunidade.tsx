
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";

interface Oportunidade {
  id: string;
  nome_lead: string;
  empresa_origem?: { nome: string };
  empresa_destino?: { nome: string };
}

interface CreateClienteFromOportunidadeProps {
  oportunidades: Oportunidade[];
  onSuccess: () => void;
}

export const CreateClienteFromOportunidade: React.FC<CreateClienteFromOportunidadeProps> = ({
  oportunidades,
  onSuccess,
}) => {
  const [selectedOportunidades, setSelectedOportunidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectOportunidade = (oportunidadeId: string, checked: boolean) => {
    if (checked) {
      setSelectedOportunidades(prev => [...prev, oportunidadeId]);
    } else {
      setSelectedOportunidades(prev => prev.filter(id => id !== oportunidadeId));
    }
  };

  const handleCreateClientes = async () => {
    if (selectedOportunidades.length === 0) {
      toast({
        title: "Nenhuma oportunidade selecionada",
        description: "Selecione pelo menos uma oportunidade para criar cliente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar oportunidades selecionadas
      const selectedOps = oportunidades.filter(op => selectedOportunidades.includes(op.id));
      
      // CORREÇÃO: Criar clientes com tipo 'cliente' explicitamente
      const clientesToCreate = selectedOps.map(op => ({
        nome: op.nome_lead,
        tipo: 'cliente' as const,
        status: true,
        descricao: `Cliente criado automaticamente a partir da oportunidade: ${op.nome_lead}`
      }));

      console.log('[CreateClienteFromOportunidade] Criando clientes:', {
        total: clientesToCreate.length,
        tipo: 'cliente'
      });

      const { data, error } = await supabase
        .from("empresas")
        .insert(clientesToCreate)
        .select();

      if (error) throw error;

      toast({
        title: "Clientes criados com sucesso",
        description: `${data.length} cliente(s) foram criados a partir das oportunidades selecionadas.`,
      });

      setSelectedOportunidades([]);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar clientes:", error);
      toast({
        title: "Erro ao criar clientes",
        description: "Não foi possível criar os clientes. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar oportunidades que ainda não são clientes
  const oportunidadesDisponiveis = oportunidades.filter(op => op.nome_lead && op.nome_lead.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Criar Clientes das Oportunidades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Criar Clientes a partir de Oportunidades</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione as oportunidades para criar clientes automaticamente. 
            O nome do cliente será o nome da oportunidade.
          </p>
          
          {oportunidadesDisponiveis.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma oportunidade disponível para criar cliente.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {oportunidadesDisponiveis.map((oportunidade) => (
                <div key={oportunidade.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    id={oportunidade.id}
                    checked={selectedOportunidades.includes(oportunidade.id)}
                    onCheckedChange={(checked) => 
                      handleSelectOportunidade(oportunidade.id, checked as boolean)
                    }
                  />
                  <label htmlFor={oportunidade.id} className="text-sm flex-1 cursor-pointer">
                    <div className="font-medium">{oportunidade.nome_lead}</div>
                    <div className="text-xs text-muted-foreground">
                      {oportunidade.empresa_origem?.nome} → {oportunidade.empresa_destino?.nome}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateClientes}
              disabled={loading || selectedOportunidades.length === 0}
            >
              {loading ? "Criando..." : `Criar ${selectedOportunidades.length} Cliente(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
