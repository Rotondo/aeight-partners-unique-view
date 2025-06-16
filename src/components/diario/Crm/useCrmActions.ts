import { useDiario } from "@/contexts/DiarioContext";

// Hook para manipular registros CRM (CRUD)
export function useCrmActions() {
  const { crmActions, setCrmActions } = useDiario();

  const addAction = (action: any) => {
    setCrmActions([...crmActions, action]);
  };

  // TODO: implementar update, delete conforme necessário

  return { crmActions, addAction };
}