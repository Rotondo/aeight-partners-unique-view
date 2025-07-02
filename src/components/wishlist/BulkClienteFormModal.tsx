import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Check, AlertCircle, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBulkClienteOperations } from "@/hooks/useBulkClienteOperations";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface BulkClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresasParceiros: EmpresaOption[];
  fetchEmpresasClientes: () => Promise<void>;
}

const BulkClienteFormModal: React.FC<BulkClienteFormModalProps> = ({
  isOpen,
  onClose,
  empresasParceiros,
  fetchEmpresasClientes,
}) => {
  const [parceiroSelecionado, setParceiroSelecionado] = useState("");
  const [clientesText, setClientesText] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { processBulkClients, processing, progress } = useBulkClienteOperations(fetchEmpresasClientes);

  const clienteNames = clientesText
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parceiroSelecionado || clienteNames.length === 0) return;

    const result = await processBulkClients(clienteNames, parceiroSelecionado, observacoes);
    setResults(result.results);
    setShowResults(true);
  };

  const handleClose = () => {
    setParceiroSelecionado("");
    setClientesText("");
    setObservacoes("");
    setResults([]);
    setShowResults(false);
    onClose();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Check className="h-4 w-4 text-green-600" />;
      case "linked":
        return <Link className="h-4 w-4 text-blue-600" />;
      case "duplicate":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return <Badge variant="default" className="bg-green-100 text-green-800">Criado</Badge>;
      case "linked":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Vinculado</Badge>;
      case "duplicate":
        return <Badge variant="secondary">Já vinculado</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultados do Processamento em Lote</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.action === "created").length}
                </div>
                <div className="text-sm text-green-600">Criados</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.filter(r => r.action === "linked").length}
                </div>
                <div className="text-sm text-blue-600">Vinculados</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.action === "duplicate").length}
                </div>
                <div className="text-sm text-yellow-600">Duplicados</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.action === "error").length}
                </div>
                <div className="text-sm text-red-600">Erros</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Detalhes por Cliente:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getActionIcon(result.action)}
                      <span className="font-medium">{result.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getActionBadge(result.action)}
                      <span className="text-sm text-muted-foreground">{result.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Múltiplos Clientes</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Parceiro Proprietário *
            </label>
            <select
              value={parceiroSelecionado}
              onChange={(e) => setParceiroSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              required
            >
              <option value="" disabled>
                Selecione o parceiro proprietário
              </option>
              {empresasParceiros.map((parceiro) => (
                <option key={parceiro.id} value={parceiro.id}>
                  {parceiro.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Lista de Clientes *
            </label>
            <Textarea
              value={clientesText}
              onChange={(e) => setClientesText(e.target.value)}
              placeholder="Digite um nome de cliente por linha:&#10;&#10;Empresa ABC&#10;Consultoria XYZ&#10;Indústria 123"
              className="min-h-32"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digite um nome de cliente por linha. Clientes existentes serão apenas vinculados, novos clientes serão criados.
            </p>
            {clienteNames.length > 0 && (
              <p className="text-sm text-blue-600 mt-1">
                {clienteNames.length} cliente(s) detectado(s)
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Observações (opcional)
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações que serão aplicadas a todos os relacionamentos"
              rows={2}
            />
          </div>

          {processing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processando clientes...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% concluído
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={processing || !parceiroSelecionado || clienteNames.length === 0}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Processar {clienteNames.length} Cliente(s)
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkClienteFormModal;