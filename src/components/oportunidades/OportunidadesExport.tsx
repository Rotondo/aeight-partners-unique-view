// (igual ao original, funcional, sem alteração necessária para este contexto)
import React, { useState } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download } from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ExportField {
  key: string;
  label: string;
  format?: (value: any) => string;
}

export const OportunidadesExport: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { filteredOportunidades } = useOportunidades();
  const [exportFormat, setExportFormat] = useState<"excel" | "csv" | "pdf">("excel");
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "data_indicacao",
    "empresa_origem",
    "empresa_destino",
    "contato",
    "valor",
    "status"
  ]);

  const availableFields: ExportField[] = [
    { key: "data_indicacao", label: "Data Indicação", format: (value) => formatDate(value) },
    { key: "empresa_origem", label: "Empresa Origem", format: (empresa) => empresa?.nome || "-" },
    { key: "empresa_destino", label: "Empresa Destino", format: (empresa) => empresa?.nome || "-" },
    { key: "contato", label: "Contato", format: (contato) => contato?.nome || "-" },
    { key: "valor", label: "Valor", format: (value) => formatCurrency(value) },
    { key: "status", label: "Status", format: (value) => formatStatus(value) },
    { key: "data_fechamento", label: "Data Fechamento", format: (value) => formatDate(value) },
    { key: "usuario_envio", label: "Responsável Origem", format: (usuario) => usuario?.nome || "-" },
    { key: "usuario_recebe", label: "Responsável Destino", format: (usuario) => usuario?.nome || "-" },
    { key: "observacoes", label: "Observações" },
    { key: "motivo_perda", label: "Motivo Perda" }
  ];

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "em_contato": return "Em Contato";
      case "negociando": return "Negociando";
      case "ganho": return "Ganho";
      case "perdido": return "Perdido";
      default: return status;
    }
  };

  const exportToCSV = () => {
    const fields = availableFields.filter(f => selectedFields.includes(f.key));
    const headers = fields.map(f => f.label).join(',');
    const rows = filteredOportunidades.map(op => {
      return fields.map(field => {
        let value;
        if (field.key.includes('.')) {
          const keyParts = field.key.split('.');
          let tempValue: any = op;
          for (const part of keyParts) {
            if (tempValue && typeof tempValue === 'object') {
              tempValue = tempValue[part as keyof typeof tempValue];
            } else {
              tempValue = undefined;
              break;
            }
          }
          value = tempValue;
        } else {
          value = (op as any)[field.key];
        }
        let formattedValue = field.format ? field.format(value) : (value || "-");
        if (typeof formattedValue === 'string' && (
          formattedValue.includes(',') || 
          formattedValue.includes('"') ||
          formattedValue.includes('\n')
        )) {
          formattedValue = `"${formattedValue.replace(/"/g, '""')}"`;
        }
        return formattedValue;
      }).join(',');
    }).join('\n');
    const csv = `${headers}\n${rows}`;
    downloadFile(csv, 'oportunidades.csv', 'text/csv');
  };

  const exportToExcel = () => {
    const fields = availableFields.filter(f => selectedFields.includes(f.key));
    let excelData = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                <x:Name>Oportunidades</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
            </xml>
          <![endif]-->
          <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        </head>
        <body>
          <table>
            <tr>
              ${fields.map(f => `<th>${f.label}</th>`).join('')}
            </tr>
    `;
    filteredOportunidades.forEach(op => {
      excelData += '<tr>';
      fields.forEach(field => {
        let value;
        if (field.key.includes('.')) {
          const keyParts = field.key.split('.');
          let tempValue: any = op;
          for (const part of keyParts) {
            if (tempValue && typeof tempValue === 'object') {
              tempValue = tempValue[part as keyof typeof tempValue];
            } else {
              tempValue = undefined;
              break;
            }
          }
          value = tempValue;
        } else {
          value = (op as any)[field.key];
        }
        const formattedValue = field.format ? field.format(value) : (value || "-");
        excelData += `<td>${formattedValue}</td>`;
      });
      excelData += '</tr>';
    });
    excelData += '</table></body></html>';
    downloadFile(excelData, 'oportunidades.xls', 'application/vnd.ms-excel');
  };

  const exportToPDF = () => {
    alert('Exportação para PDF seria implementada aqui, possivelmente utilizando jsPDF ou outra biblioteca.');
  };

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExport = () => {
    if (filteredOportunidades.length === 0) {
      alert('Não há oportunidades para exportar.');
      return;
    }
    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-medium">Formato de Exportação</h3>
        <RadioGroup
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as "excel" | "csv" | "pdf")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="excel" id="excel" />
            <Label htmlFor="excel">Excel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv">CSV</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label htmlFor="pdf">PDF</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <h3 className="mb-2 font-medium">Campos para Exportar</h3>
        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
          {availableFields.map((field) => (
            <div key={field.key} className="flex items-center space-x-2">
              <Checkbox
                id={field.key}
                checked={selectedFields.includes(field.key)}
                onCheckedChange={() => toggleField(field.key)}
              />
              <Label htmlFor={field.key}>{field.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar {filteredOportunidades.length} registro(s)
        </Button>
      </div>
    </div>
  );
};
