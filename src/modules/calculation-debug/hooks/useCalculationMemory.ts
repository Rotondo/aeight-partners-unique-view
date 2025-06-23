
import { useMemo } from 'react';

export interface CalculationStep {
  step: string;
  description: string;
  input: any;
  output: any;
  formula?: string;
  validation?: string;
}

export interface CalculationMemory {
  id: string;
  title: string;
  steps: CalculationStep[];
  finalResult: any;
  metadata: {
    timestamp: number;
    baseDataCount: number;
    filteredDataCount: number;
  };
}

export const useCalculationMemory = () => {
  const memories = useMemo(() => new Map<string, CalculationMemory>(), []);

  const startCalculation = (id: string, title: string, baseData: any[]): CalculationMemory => {
    const memory: CalculationMemory = {
      id,
      title,
      steps: [],
      finalResult: null,
      metadata: {
        timestamp: Date.now(),
        baseDataCount: baseData.length,
        filteredDataCount: 0
      }
    };
    memories.set(id, memory);
    return memory;
  };

  const addStep = (
    calculationId: string, 
    step: string, 
    description: string, 
    input: any, 
    output: any, 
    formula?: string,
    validation?: string
  ) => {
    const memory = memories.get(calculationId);
    if (memory) {
      memory.steps.push({
        step,
        description,
        input,
        output,
        formula,
        validation
      });
      console.log(`[${calculationId}] ${step}: ${description}`, { input, output, formula });
    }
  };

  const finishCalculation = (calculationId: string, finalResult: any) => {
    const memory = memories.get(calculationId);
    if (memory) {
      memory.finalResult = finalResult;
      memory.metadata.filteredDataCount = memory.steps.find(s => s.step === 'filter')?.output?.length || 0;
      console.log(`[${calculationId}] Cálculo finalizado:`, finalResult);
    }
  };

  const getCalculationMemory = (id: string): CalculationMemory | undefined => {
    return memories.get(id);
  };

  const getAllMemories = (): CalculationMemory[] => {
    return Array.from(memories.values());
  };

  const clearMemories = () => {
    memories.clear();
  };

  return {
    startCalculation,
    addStep,
    finishCalculation,
    getCalculationMemory,
    getAllMemories,
    clearMemories
  };
};
