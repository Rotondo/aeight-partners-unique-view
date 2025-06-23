
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCalculationMemory } from '../hooks/useCalculationMemory';
import { useDataValidation } from '../hooks/useDataValidation';
import { Oportunidade } from '@/types';

interface CalculationDebugPanelProps {
  oportunidades: Oportunidade[];
  isVisible: boolean;
  onToggle: () => void;
}

export const CalculationDebugPanel: React.FC<CalculationDebugPanelProps> = ({
  oportunidades,
  isVisible,
  onToggle
}) => {
  const [expandedCalculations, setExpandedCalculations] = useState<Set<string>>(new Set());
  const { getAllMemories, clearMemories } = useCalculationMemory();
  const validationSummary = useDataValidation(oportunidades);
  
  const memories = getAllMemories();

  const toggleCalculation = (id: string) => {
    const newExpanded = new Set(expandedCalculations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCalculations(newExpanded);
  };

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50"
      >
        <Calculator className="h-4 w-4 mr-2" />
        Debug Cálculos
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Debug dos Cálculos
          </span>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validação de Dados */}
        <div>
          <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
            {validationSummary.isAllValid ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            Validação dos Dados
          </h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total de oportunidades:</span>
              <Badge variant="outline">{oportunidades.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Validações:</span>
              <Badge variant={validationSummary.isAllValid ? "default" : "destructive"}>
                {validationSummary.passedValidations}/{validationSummary.totalValidations}
              </Badge>
            </div>
            {!validationSummary.isAllValid && (
              <div className="mt-2">
                {validationSummary.results
                  .filter(r => !r.isValid)
                  .map((result, index) => (
                    <div key={index} className="text-xs text-red-600">
                      • {result.message}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Memórias de Cálculo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium">Memória de Cálculos</h4>
            <Button variant="ghost" size="sm" onClick={clearMemories}>
              Limpar
            </Button>
          </div>
          <div className="space-y-2">
            {memories.map((memory) => (
              <Collapsible key={memory.id}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full text-xs p-2 border rounded"
                  onClick={() => toggleCalculation(memory.id)}
                >
                  <span>{memory.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {memory.steps.length} etapas
                    </Badge>
                    {expandedCalculations.has(memory.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 bg-gray-50 rounded-b">
                  <div className="space-y-2">
                    <div className="text-xs">
                      <strong>Base:</strong> {memory.metadata.baseDataCount} registros
                    </div>
                    {memory.steps.map((step, index) => (
                      <div key={index} className="text-xs border-l-2 border-gray-300 pl-2">
                        <div className="font-medium">{step.step}: {step.description}</div>
                        {step.formula && (
                          <div className="text-gray-600">Fórmula: {step.formula}</div>
                        )}
                        <div className="text-gray-600">
                          Resultado: {JSON.stringify(step.output)}
                        </div>
                        {step.validation && (
                          <div className="text-green-600">✓ {step.validation}</div>
                        )}
                      </div>
                    ))}
                    <div className="text-xs font-medium border-t pt-1">
                      <strong>Resultado Final:</strong> {JSON.stringify(memory.finalResult)}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
