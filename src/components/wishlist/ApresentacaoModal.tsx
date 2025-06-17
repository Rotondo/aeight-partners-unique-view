
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ApresentacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  apresentacaoCliente: any;
  apresentacaoObs: string;
  setApresentacaoObs: (obs: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

const ApresentacaoModal: React.FC<ApresentacaoModalProps> = ({
  isOpen,
  onClose,
  apresentacaoCliente,
  apresentacaoObs,
  setApresentacaoObs,
  onSubmit,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Apresentação</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="font-medium mb-2">
              Cliente:{" "}
              <span className="font-normal">
                {apresentacaoCliente?.empresa_cliente?.nome}
              </span>
            </div>
            <div className="font-medium mb-2">
              Proprietário:{" "}
              <span className="font-normal">
                {apresentacaoCliente?.empresa_proprietaria?.nome}
              </span>
            </div>
            <Input
              placeholder="Observações para a apresentação"
              value={apresentacaoObs}
              onChange={(e) => setApresentacaoObs(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              Solicitar Apresentação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApresentacaoModal;
