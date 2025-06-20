
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TooltipHelper, tooltipTexts } from './TooltipHelper';
import type { Meta } from '@/types/metas';

const metaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo_meta: z.enum(['quantidade', 'valor']),
  valor_meta: z.number().min(1, 'Valor da meta deve ser maior que 0'),
  periodo: z.enum(['mensal', 'trimestral']),
  ano: z.number().min(2020).max(2030),
  mes: z.number().min(1).max(12).optional(),
  trimestre: z.number().min(1).max(4).optional(),
  segmento_grupo: z.enum(['intragrupo', 'de_fora_para_dentro', 'tudo']),
  status_oportunidade: z.enum(['todas', 'ganhas']),
  empresa_id: z.string().optional()
});

type MetaFormData = z.infer<typeof metaSchema>;

interface MetaFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: MetaFormData) => Promise<void>;
  meta?: Meta;
}

export const MetaForm: React.FC<MetaFormProps> = ({ open, onClose, onSave, meta }) => {
  const form = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: meta ? {
      nome: meta.nome,
      descricao: meta.descricao || '',
      tipo_meta: meta.tipo_meta,
      valor_meta: meta.valor_meta,
      periodo: meta.periodo,
      ano: meta.ano,
      mes: meta.mes,
      trimestre: meta.trimestre,
      segmento_grupo: meta.segmento_grupo,
      status_oportunidade: meta.status_oportunidade,
      empresa_id: meta.empresa_id
    } : {
      nome: '',
      descricao: '',
      tipo_meta: 'quantidade',
      valor_meta: 0,
      periodo: 'mensal',
      ano: new Date().getFullYear(),
      segmento_grupo: 'tudo',
      status_oportunidade: 'todas'
    }
  });

  const periodo = form.watch('periodo');

  const handleSubmit = async (data: MetaFormData) => {
    try {
      await onSave(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {meta ? 'Editar Meta' : 'Nova Meta'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Meta</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Oportunidades Q1 2024" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_meta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Meta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="quantidade">Quantidade</SelectItem>
                        <SelectItem value="valor">Valor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descrição opcional da meta" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor_meta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Meta</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Ex: 1000000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="segmento_grupo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Segmento
                      <TooltipHelper content="Define qual segmento de oportunidades será considerado para a meta" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tudo">Tudo</SelectItem>
                        <SelectItem value="intragrupo">Intragrupo</SelectItem>
                        <SelectItem value="de_fora_para_dentro">De Fora para Dentro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status_oportunidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Status da Oportunidade
                    <TooltipHelper content="Define se considera todas as oportunidades criadas ou apenas as fechadas com sucesso" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Oportunidades</SelectItem>
                      <SelectItem value="ganhas">Apenas Oportunidades Ganhas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="2024"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {periodo === 'mensal' && (
                <FormField
                  control={form.control}
                  name="mes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mês</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {periodo === 'trimestral' && (
                <FormField
                  control={form.control}
                  name="trimestre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trimestre</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Trimestre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {meta ? 'Atualizar' : 'Criar'} Meta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
